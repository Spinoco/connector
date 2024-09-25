import { HttpServer } from './http-server';

export interface ApiConfig {
  server: HttpServer;
  token: string;
}

export interface TaskSyncConfig {
  tag: string;
  fileNameTemplate: string;
  get?: string;
  delete?: string;
  saveTo: string;
}

export interface Config {
  api: ApiConfig;
  taskSync: TaskSyncConfig;
}
