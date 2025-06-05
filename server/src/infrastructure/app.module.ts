import { ClientVersionRepository, GameRoomRepository, ShortCodeRepository } from "@/interfaces/repositories";

import { ClientVersionJsonRepository } from "@/repositories/client-version-json.repository";
import { GameRoomInMemoryRepository } from "@/repositories/game-room-in-memory.repository";
import { ShortCodeBase62InMemoryRepository } from "@/repositories/short-code-base62-in-memory.repository";
import { ClientVersionService } from "@/services/client-version.service";
import { GameRoomService } from "@/services/game-room.service";
import { WebRTCSignalingService } from "@/services/webrtc-signaling.service";

import { getEnv } from "@/env";
import { Module } from "@nestjs/common";

import { ClientVersionController } from "./controllers/client-version.controller";
import { GameRoomController } from "./controllers/game-room.controller";
import { HealthController } from "./controllers/health.controller";
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
const clientVersionRepo: ClientVersionRepository = new ClientVersionJsonRepository(
  getEnv().CLIENT_VERSION_JSON_PATH,
  1000 * 60 // 1 minute cache TTL
);

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
const clientVersionProvider: CustomProvider<ClientVersionService> = {
  provide: "ClientVersionService",
  useValue: new ClientVersionService({
    clientVersionRepo,
  }),
};

@Module({
  controllers: [
    HealthController, //
    GameRoomController,
    ClientVersionController,
  ],
  providers: [
    gameRoomProvider, //
    webrtcSignalingProvider,
    clientVersionProvider,
    GameRoomGateway,
    WebRTCSignalingGateway,
  ],
})
export class AppModule {}
