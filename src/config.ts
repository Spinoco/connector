import { HttpServer } from "./interfaces/http-server";
import { Config, ApiConfig, TaskSyncConfig } from "./interfaces/config";
import {buildLocalStorage} from "./storage/local-storage";
import {buildAWSS3Storage} from "./storage/aws-s3-storage";
import {buildGCSStorage} from "./storage/gcs-storage";
import {buildAzureStorage} from "./storage/azure-storage";
import { Logger } from "./logging";
import {FileStorage} from "@flystorage/file-storage";

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
      delete: process.env.SP_TASK_SYNC_DELETE_DATA || "",
      skillsShould: parseSkills(process.env.SP_TASK_SYNC_SKILLS_SHOULD),
      skillsMust: parseSkills(process.env.SP_TASK_SYNC_SKILLS_MUST),
      skillsMustNot: parseSkills(process.env.SP_TASK_SYNC_SKILLS_MUSTNOT),
      hashTagsShould: parseHashTags(process.env.SP_TASK_SYNC_HASHTAGS_SHOULD),
      hashTagsMust: parseHashTags(process.env.SP_TASK_SYNC_HASHTAGS_MUST),
      hashTagsMustNot: parseHashTags(process.env.SP_TASK_SYNC_HASHTAGS_MUSTNOT)
    })
  ))
}


function buildStorage(): Promise<FileStorage> {
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

/**
 * Parses supplied command line params by filtering out any invalid skill specification, so the result
 * Array is satisfying the skillId by having 1..4 characters in skill id
 * @param env
 */
function parseSkills(env: string | null): string[] {
  let splitted = (env || "").split(",")
  let checked = splitted.filter((skill) => {
    let skillId = skill.trim();
    let length = skillId.length;
    return(length > 0 && length <= 4)
  });

  return (checked);
}

/**
 * Tests if supplied command line params is valid hashtags specification. hashtags may be specified as uuid or as uuid:value pair, separated by comma.
 * @param env
 */
function parseHashTags(env: string | null): string[] {
  let splitted = (env || "").split(",")
  let mapped = splitted.filter((spec) => {
    let parts = spec.split(":")
    if (parts.length == 1) {
      return (isType1UUID(parts[0]) ? parts[0] : null);
    } else if (parts.length == 2) {
      if (isType1UUID(parts[0])) return(parts[0].trim()+":"+parts[1].trim())
      else return null;
    }
  })
  let valid = mapped.filter((spec) => spec != null)

  return valid;
}

/**
 * Tests if supplied string is type 1 uuid
 * @param uuid UUid string to test
 */
function isType1UUID(uuid: string | null) : boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test((uuid || "").trim());
}

/** fails if environment is not defined or provides value of the environment **/
export function assertEnv(env: string): Promise<string> {
  const value = process.env[env]
  if (value == undefined) return Promise.reject(`Configuration option for ${env} is not defined`);
  else return Promise.resolve(value);
}
