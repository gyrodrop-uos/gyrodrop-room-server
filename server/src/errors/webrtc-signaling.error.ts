import { HandlerableError } from ".";

export class WebRTCSignalingError extends HandlerableError {
  private _messageId: string;

  constructor(messageId: string, message: string, name: string = "WebRTCError") {
    super(message);
    this._messageId = messageId;
    this.name = name;
  }

  get messageId() {
    return this._messageId;
  }
}

export class WebRTCSignalingConnectionNotFoundError extends WebRTCSignalingError {
  constructor(messageId: string, message: string = "Connection not found.") {
    super(messageId, message, "WebRTCSignalingConnectionNotFoundError");
  }
}

export class WebRTCSignalingMessageNotFoundError extends WebRTCSignalingError {
  constructor(messageId: string, message: string = "Message not found.") {
    super(messageId, message, "WebRTCSignalingMessageNotFoundError");
  }
}

export class WebRTCSignalingBlockError extends WebRTCSignalingError {
  constructor(messageId: string, message: string = "Signaling blocked.") {
    super(messageId, message, "WebRTCSignalingBlockError");
  }
}
