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
  /** initial time from which to pull data, only when performing first query with tag, otherwise ignored **/
  startFrom?: string;
  /** the supplied tasks must have the following skills assigned to them - empty no requirement**/
  skillsMust: string[];
  /** the supplied tasks should have any of the following skills assigned to them - empty no requirement**/
  skillsShould: string[];
  /** the supplied tasks must not have the following skills assigned to them - empty no requirement**/
  skillsMustNot: string[];
  /** the supplied tasks must have the following hashtags assigned to them - empty no requirement. Hashtags are encoded with their id and eventually value separated by dot **/
  hashTagsMust: string[];
  /** the supplied tasks should have any of the following hashtags assigned to them - empty no requirement. Hashtags are encoded with their id and eventually value separated by dot**/
  hashTagsShould: string[];
  /** the supplied tasks must not have the following skills hashtags to them - empty no requirement. Hashtags are encoded with their id and eventually value separated by dot**/
  hashTagsMustNot: string[];

}

