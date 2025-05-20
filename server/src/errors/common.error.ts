export interface HandlerableError {
  getHttpStatusCode(): StatusCode;
  getErrorType(): string;
  getErrorMessage(): string;
}

export function isHandlerableError(obj: any): obj is HandlerableError {
  return (
    obj &&
    typeof obj.getHttpStatusCode === "function" &&
    typeof obj.getErrorType === "function" &&
    typeof obj.getErrorMessage === "function"
  );
}

export enum StatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
