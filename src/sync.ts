import { foldPromise } from "./utils";
import { postWithBody, saveToFile, del } from "./http";
import { Config } from "./interfaces/config";
import { TaskSyncQuery, TaskSyncData } from "./interfaces/task-sync";
import { PagedQuery, PagingResult } from "./interfaces/paging-query";
import {Logger} from "./logging";

const pageSize = 10;
const retryTimeout = 30 * 1000; //30 seconds
const nextQueryTimeout = 5 * 60 * 1000; //5 minutes
const retriesBeforeFailure = 3;

/**
  * Process task data
  * 1) process all GET requests and save results to files 
  * 2) process all DELETE requests
  * @param config - global configuration
  * @param taskData - data received from the server
  */
const processTaskData = (config: Config) => (taskData: TaskSyncData): Promise<void> => {
  return foldPromise(taskData.get, (getRequest) => {
    return saveToFile(config.api.server, getRequest.path, config.api.token, getRequest.fileName, config.storage)
  }).then(() => foldPromise(taskData.delete, (deleteRequest) =>
    del(config.api.server, deleteRequest.path, config.api.token)
   )
  )
}

/**
  * Process result of the paging query
  * 1) process all task data
  * 2) if there is a next page, query it
  * 3) if there is no next page, query the first page after a timeout
  * @param config - global configuration
  * @param result - result of the paging query
  */
const processResult = (config: Config) => (result: PagingResult<TaskSyncData>): Promise<void> => {
  Logger.info(`Received page size: ${result.result.length}`);
  return foldPromise(result.result, processTaskData(config)).then(() => {
    if (result.next) {
      Logger.debug(`Loading more data [${pageSize}]`, result.next)
      delayedQuery(config, 0, { page: result.next, count: pageSize }, 0);
    } else {
      Logger.info(`No more data to load in this run. Waiting for ${nextQueryTimeout} ms`);
      delayedQuery(config, nextQueryTimeout, mkFirstQuery(config), 0);
    }
  })
}

/**
  * Query the server after a timeout
  * @param config - global configuration
  * @param timeout - timeout in milliseconds
  * @param query - query to be sent to the server
  * @param retry - number of retries
  */
function delayedQuery(config: Config, timeout: number, query: PagedQuery<TaskSyncQuery, string>, retry: number): void {
  Logger.info("Scheduling query ", { query: query, retry: retry, timeout: timeout });
  setTimeout(doPaging, timeout, config, query, retry);
}

/**
  * Perform paging query
  * @param config - global configuration
  * @param nextQuery - query to be sent to the server
  * @param retry - number of retries
  */
function doPaging(config: Config, nextQuery: PagedQuery<TaskSyncQuery, string>, retry: number): Promise<void> {
  return postWithBody<PagedQuery<TaskSyncQuery, string>, PagingResult<TaskSyncData>>(config.api.server, "/task/sync/", config.api.token, nextQuery).then(
    processResult(config)
  ).catch((error) => {
    if (retry < retriesBeforeFailure && !error.fatal) {
      Logger.error(`Failed to process tasks. Will retry in ${retryTimeout / 1000} seconds. Attempt ${retry}. Error:`, error);
      delayedQuery(config, retryTimeout, nextQuery, retry + 1);
    } else {
      Logger.error("Failed to process tasks. No more retries. Error:", error);
    }
  });
}

/**
  * Create the first query to be sent to the server
  * @param config - global configuration
  */
function mkFirstQuery(config: Config): PagedQuery<TaskSyncQuery, string> {
  return {
    query: {
      tag: config.taskSync.tag,
      get: config.taskSync.get,
      delete: config.taskSync.delete,
      fileNameTemplate: config.taskSync.fileNameTemplate,
      startFrom: config.taskSync.startFrom?.getTime().toString(), // we need to send DT as millis since epoch here encoded as string.
      skillsShould: config.taskSync.skillsShould,
      skillsMust: config.taskSync.skillsMust,
      skillsMustNot: config.taskSync.skillsMustNot,
      hashTagsShould: config.taskSync.hashTagsShould,
      hashTagsMust: config.taskSync.hashTagsMust,
      hashTagsMustNot: config.taskSync.hashTagsMustNot
    },
    count: pageSize
  }
}

/**
  * Synchronize tasks
  * @param config - global configuration
  */
export function syncTasks(config: Config): Promise<void> {
  return doPaging(config, mkFirstQuery(config), 0);
}
