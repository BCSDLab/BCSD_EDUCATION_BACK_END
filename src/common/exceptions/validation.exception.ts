import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export interface FieldError {
  field: string;
  messages: string[];
}

export class ValidationException extends HttpException {
  readonly fields: FieldError[];

  constructor(errors: ValidationError[]) {
    const fields = ValidationException.flatten(errors);
    super(
      {
        code: 'VALIDATION_FAILED',
        message: '입력값 검증 실패',
        fields,
      },
      HttpStatus.BAD_REQUEST,
    );
    this.fields = fields;
  }

  private static flatten(errors: ValidationError[], parent = ''): FieldError[] {
    const result: FieldError[] = [];

    for (const err of errors) {
      const field = parent ? `${parent}.${err.property}` : err.property;

      if (err.constraints) {
        result.push({
          field,
          messages: Object.values(err.constraints),
        });
      }

      if (err.children && err.children.length > 0) {
        result.push(...ValidationException.flatten(err.children, field));
      }
    }

    return result;
  }
}
