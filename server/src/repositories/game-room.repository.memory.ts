import { EntityNotFoundError } from "@/errors";
import { GameRoom } from "@/interfaces/models";
import { GameRoomRepository } from "@/interfaces/repositories";

export class GameRoomInMemoryRepository implements GameRoomRepository {
  private gameRooms: Map<string, GameRoom> = new Map();

  public async getById(id: string): Promise<GameRoom> {
    const gameRoom = this.gameRooms.get(id);
    if (!gameRoom) {
      throw new EntityNotFoundError(`GameRoom with id ${id} not found.`);
    }
    return gameRoom;
  }

  public async create(entity: GameRoom): Promise<GameRoom> {
    this.gameRooms.set(entity.id, entity);
    return entity;
  }

  public async update(id: string, entity: Partial<GameRoom>): Promise<GameRoom> {
    const existingGameRoom = await this.getById(id);
    const updatedGameRoom = { ...existingGameRoom, ...entity };
    this.gameRooms.set(id, updatedGameRoom);
    return updatedGameRoom;
  }

  public async delete(id: string): Promise<GameRoom> {
    const gameRoom = await this.getById(id);
    this.gameRooms.delete(id);
    return gameRoom;
  }

  public async findAll(options: { page: number; pageSize: number }): Promise<{ entities: GameRoom[]; total: number }> {
    const gameRoomsArray = Array.from(this.gameRooms.values());
    const total = gameRoomsArray.length;
    const startIndex = (options.page - 1) * options.pageSize;
    const endIndex = startIndex + options.pageSize;
    const entities = gameRoomsArray.slice(startIndex, endIndex);
    return { entities, total };
  }
}
