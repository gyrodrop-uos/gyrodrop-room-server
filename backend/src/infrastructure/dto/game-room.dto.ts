import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNotEmpty } from "class-validator";

export class GameRoomBaseDto {
  @ApiProperty()
  @IsNotEmpty()
  playerId!: string;
}

export class GameRoomOpenDto extends GameRoomBaseDto {
  @ApiProperty()
  @IsNotEmpty()
  stageId!: string;
}

export class UpdateGyroDto {
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

export class TakeGyroAxisDto extends GameRoomBaseDto {
  @ApiProperty({ enum: ["pitch", "roll"] })
  @IsNotEmpty()
  @IsIn(["pitch", "roll"])
  @Type(() => String)
  axis!: "pitch" | "roll";
}
