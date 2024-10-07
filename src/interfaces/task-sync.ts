/**
 * Data used for task synchronization
 * This contains data received from the server, instructing
 * the Connector with the correct filename and actions to perform.
 */
export interface TaskSyncData {
  /** id of the task (type 1 UUID) **/
  taskId: string;
  /** actions that shall be performed with task (e.g., download recording, transcriptions, ...) **/
  get: ClientGetRequest[];

  /** actions to perform once the data is committed to the storage. This is invoked AFTER `get` is committed **/
  delete: ClientDeleteRequest[];
}

/**
 * Get operation
 */
export interface ClientGetRequest {
  /** name of the file to store in storage **/
  fileName: string;
  /** path (url) to get content from the server **/
  path: string;
}

/** Request to perform after the file is committed **/
export interface ClientDeleteRequest {
  /** path (url) to perform action **/
  path: string;
}

/**
 * Encapsulates the query to use while pulling the tasks
 */
export interface TaskSyncQuery {
  /** tag that is used to keep the state on the server **/
  tag: string;
  /** operations and the data to get **/
  get?: string;
  /** operations and the data to delete **/
  delete?: string;
  /** template to build the file name **/
  fileNameTemplate: string;
}

