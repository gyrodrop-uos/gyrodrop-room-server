import { GameRoomApiClientHttp } from "./game-room-http";
import { GameRoomApiClient } from "./types";

export const gameRoomApiClient: GameRoomApiClient = new GameRoomApiClientHttp("http://localhost:3000");
