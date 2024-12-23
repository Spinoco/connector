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

/** Interface for the configuration object **/
export interface Config {
  /** configuration of the Spinoco API **/
  api: ApiConfig;

  /** configuration of the task synchronization **/
  taskSync: TaskSyncConfig;

  /** contains reference to active file storage used as target of this synchronization **/
  storage: FileStorage;

}
