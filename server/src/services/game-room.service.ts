import { GameRoomActionError, GameRoomAuthError } from "@/errors";
import { GameRoom, GameState, Gyro } from "@/interfaces/models";
import { GameRoomRepository, GameStageRepository, GameStateRepository, PlayerRepository } from "@/interfaces/repositories";
import { GameRoomService } from "@/interfaces/services";

import { v4 as uuidv4 } from "uuid";

export class GameRoomServiceImpl implements GameRoomService {
  private playerRepo: PlayerRepository;
  private gameStageRepo: GameStageRepository;
  private gameRoomRepo: GameRoomRepository;
  private gameStateRepo: GameStateRepository;

  private gameStateWatcherId: string;

  constructor(
    repos: {
      playerRepo: PlayerRepository;
      gameStageRepo: GameStageRepository;
      gameRoomRepo: GameRoomRepository;
      gameStateRepo: GameStateRepository;
    },
    params: { gameStateWatcherId: string }
  ) {
    this.playerRepo = repos.playerRepo;
    this.gameStageRepo = repos.gameStageRepo;
    this.gameRoomRepo = repos.gameRoomRepo;
    this.gameStateRepo = repos.gameStateRepo;

    this.gameStateWatcherId = params.gameStateWatcherId;
  }

  public async openRoom(playerId: string, gameStageId: string): Promise<GameRoom> {
    const player = await this.playerRepo.getById(playerId);
    const gameStage = await this.gameStageRepo.getById(gameStageId);
    const gameRoom = await this.gameRoomRepo.create({
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "waiting",
      stageId: gameStage.id,
      playerIds: [player.id],
    });

    return gameRoom;
  }

  public async joinRoom(playerId: string, gameRoomId: string): Promise<GameRoom> {
    const player = await this.playerRepo.getById(playerId);
    let gameRoom = await this.gameRoomRepo.getById(gameRoomId);

    if (gameRoom.status !== "waiting") {
      throw new GameRoomActionError("The game room is not in waiting state.");
    }
    if (gameRoom.playerIds.includes(player.id)) {
      throw new GameRoomActionError("The player is already in the game room.");
    }

    gameRoom = await this.gameRoomRepo.update(gameRoom.id, {
      playerIds: [...gameRoom.playerIds, player.id],
    });

    // Start the game if there are enough players
    if (gameRoom.playerIds.length >= 2) {
      gameRoom = await this.gameRoomRepo.update(gameRoom.id, {
        status: "playing",
      });
      await this.gameStateRepo.create({
        id: uuidv4(),
        gameRoomId: gameRoom.id,
        pitchHolderId: null,
        rollHolderId: null,
        currentGyro: { pitch: 0, yaw: 0, roll: 0 },
      });
    }

    return gameRoom;
  }

  public async getRoom(playerId: string, gameRoomId: string): Promise<GameRoom> {
    const player = await this.playerRepo.getById(playerId);
    const gameRoom = await this.gameRoomRepo.getById(gameRoomId);
    if (!gameRoom.playerIds.includes(player.id)) {
      throw new GameRoomAuthError();
    }
    return gameRoom;
  }

  public async closeRoom(playerId: string, gameRoomId: string): Promise<void> {
    const player = await this.playerRepo.getById(playerId);
    const gameRoom = await this.gameRoomRepo.getById(gameRoomId);
    if (!gameRoom.playerIds.includes(player.id)) {
      throw new GameRoomAuthError();
    }

    try {
      await this.gameStateRepo.deleteByGameRoomId(gameRoomId);
    } catch (err) {} // Ignore error if game state is not found

    await this.gameRoomRepo.update(gameRoom.id, {
      status: "finished",
    });
  }

  public async getGameState(playerId: string, gameRoomId: string): Promise<GameState> {
    const gameState = await this.gameStateRepo.getByGameRoomId(gameRoomId);
    if (playerId === this.gameStateWatcherId) {
      // For low latency, the game state watcher can access the game state without checking the player ID.
      return gameState;
    }

    const gameRoom = await this.gameRoomRepo.getById(gameRoomId);
    if (!gameRoom.playerIds.includes(playerId)) {
      throw new GameRoomAuthError();
    }
    return gameState;
  }

  public async updateGyro(playerId: string, gameRoomId: string, gyro: Gyro): Promise<void> {
    const gameState = await this.gameStateRepo.getByGameRoomId(gameRoomId);

    if (gameState.pitchHolderId === playerId) {
      gameState.currentGyro.pitch = gyro.pitch;
    } else if (gameState.rollHolderId === playerId) {
      gameState.currentGyro.roll = gyro.roll;
    } else {
      throw new GameRoomAuthError();
    }

    await this.gameStateRepo.updateByGameRoomId(gameRoomId, gameState);
  }

  public async takeGyroAxis(playerId: string, gameRoomId: string, axis: "pitch" | "roll"): Promise<GameState> {
    const gameRoom = await this.gameRoomRepo.getById(gameRoomId);
    if (!gameRoom.playerIds.includes(playerId)) {
      throw new GameRoomAuthError();
    }

    const gameState = await this.gameStateRepo.getByGameRoomId(gameRoomId);

    // if axis is already taken by another player, exchange the axis
    if (axis === "pitch") {
      const prevPitchHolderId = gameState.pitchHolderId;
      gameState.pitchHolderId = playerId;
      if (prevPitchHolderId) {
        gameState.rollHolderId = prevPitchHolderId;
      }
    } else if (axis === "roll") {
      const prevRollHolderId = gameState.rollHolderId;
      gameState.rollHolderId = playerId;
      if (prevRollHolderId) {
        gameState.pitchHolderId = prevRollHolderId;
      }
    } else {
      throw new GameRoomActionError("Invalid axis.");
    }

    return this.gameStateRepo.updateByGameRoomId(gameRoomId, gameState);
  }
}
