import { GameRoomRepository } from "@/interfaces/repositories";

import { GameRoomInMemoryRepository } from "@/repositories/game-room-in-memory.repository";
import { GameRoomService } from "@/services/game-room.service";

import { Module } from "@nestjs/common";
import { GameRoomController } from "./controllers/game-room.controller";
import { GameRoomGateway } from "./gateways/game-room.gateway";

type CustomProvider<T> = {
  provide: string;
  useValue: T;
};

// ================================
// Repository Dependency Injection
// ================================
const gameRoomRepo: GameRoomRepository = new GameRoomInMemoryRepository();

// ===================================
// Service Layer Dependency Injection
// ===================================
const gameRoomProvider: CustomProvider<GameRoomService> = {
  provide: "GameRoomService",
  useValue: new GameRoomService({
    gameRoomRepo,
  }),
};

@Module({
  controllers: [GameRoomController],
  providers: [gameRoomProvider, GameRoomGateway],
})
export class AppModule {}
