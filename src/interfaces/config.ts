import { HttpServer } from './http-server';

/**
 * Configuration of the Spinoco API Server from where the data will be pulled.
 */
export interface ApiConfig {
  /** configuration for the Spinoco api server to use**/
  server: HttpServer;

  /** Spinoco Authentication token **/
  token: string;
}

/**
 * Configuration of the task synchronization
 */
export interface TaskSyncConfig {
  /** tag to use for storing synchronization data **/
  tag: string;

  /** template of the filename that will be used to store the server data **/
  fileNameTemplate: string;

  /** type of data to get (recordings, transcriptions) **/
  get?: string;

  /** type of data to delete from the Spinoco once they are committed to local storage (recordings) **/
  delete?: string;

  /** Constant path prefix that will be added before the file path. Think of this as root of the file storage **/
  saveTo: string;
}

/** Interface for the configuration object **/
export interface Config {
  /** configuration of the Spinoco API **/
  api: ApiConfig;

  /** configuration of the task synchronization **/
  taskSync: TaskSyncConfig;
}
