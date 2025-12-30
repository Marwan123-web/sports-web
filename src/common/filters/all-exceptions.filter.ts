import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // ✅ ALWAYS LOG TO CONSOLE (even production)
    // this.logger.error(
    //   `[${request.method}] ${request.url} - ${status}`,
    //   {
    //     timestamp: new Date().toISOString(),
    //     exception: exception instanceof Error ? exception.stack : exception,
    //     message: typeof message === 'string' ? message : JSON.stringify(message),
    //     userAgent: request.headers['user-agent'],
    //     ip: request.ip || request.headers['x-forwarded-for'],
    //   },
    // );

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // ✅ Production: Hide details BUT still log
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
        exception:
          exception instanceof Error ? exception.message : 'Unknown error',
      });
    }
  }
}
