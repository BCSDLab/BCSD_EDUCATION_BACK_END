import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  FieldError,
  ValidationException,
} from '../exceptions/validation.exception';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: FieldError[];
  };
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = this.buildErrorBody(exception, request.originalUrl);
    const status = this.resolveStatus(exception);

    response.status(status).json(body);
  }

  private buildErrorBody(exception: unknown, path: string): ApiErrorResponse {
    const base = {
      success: false as const,
      timestamp: new Date().toISOString(),
      path,
    };

    if (exception instanceof ValidationException) {
      return {
        ...base,
        error: {
          code: 'VALIDATION_FAILED',
          message: '입력값 검증 실패',
          fields: exception.fields,
        },
      };
    }

    if (exception instanceof HttpException) {
      return {
        ...base,
        error: {
          code: HttpStatus[exception.getStatus()] ?? 'HTTP_ERROR',
          message: this.extractHttpMessage(exception),
        },
      };
    }

    if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Unknown exception thrown', exception);
    }

    return {
      ...base,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '서버 오류가 발생했습니다',
      },
    };
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractHttpMessage(exception: HttpException): string {
    const res = exception.getResponse();

    if (typeof res === 'string') {
      return res;
    }

    if (typeof res === 'object' && res !== null) {
      const obj = res as Record<string, unknown>;
      const msg = obj.message;

      if (Array.isArray(msg)) {
        return msg.join(', ');
      }
      if (typeof msg === 'string') {
        return msg;
      }
    }

    return exception.message;
  }
}
