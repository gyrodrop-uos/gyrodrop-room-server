export class GameRoomActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameRoomError";
  }
}

export class GameRoomAuthError extends Error {
  constructor(message: string = "Game room authentication error.") {
    super(message);
    this.name = "GameRoomAuthError";
  }
}
