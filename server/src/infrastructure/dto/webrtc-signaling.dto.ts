import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class WebRTCSignalingCommonDto {
  @IsString()
  @IsNotEmpty()
  messageId!: string;
}

export class WebRTCSignalingAckDto extends WebRTCSignalingCommonDto {
  @IsBoolean()
  @IsNotEmpty()
  isSuccess!: boolean;

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsOptional()
  payload?: {
    turnUsername?: string; // TURN 서버 사용자 이름
    turnCredential?: string; // TURN 서버 비밀번호
  };
}

export class WebRTCSignalingRegisterDto extends WebRTCSignalingCommonDto {
  @IsString()
  @IsNotEmpty()
  localId!: string;

  @IsString()
  @IsNotEmpty()
  remoteId!: string;

  @IsString()
  @IsNotEmpty()
  roomId!: string;
}

export class WebRTCSignalingOfferDto extends WebRTCSignalingCommonDto {
  @IsString()
  @IsNotEmpty()
  sdp!: string;
}

export class WebRTCSignalingAnswerDto extends WebRTCSignalingCommonDto {
  @IsString()
  @IsNotEmpty()
  sdp!: string;
}

export class WebRTCSignalingIceCandidateDto extends WebRTCSignalingCommonDto {
  @IsString()
  @IsNotEmpty()
  candidate!: string;

  @IsString()
  @IsNotEmpty()
  sdpMid!: string;

  @IsNumber()
  @IsNotEmpty()
  sdpMLineIndex!: number;
}
