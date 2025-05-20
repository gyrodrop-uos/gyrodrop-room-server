import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { isHandlerableError } from "@/errors/common.error";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // Bypass NestJS's default exception filter
    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        errorType: exception.name,
        errorMessage: exception.message,
      });
    }

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let name: string = "InternalServerError";
    let message: string = "Internal server error";

    // After bypassing, we can handle our custom exceptions
    if (isHandlerableError(exception)) {
      status = exception.getHttpStatusCode();
      name = exception.getErrorType();
      message = exception.getErrorMessage();
    } else if (exception instanceof Error) {
      console.error("Unhandled error:", exception);
    }

    res.status(status).json({
      statusCode: status,
      errorType: name,
      errorMessage: message,
    });
  }
}
