export interface TaskSyncData {
  taskId: string;
  get: ClientGetRequest[];
  delete: ClientDeleteRequest[];
}

export interface ClientGetRequest {
  fileName: string;
  path: string;
}

export interface ClientDeleteRequest {
  path: string;
}

export interface TaskSyncQuery {
  tag: string;
  get?: string;
  delete?: string;
  fileNameTemplate: string;
}

