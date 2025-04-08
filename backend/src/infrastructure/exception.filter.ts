import { EntityNotFoundError, GameRoomActionError, GameRoomAuthError, InternalError } from "@/errors";

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // Bypass NestJS's default exception filter
    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json(exception.getResponse());
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    // After bypassing, we can handle our custom exceptions
    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof GameRoomActionError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof GameRoomAuthError) {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
    } else if (exception instanceof InternalError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error (manually triggered)";
      console.error("Internal error:", exception);
    } else {
      console.error("Unknown error:", exception);
    }
    res.status(status).json({
      statusCode: status,
      message,
    });
  }
}
