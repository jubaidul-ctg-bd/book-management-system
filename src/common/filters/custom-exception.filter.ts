import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let statusCode: number;
    let message: string;
    let error: string;

    // Handle Mongoose validation errors
    if (exception instanceof mongoose.Error.ValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = Object.values(exception.errors)[0]?.message;
      error = this.getErrorNameFromStatus(statusCode);
    }
    // Handle MongoDB duplicate key errors (e.g., unique constraint violations like ISBN)
    else if (
      exception instanceof MongoServerError &&
      exception.code === 11000
    ) {
      statusCode = HttpStatus.CONFLICT;
      const keyValue = exception.keyValue as Record<string, any>;
      const duplicateField = keyValue ? Object.keys(keyValue)[0] : undefined;
      message = duplicateField
        ? `${duplicateField} already exists`
        : 'Duplicate field value';
      error = this.getErrorNameFromStatus(statusCode);
    }
    // Handle Mongoose CastError (e.g., invalid ObjectId)
    else if (exception instanceof mongoose.Error.CastError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Invalid ID format';
      error = this.getErrorNameFromStatus(statusCode);
    }
    // Handle NestJS HttpExceptions
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = this.getErrorNameFromStatus(statusCode);
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, any>;
        message = String(
          responseObj.message || responseObj.error || exception.message,
        );
        error = this.getErrorNameFromStatus(statusCode);

        // Handle validation pipe errors with multiple messages
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message[0];
          error = this.getErrorNameFromStatus(statusCode);
        }
      } else {
        message = exception.message;
        error = this.getErrorNameFromStatus(statusCode);
      }
    }
    // Handle unknown errors
    else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Something went wrong';
      error = this.getErrorNameFromStatus(statusCode);
    }

    // Consistent error response format
    const errorResponse = {
      statusCode,
      message,
      error,
    };

    httpAdapter.reply(ctx.getResponse(), errorResponse, statusCode);
  }

  /**
   * Get standard error name based on HTTP status code
   */
  private getErrorNameFromStatus(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 422:
        return 'Unprocessable Entity';
      case 500:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
