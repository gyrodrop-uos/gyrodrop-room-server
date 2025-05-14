import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNotEmpty } from "class-validator";

export class GyroDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  pitch!: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  yaw!: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  roll!: number;
}

export class GameRoomDTO {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001" })
  clientIds!: string[];

  @ApiProperty({ type: String, example: new Date().toISOString() })
  createdAt!: Date;

  @ApiProperty({ type: String, nullable: true, example: null })
  pitchHolderId!: string | null;

  @ApiProperty({ type: String, nullable: true, example: null })
  rollHolderId!: string | null;

  @ApiProperty({ type: () => GyroDTO })
  currentGyro!: GyroDTO;
}
