import { GameRoomRepository, GameStageRepository, GameStateRepository, PlayerRepository } from "@/interfaces/repositories";
import { GameRoomService } from "@/interfaces/services";

import { GameRoomInMemoryRepository } from "@/repositories/game-room.repository.memory";
import { GameStageJsonRepository } from "@/repositories/game-stage.repository.json";
import { GameStateInMemoryRepository } from "@/repositories/game-state.repository.memory";
import { PlayerJsonRepository } from "@/repositories/player.repository.json";

import { GameRoomServiceImpl } from "@/services/game-room.service";

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
const playerRepo: PlayerRepository = new PlayerJsonRepository("/tmp/players.json");
const gameStageRepo: GameStageRepository = new GameStageJsonRepository("/tmp/game-stages.json");
const gameStateRepo: GameStateRepository = new GameStateInMemoryRepository();

// ===================================
// Service Layer Dependency Injection
// ===================================
const gameRoomProvider: CustomProvider<GameRoomService> = {
  provide: "GameRoomService",
  useValue: new GameRoomServiceImpl(
    {
      playerRepo,
      gameRoomRepo,
      gameStageRepo,
      gameStateRepo,
    },
    { gameStateWatcherId: "master" }
  ),
};

@Module({
  controllers: [GameRoomController],
  providers: [gameRoomProvider, GameRoomGateway],
})
export class AppModule {}
