import { GameRoom, GameStage, GameState, Player } from "./models";

/**
 * Repository interface for CRUD operations.
 * If the entity of the specified id is not found, each method will throw an error(NotFoundError).
 *
 * @template T - The type of the entity.
 * @template Q - The type of the query options.
 */
interface Repository<T, Q = void> {
  getById: (id: string) => Promise<T>;
  create: (entity: T) => Promise<T>;
  update: (id: string, entity: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<T>;
  findAll: (options: Q) => Promise<{
    entities: T[];
    total: number;
  }>;
}

interface CommonQueryOptions {
  page: number;
  pageSize: number;
}

export interface PlayerRepository extends Repository<Player, CommonQueryOptions> {}
export interface GameStageRepository extends Repository<GameStage> {}
export interface GameRoomRepository extends Repository<GameRoom, CommonQueryOptions> {}
export interface GameStateRepository extends Repository<GameState> {
  getByGameRoomId: (gameRoomId: string) => Promise<GameState>;
  updateByGameRoomId: (gameRoomId: string, entity: Partial<GameState>) => Promise<GameState>;
  deleteByGameRoomId: (gameRoomId: string) => Promise<GameState>;
}
