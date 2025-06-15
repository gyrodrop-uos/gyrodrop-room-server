import { Gyro } from "../gyro/types";
import { GameRoomApiClient, GameRoomError } from "./types";

import { GameRoomApiClientHybrid } from "./game-room-hybrid";

export type GameRoomState = "init" | "joining" | "joined" | "rejected" | "leaved";
export type GameRoomEvent = {
  state: GameRoomState;
  message: string;
  connection: GameRoomConnection;
};
type GameRoomServiceEventHandler = (e: GameRoomEvent) => void;

export class GameRoomConnection {
  private _state: GameRoomState;
  private _message: string;
  private _listeners: GameRoomServiceEventHandler[];

  private _roomId: string;
  private _controllerId: string;
  private _axis: "pitch" | "roll";
  private _apiClient: GameRoomApiClient;

  constructor(
    params: { roomId: string; controllerId: string; axis: "pitch" | "roll" }, //
    apiClient: GameRoomApiClient
  ) {
    this._state = "init";
    this._message = "";
    this._listeners = [];

    this._roomId = params.roomId;
    this._controllerId = params.controllerId;
    this._axis = params.axis;
    this._apiClient = apiClient;
  }

  public addListener(handler: GameRoomServiceEventHandler) {
    this._listeners.push(handler);
    return () => {
      this._listeners = this._listeners.filter((listener) => listener !== handler);
    };
  }

  private notify(state: GameRoomState, message: string): void {
    this._state = state;
    this._message = message;

    // Notify the UI or any other component that needs to be updated
    this._listeners.forEach((listener) =>
      listener({
        state: this._state,
        message: this._message,
        connection: this,
      })
    );
  }

  public async join() {
    try {
      if (!this._roomId || !this._controllerId || !this._axis) {
        return this.notify("rejected", "Invalid parameters");
      }

      this.notify("joining", "Joining room...");
      await this._apiClient.joinGyro(this._roomId, this._controllerId, this._axis);
      this.notify("joined", "Joined room successfully");
    } catch (error) {
      if (error instanceof GameRoomError) {
        switch (error.errorType) {
          case "GameRoomError":
            this.notify("rejected", error.message);
            break;
          case "GameRoomNotFoundError":
            this.notify("rejected", "Room not found");
            break;
          case "GameRoomInvalidParameterError":
            this.notify("rejected", "Invalid parameters");
            break;
          case "GameRoomFullError":
            this.notify("rejected", "Room is full");
            break;
          case "GameRoomAuthError":
            this.notify("rejected", "Authentication error");
            break;
          case "GameRoomUnknownError":
          default:
            console.error("Unknown error:", error);
            this.notify("rejected", "Unknown error occurred");
            break;
        }
      } else {
        console.error("Unexpected error:", error);
        this.notify("rejected", "Unexpected error occurred");
      }
    }
  }

  public async updateGyro(gyro: Gyro) {
    if (this._state !== "joined") {
      throw new Error("Cannot update gyro: not in joined state");
    }

    try {
      await this._apiClient.updateGyro(this._roomId, this._controllerId, gyro);
    } catch (error) {
      if (error instanceof GameRoomError) {
        this.notify("rejected", `Cannot update gyro: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  public get roomId(): string {
    return this._roomId;
  }
  public get state(): GameRoomState {
    return this._state;
  }
  public get message(): string {
    return this._message;
  }
}

const gameRoomServerUrl = import.meta.env.VITE_ROOM_SERVER_URL;
const gameRoomApiClient: GameRoomApiClient = new GameRoomApiClientHybrid(gameRoomServerUrl);

export const getGyroLog = () => (gameRoomApiClient as GameRoomApiClientHybrid).getGyroLog();

export function createGameRoomConnection(
  roomId: string, //
  controllerId: string,
  axis: "pitch" | "roll"
): GameRoomConnection {
  return new GameRoomConnection({ roomId, controllerId, axis }, gameRoomApiClient);
}
