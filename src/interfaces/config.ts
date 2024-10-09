import { HttpServer } from './http-server';
import {FileStorage} from '@flystorage/file-storage';

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

  /** if defined and this is first run of the tool, then this allows to set initial date from which the tool will start pulling the data **/
  startFrom?: Date

  /** type of data to get (recordings, transcriptions) **/
  get?: string;

  /** type of data to delete from Spinoco once they are committed to local storage (recordings) **/
  delete?: string;
}

/** Interface for the configuration object **/
export interface Config {
  /** configuration of the Spinoco API **/
  api: ApiConfig;

  /** configuration of the task synchronization **/
  taskSync: TaskSyncConfig;

  /** contains reference to active file storage used as target of this synchronization **/
  storage: FileStorage;

}

/** fails if environment is not defined or provides value of the environment **/
export function assertEnv(env: string): Promise<string> {
  const value = process.env[env]
  if (value == undefined) return(Promise.reject(`Configuration option for ${env} is not defined`))
  else return(Promise.resolve(value))
}
