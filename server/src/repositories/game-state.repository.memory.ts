import { EntityNotFoundError } from "@/errors";
import { GameState } from "@/interfaces/models";
import { GameStateRepository } from "@/interfaces/repositories";

export class GameStateInMemoryRepository implements GameStateRepository {
  private gameStates: Map<string, GameState> = new Map();

  public async getById(id: string): Promise<GameState> {
    const gameState = this.gameStates.get(id);
    if (!gameState) {
      throw new EntityNotFoundError(`GameState with id ${id} not found.`);
    }
    return gameState;
  }

  public async create(entity: GameState): Promise<GameState> {
    this.gameStates.set(entity.id, entity);
    return entity;
  }

  public async update(id: string, entity: Partial<GameState>): Promise<GameState> {
    const existingGameState = await this.getById(id);
    const updatedGameState = { ...existingGameState, ...entity };
    this.gameStates.set(id, updatedGameState);
    return updatedGameState;
  }

  public async delete(id: string): Promise<GameState> {
    const gameState = await this.getById(id);
    this.gameStates.delete(id);
    return gameState;
  }

  public async findAll(): Promise<{ entities: GameState[]; total: number }> {
    const gameStatesArray = Array.from(this.gameStates.values());
    const total = gameStatesArray.length;
    return { entities: gameStatesArray, total };
  }

  public async getByGameRoomId(gameRoomId: string): Promise<GameState> {
    const gameState = Array.from(this.gameStates.values()).find((state) => state.gameRoomId === gameRoomId);
    if (!gameState) {
      throw new EntityNotFoundError(`GameState with gameRoomId ${gameRoomId} not found.`);
    }
    return gameState;
  }

  public async updateByGameRoomId(gameRoomId: string, entity: Partial<GameState>): Promise<GameState> {
    const gameState = await this.getByGameRoomId(gameRoomId);
    const updatedGameState = { ...gameState, ...entity };
    this.gameStates.set(gameRoomId, updatedGameState);
    return updatedGameState;
  }

  public async deleteByGameRoomId(gameRoomId: string): Promise<GameState> {
    const gameState = await this.getByGameRoomId(gameRoomId);
    this.gameStates.delete(gameRoomId);
    return gameState;
  }
}
