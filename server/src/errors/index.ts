export class HandlerableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HandlerableError";
  }
}

export class EntityNotFoundError extends HandlerableError {
  constructor(message: string) {
    super(message);
    this.name = "EntityNotFoundError";
  }
}

export class InternalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalError";
  }
}

export * from "./game-room.error";
export * from "./webrtc-signaling.error";
