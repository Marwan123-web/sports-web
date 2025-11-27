// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Map all errors to 404 in production for security
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      // Detailed errors in staging/development
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const message =
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal server error';
        
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
