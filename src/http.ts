import * as https from 'node:https';
import * as http from 'node:http';
import { HttpServer } from './interfaces/http-server';
import { HttpError } from './interfaces/http-error';
import {FileStorage} from "@flystorage/file-storage";
import {Logger} from "./logging";

/**
  * Perform a POST request to the server and return the result in a promise
  * @param server - server configuration
  * @param requestPath - path of the request
  * @param token - token for authorization
  * @param body - body of the request
  * @returns a promise that resolves when the request is complete
  */
export function postWithBody<I, O>(server: HttpServer, requestPath: string, token: string, body: I): Promise<O> {
  return new Promise((resolve, reject) => {
    const postData: string = JSON.stringify(body);
    const options: http.RequestOptions = buildOptions(server, 'POST', requestPath, token, postData);

    const incomingMessage: Promise<http.IncomingMessage> = server.secure ? doSecureRequest(options, postData): doRequest(options, postData);

    incomingMessage.then(res => {
      return handleJsonResult(requestPath, res, resolve, reject); 
    })
  })
}

/**
  * Perform a GET request to the server and store the result in a file
  * @param server - server configuration
  * @param requestPath - path of the request
  * @param token - token for authorization
  * @param fileName - name of the file to save the result to
  * @param storage - storage provider to use to save the file
  * @returns a promise that resolves when the file is saved
  */
export function saveToFile(server: HttpServer, requestPath: string, token: string, fileName: string, storage: FileStorage): Promise<void> {

  Logger.info(`Requesting to download ${fileName}`)
  const options = buildOptions(server, 'GET', requestPath, token);
  const incomingMessage: Promise<http.IncomingMessage> = server.secure ? doSecureRequest(options): doRequest(options);

  return incomingMessage.then(response => {
    if (response.statusCode === 200) {
      Logger.debug(`Starting to download ${fileName}`)
      return storage.write(fileName, response).then(() => {
        Logger.info(`Successfully stored ${fileName}`);
        return Promise.resolve()
      })
    } else {
      return Promise.reject(handleUnexpectedResponse(response.statusCode, 'GET', requestPath));
    }

  })

}

/**
  *
  * Perform a DELETE request to the server
  * @param server - server configuration
  * @param requestPath - path of the request
  * @param token - token for authorization
  * @returns a promise that resolves when the request is complete
  */
export function del(server: HttpServer, requestPath: string, token: string): Promise<void> {
	return new Promise((resolve, reject) => {
    const options = buildOptions(server, 'DELETE', requestPath, token);

    Logger.info(`Removing file at ${requestPath}`)
    const incomingMessage: Promise<http.IncomingMessage> = server.secure ? doSecureRequest(options): doRequest(options);

    incomingMessage.then(res => {
      if (res.statusCode === 204) {
        Logger.debug(`Successfully removed : ${requestPath}`)
        resolve();
      } else {
        reject(handleUnexpectedResponse(res.statusCode, 'DELETE', requestPath));
      }
    })

	})

}

/**
  * Peforms secure request
  * @param options - request options
  * @param postData - data to be sent in the request
  * @returns a promise that resolves when the request is complete
  */
function doSecureRequest(options: https.RequestOptions, postData?: string): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    https.request(options, resolve).on('error', (error) =>
      reject(buildLocalError(`Failed to perform request to ${options.path}. Error: ${error.message}`))
    ).end(postData);
  })
}

/**
  * Peforms insecure request
  * @param options - request options
  * @param postData - data to be sent in the request
  * @returns a promise that resolves when the request is complete
  */
function doRequest(options: https.RequestOptions, postData?: string): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    http.request(options, resolve).on('error', (error) =>
      reject(buildLocalError(`Failed to perform request to ${options.path}. Error: ${error.message}`))
    ).end(postData);
  })
}

/**
  * Handle the result of a http/https request and call the resolve with the parsed JSON data or reject with an error
  * @param requestPath  - path of the request - to be used for logging purposes
  * @param res - incoming message
  * @param resolve - resolve function
  * @param reject - reject function
  */
function handleJsonResult<O>(requestPath: string, res: http.IncomingMessage, resolve: (value: O) => void, reject: (reason?: any) => void): void {
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const parsedData: O = JSON.parse(rawData);
        resolve(parsedData);
      } catch (e) {
        reject(buildLocalError(`Failed to parse JSON data. Error ${e.message}`));
      }
    } else {
      reject(handleUnexpectedResponse(res.statusCode, 'POST', requestPath));
    }
  });
}

/**
  * Build options for a request
  * @param server - server configuration
  * @param method - HTTP method
  * @param requestPath - path of the request
  * @param token - token for authorization
  * @param postData - data to be sent in the request
  * @returns request options
  */
function buildOptions(server: HttpServer, method: string, requestPath: string, token: string, postData?: string): http.RequestOptions {
  const options: http.RequestOptions = {
    hostname: server.hostname,
    port: server.port,
    path: requestPath,
    headers: {
      'Authorization': 'Bearer ' + token,
    },
    method: method,
    timeout: 20000,
    agent: false
  }

  if (postData) {
    return {
      ...options
      , headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
    }
  } else {
    return options;
  }
}


/**
  * handle unexpected response from the server
  * @param statusCode - status code of the response
  * @param method - HTTP method
  * @param requestPath - path of the request
  * @returns an error object
  */
function handleUnexpectedResponse(statusCode: number, method: string, requestPath: string): HttpError {
  switch(statusCode) {
    case 401: {
      return {
        status: statusCode,
        message: `Failed to authenticate the request. Check the token and try again.`,
        fatal: true
      }
    }

    case 404: {
      return {
        status: statusCode,
        message: `${requestPath} not found.`,
        fatal: false
      }
    }

    default: {
      return {
        status: statusCode,
        message: `Failed to ${method} ${requestPath}.`,
        fatal: false
      }
    }

  }
}

/**
  * Build an error caused by the application, not the server
  * @param message - error message
  * @returns an error object
  */
function buildLocalError(message: string): HttpError {
  return {
    status: 0,
    message: message,
    fatal: false
  }
}
