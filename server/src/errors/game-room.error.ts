import { HandlerableError } from ".";

export class GameRoomError extends HandlerableError {
  constructor(message: string, name: string = "GameRoomError") {
    super(message);
    this.name = name;
  }
}

export class GameRoomInvalidParameterError extends GameRoomError {
  constructor(message: string = "Invalid parameter.") {
    super(message, "GameRoomInvalidParameterError");
  }
}

export class GameRoomFullError extends GameRoomError {
  constructor(message: string = "Game room is full.") {
    super(message, "GameRoomFullError");
  }
}

export class GameRoomActionError extends GameRoomError {
  constructor(message: string) {
    super(message, "GameRoomActionError");
  }
}

export class GameRoomAuthError extends GameRoomError {
  constructor(message: string = "Authorization Failed.") {
    super(message, "GameRoomAuthError");
  }
}
