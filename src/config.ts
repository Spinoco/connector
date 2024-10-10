import { HttpServer } from "./interfaces/http-server";
import {Config, ApiConfig, TaskSyncConfig, assertEnv} from "./interfaces/config";
import {buildLocalStorage} from "./interfaces/storage/local-storage";
import {buildAWSS3Storage} from "./interfaces/storage/aws-s3-storage";
import {buildGCSStorage} from "./interfaces/storage/gcs-storage";
import {buildAzureStorage} from "./interfaces/storage/azure-storage";

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
      return buildStorage().then((storage) => {
        return Promise.resolve({
          api: apiConfig,
          taskSync: taskSyncConfig,
          storage: storage
        });
      })
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
      let startFrom: Date = undefined;
      if (process.env.SP_TASK_START_FROM != undefined)  {
        startFrom = new Date(process.env.SP_TASK_START_FROM)
      }

      return Promise.resolve({
        tag: syncTag,
        fileNameTemplate: fileNameTemplate,
        startFrom: startFrom,
        get: process.env.SP_TASK_SYNC_GET_DATA || "",
        delete: process.env.SP_TASK_SYNC_DELETE_DATA || ""
      });
    });
  });
  
}


function buildStorage() {
  const providerType = (process.env.SP_TASK_SYNC_STORAGE_PROVIDER || "local").toLowerCase();
  switch (providerType) {
    case "local": return buildLocalStorage();
    case "s3": return buildAWSS3Storage();
    case "gcs": return buildGCSStorage();
    case "azure": return buildAzureStorage();
    default: return Promise.reject("Unsupported storage provider: " + providerType);
  }
}


