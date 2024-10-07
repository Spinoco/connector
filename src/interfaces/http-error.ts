/**
 * Helper to get type-aware HTTP errors
 */
export interface HttpError {
  /** http status number (e.g., 404 for Not found) **/
  status: number;
  /** received message **/
  message: string;
  /** if true, the error is fatal and the application should stop **/
  fatal: boolean;
}

