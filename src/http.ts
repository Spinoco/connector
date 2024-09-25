import * as fs from 'node:fs';
import * as https from 'node:https';
import * as http from 'node:http';
import { HttpServer } from './interfaces/http-server';

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
      return handleJsonResult(res, resolve, reject); 
    })
  })
}

/**
  * Perform a GET request to the server and store the result in a file
  * @param server - server configuration
  * @param requestPath - path of the request
  * @param token - token for authorization
  * @param fileName - name of the file to save the result to
  * @returns a promise that resolves when the file is saved
  */
export function saveToFile(server: HttpServer, requestPath: string, token: string, fileName: string): Promise<void> {
	return new Promise((resolve, reject) => {
    const options = buildOptions(server, 'GET', requestPath, token);
    const incomingMessage: Promise<http.IncomingMessage> = server.secure ? doSecureRequest(options): doRequest(options);
    
    incomingMessage.then(res => {

      const file = fs.createWriteStream(fileName)

      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          resolve();
        });
      });

      file.on('error', (error) => {
        reject(error);
      });

		})	
  })
}

/**
  * Perform a DELETE request to the server
  * @param server - server configuration
  * @param requestPath - path of the request
  * @param token - token for authorization
  * @returns a promise that resolves when the request is complete
  */
export function del(server: HttpServer, requestPath: string, token: string): Promise<void> {
	return new Promise((resolve, reject) => {
    const options = buildOptions(server, 'DELETE', requestPath, token);
    const incomingMessage: Promise<http.IncomingMessage> = server.secure ? doSecureRequest(options): doRequest(options);

    incomingMessage.then(res => {
      if (res.statusCode === 204) {
        resolve();
      } else {
        reject("Expected 204 status code, got " + res.statusCode);
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
    https.request(options, resolve).on('error', reject).end(postData);
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
    http.request(options, resolve).on('error', reject).end(postData);
  })
}

/**
  * Handle the result of a http/https request and call the resolve with the parsed JSON data or reject with an error
  * @param res - incoming message
  * @param resolve - resolve function
  * @param reject - reject function
  */
function handleJsonResult<O>(res: http.IncomingMessage, resolve: (value: O) => void, reject: (reason?: any) => void): void {
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    if (res.statusCode !== 200) {
      //reject('Failed to get data from server: ' + rawData);
      reject(res.statusCode);
    } else {
      try {
        const parsedData: O = JSON.parse(rawData);
        resolve(parsedData);
      } catch (e) {
        reject(new Error(`error In parsing of json response: ${e.message}`));
      }
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
