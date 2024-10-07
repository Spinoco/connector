export interface HttpError {
  status: number;
  message: string;
  fatal: boolean; //if true, the error is fatal and the application should stop
};

