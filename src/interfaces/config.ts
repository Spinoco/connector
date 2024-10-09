import { HttpServer } from './http-server';

/**
 * Configuration of the Spinoco API Server from which the data will be pulled.
 */
export interface ApiConfig {
  /** Configuration to be used by the Spinoco API server **/
  server: HttpServer;

  /** Spinoco Authentication token **/
  token: string;
}

/**
 * Configuration of the task synchronization
 */
export interface TaskSyncConfig {
  /** tag to use for storing the synchronization data **/
  tag: string;

  /** template of the filename that will be used to store the server data **/
  fileNameTemplate: string;

  /** type of data to get (recordings, transcriptions) **/
  get?: string;

  /** type of data to delete from Spinoco once they are committed to local storage (recordings) **/
  delete?: string;

  /** Constant path prefix that will be added before the file path. Think of this as the root of the file storage **/
  saveTo: string;
}

/** Interface for the configuration object **/
export interface Config {
  /** configuration of the Spinoco API **/
  api: ApiConfig;

  /** configuration of the task synchronization **/
  taskSync: TaskSyncConfig;
}
