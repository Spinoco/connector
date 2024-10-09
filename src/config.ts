import { HttpServer } from "./interfaces/http-server";
import {Config, ApiConfig, TaskSyncConfig, assertEnv} from "./interfaces/config";

/**
  * Default API server configuration
  */
const defaultAPIServer: HttpServer = {
  hostname: 'api.spinoco.com',
  secure: true
}

/**
  * Build configuration from environment variables
  */
export function buildConfig(): Promise<Config> {
  return buildTaskSyncConfig().then((taskSyncConfig) => {
    return buildApiConfig().then((apiConfig) => {
      return {
        api: apiConfig,
        taskSync: taskSyncConfig
      };
    });
  });
}

/**
  * Error message for undefined environment variable
  * @param name - name of the environment variable
  */
function undefinedEnvVar(name: string): string {
  return `Failed to read environment variable: ${name}`;
}

/**
  * Build API configuration from environment variables
  */
function buildApiConfig(): Promise<ApiConfig> {
  return new Promise((resolve, reject) => {
  if (process.env.SP_API_TOKEN) {
    let server: HttpServer;
    if (typeof(process.env.SP_API_URL) === "string") {
      server = {
        hostname: process.env.SP_API_URL,
        port: process.env.SP_API_PORT ? parseInt(process.env.SP_API_PORT) : undefined,
        secure: process.env.SP_API_SECURE ? (process.env.SP_API_SECURE === "true"): true
      }
    } else {
      server = defaultAPIServer;
    }

    resolve({
      server: server,
      token: process.env.SP_API_TOKEN
    });
  } else {
    reject(new Error(undefinedEnvVar("SP_API_TOKEN")));
  }
  });
}

/**
  * Build task sync configuration from environment variables
  */
function buildTaskSyncConfig(): Promise<TaskSyncConfig> {
  return assertEnv("SP_TASK_SYNC_FILE_NAME_TEMPLATE").then((fileNameTemplate) => {
    return assertEnv("SP_TASK_SYNC_TAG").then((syncTag) => {
      return Promise.resolve({
        tag: syncTag,
        fileNameTemplate: fileNameTemplate,
        startFrom: process.env.SP_TASK_START_FROM,
        get: process.env.SP_TASK_SYNC_GET_DATA || "",
        delete: process.env.SP_TASK_SYNC_DELETE_DATA || ""
      });
    });
  });
  
}

