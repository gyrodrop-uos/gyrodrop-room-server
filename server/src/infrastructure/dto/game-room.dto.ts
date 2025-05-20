import { ApiProperty } from "@nestjs/swagger";
import { GyroDTO } from "./gyro.dto";

export class GameRoomDTO {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001" })
  hostId!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174002" })
  guestId!: string | null;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  createdAt!: Date;

  @ApiProperty({ type: String, nullable: true, example: null })
  pitchHolderId!: string | null;

  @ApiProperty({ type: String, nullable: true, example: null })
  rollHolderId!: string | null;

  @ApiProperty({ type: () => GyroDTO })
  currentGyro!: GyroDTO;
}
