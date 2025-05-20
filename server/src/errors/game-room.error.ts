import { HandlerableError, StatusCode } from "./common.error";

export class GameRoomError extends Error implements HandlerableError {
  private _httpStatusCode: StatusCode;

  constructor(
    message: string,
    name: string = "GameRoomError",
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

export class GameRoomNotFoundError extends GameRoomError {
  constructor(message: string = "Game Room not found.") {
    super(message, "GameRoomNotFoundError", StatusCode.NOT_FOUND);
  }
}

export class GameRoomInvalidParameterError extends GameRoomError {
  constructor(message: string = "Invalid parameter.") {
    super(message, "GameRoomInvalidParameterError", StatusCode.BAD_REQUEST);
  }
}

export class GameRoomFullError extends GameRoomError {
  constructor(message: string = "Game room is full.") {
    super(message, "GameRoomFullError", StatusCode.FORBIDDEN);
  }
}

export class GameRoomAuthError extends GameRoomError {
  constructor(message: string = "Authorization Failed.") {
    super(message, "GameRoomAuthError", StatusCode.UNAUTHORIZED);
  }
}
