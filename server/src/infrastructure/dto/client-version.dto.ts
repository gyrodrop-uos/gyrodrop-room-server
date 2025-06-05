import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ClientVersionCheckResultDTO {
  @ApiProperty({
    description: "클라이언트 버전이 호환되는지 여부",
    example: true,
  })
  @IsNotEmpty()
  compatible!: boolean;

  @ApiProperty({
    description: "최신 클라이언트 버전",
    example: "1.0.0",
  })
  @IsNotEmpty()
  latestVersion!: string;
}
