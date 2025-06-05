import { HandlerableError, StatusCode } from "./common.error";

export class ClientVersionError extends Error implements HandlerableError {
  private _httpStatusCode: StatusCode;

  constructor(
    message: string,
    name: string = "ClientVersionError",
    httpStatusCode: StatusCode = StatusCode.BAD_REQUEST // Default to 400 Bad Request
  ) {
    super(message);
    this.name = name;
    this._httpStatusCode = httpStatusCode;
  }

  getHttpStatusCode(): StatusCode {
    return this._httpStatusCode;
  }
  getErrorType(): string {
    return this.name;
  }
  getErrorMessage(): string {
    return this.message;
  }
}

export class ClientVersionParsingError extends ClientVersionError {
  constructor(message: string = "Failed to parse client version.") {
    super(message, "ClientVersionParseError", StatusCode.BAD_REQUEST);
  }
}

export class ClientVersionNotCompatibleError extends ClientVersionError {
  constructor(message: string = "Client version is not compatible with the server.") {
    super(message, "ClientVersionNotCompatibleError", StatusCode.BAD_REQUEST);
  }
}
