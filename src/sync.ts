import { foldPromise } from "./utils";
import { postWithBody, saveToFile, del } from "./http";
import { Config } from "./interfaces/config";
import { TaskSyncQuery, TaskSyncData } from "./interfaces/task-sync";
import { PagedQuery, PagingResult } from "./interfaces/paging-query";
import { mkdirForFile } from "./folder";

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
    const saveTo = `${config.taskSync.saveTo}/${getRequest.fileName}`;           
    return mkdirForFile(saveTo).then(() =>
      saveToFile(config.api.server, getRequest.path, config.api.token, saveTo)
    )
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
  return foldPromise(result.result, processTaskData(config)).then(() => {
    if (result.next) {
      delayedQuery(config, 0, { page: result.next, count: pageSize }, 0);
    } else {
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
      console.error(`Failed to process tasks. Will retry in ${retryTimeout/1000} seconds. Error:`, error);
      delayedQuery(config, retryTimeout, nextQuery, retry + 1);
    } else {
      console.error("Failed to process tasks. No more retries. Error:", error);
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
      fileNameTemplate: config.taskSync.fileNameTemplate
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
