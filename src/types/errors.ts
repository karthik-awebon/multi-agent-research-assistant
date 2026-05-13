export interface ApiResponseError {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}
