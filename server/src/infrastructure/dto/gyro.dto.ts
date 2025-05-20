import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

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
