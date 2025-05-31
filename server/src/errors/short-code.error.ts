import { HandlerableError, StatusCode } from "./common.error";

export class ShortCodeError extends Error implements HandlerableError {
  private _httpStatusCode: StatusCode;

  constructor(
    message: string,
    name: string = "ShortCodeError",
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

export class ShortCodeNotFoundError extends ShortCodeError {
  constructor(message: string = "Short code not found.") {
    super(message, "ShortCodeNotFoundError", StatusCode.NOT_FOUND);
  }
}

export class ShortCodeOverRegenerationError extends ShortCodeError {
  constructor(message: string = "Short code over regeneration limit reached.") {
    super(message, "ShortCodeOverRegenerationError", StatusCode.INTERNAL_SERVER_ERROR);
  }
}
