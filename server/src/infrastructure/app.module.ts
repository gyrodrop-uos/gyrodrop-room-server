import { GameRoomRepository, ShortCodeRepository } from "@/interfaces/repositories";

import { GameRoomInMemoryRepository } from "@/repositories/game-room-in-memory.repository";
import { ShortCodeBase62InMemoryRepository } from "@/repositories/short-code-base62-in-memory.repository";
import { GameRoomService } from "@/services/game-room.service";
import { WebRTCSignalingService } from "@/services/webrtc-signaling.service";

import { Module } from "@nestjs/common";
import { getEnv } from "@/env";

import { GameRoomController } from "./controllers/game-room.controller";
import { GameRoomGateway } from "./gateways/game-room.gateway";
import { WebRTCSignalingGateway } from "./gateways/webrtc-signaling.gateway";

type CustomProvider<T> = {
  provide: string;
  useValue: T;
};

// ================================
// Repository Dependency Injection
// ================================
const gameRoomRepo: GameRoomRepository = new GameRoomInMemoryRepository();
const shortCodeRepo: ShortCodeRepository = new ShortCodeBase62InMemoryRepository();

// ===================================
// Service Layer Dependency Injection
// ===================================
const gameRoomProvider: CustomProvider<GameRoomService> = {
  provide: "GameRoomService",
  useValue: new GameRoomService({
    gameRoomRepo,
    shortCodeRepo,
  }),
};
const webrtcSignalingProvider: CustomProvider<WebRTCSignalingService> = {
  provide: "WebRTCSignalingService",
  useValue: new WebRTCSignalingService({
    gameRoomRepo,
    turnSecret: getEnv().TURN_SECRET,
  }),
};

@Module({
  controllers: [GameRoomController],
  providers: [
    gameRoomProvider, //
    webrtcSignalingProvider,
    GameRoomGateway,
    WebRTCSignalingGateway,
  ],
})
export class AppModule {}
