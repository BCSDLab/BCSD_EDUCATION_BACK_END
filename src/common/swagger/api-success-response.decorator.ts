import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

interface ApiSuccessResponseOptions<TModel extends Type<unknown>> {
  description: string;
  model: TModel;
  status?: 200 | 201;
  pathExample?: string;
  dataExample?: unknown;
}

export const ApiSuccessResponse = <TModel extends Type<unknown>>({
  description,
  model,
  status = 200,
  pathExample = '/',
  dataExample,
}: ApiSuccessResponseOptions<TModel>) => {
  const responseDecorator = status === 201 ? ApiCreatedResponse : ApiOkResponse;

  return applyDecorators(
    ApiExtraModels(model),
    responseDecorator({
      description,
      schema: {
        title: `SuccessResponseOf${model.name}`,
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            $ref: getSchemaPath(model),
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2026-04-28T09:00:00.000Z',
          },
          path: {
            type: 'string',
            example: pathExample,
          },
        },
        required: ['success', 'data', 'timestamp', 'path'],
        example: {
          success: true,
          data: dataExample,
          timestamp: '2026-04-28T09:00:00.000Z',
          path: pathExample,
        },
      },
    }),
  );
};
