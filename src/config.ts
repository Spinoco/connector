import { HttpServer } from "./interfaces/http-server";
import { Config, ApiConfig, TaskSyncConfig } from "./interfaces/config";
import {buildLocalStorage} from "./storage/local-storage";
import {buildAWSS3Storage} from "./storage/aws-s3-storage";
import {buildGCSStorage} from "./storage/gcs-storage";
import {buildAzureStorage} from "./storage/azure-storage";
import { Logger } from "./logging";

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
  return buildTaskSyncConfig().then((taskSyncConfig) =>
  buildApiConfig().then((apiConfig) =>
  buildStorage().then((storage) =>
    ({
      api: apiConfig,
      taskSync: taskSyncConfig,
      storage: storage
    })
  )))
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
  return assertEnv("SP_TASK_SYNC_FILE_NAME_TEMPLATE").then((fileNameTemplate) => 
  assertEnv("SP_TASK_SYNC_TAG").then((syncTag) =>
    ({
      tag: syncTag,
      fileNameTemplate: fileNameTemplate,
      startFrom: process.env.SP_TASK_SYNC_START_FROM ? new Date(process.env.SP_TASK_SYNC_START_FROM): undefined,
      get: process.env.SP_TASK_SYNC_GET_DATA || "",
      delete: process.env.SP_TASK_SYNC_DELETE_DATA || ""
    })
  ))
}


function buildStorage() {
  const providerType = (process.env.SP_TASK_SYNC_STORAGE_PROVIDER || "local").toLowerCase();
  Logger.info(`Building storage provider: ${providerType}`);
  switch (providerType) {
    case "local": return buildLocalStorage();
    case "s3": return buildAWSS3Storage();
    case "gcs": return buildGCSStorage();
    case "azure": return buildAzureStorage();
    default: return Promise.reject("Unsupported storage provider: " + providerType);
  }
}

/** fails if environment is not defined or provides value of the environment **/
export function assertEnv(env: string): Promise<string> {
  const value = process.env[env]
  if (value == undefined) return Promise.reject(`Configuration option for ${env} is not defined`);
  else return Promise.resolve(value);
}
