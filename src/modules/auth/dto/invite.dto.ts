import { ApiProperty } from '@nestjs/swagger';
import { TrackCode } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class InviteDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '초대할 이메일 주소',
  })
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다' })
  email!: string;

  @ApiProperty({
    example: '홍길동',
    description: '초대 대상자 이름',
  })
  @IsString()
  @IsNotEmpty({ message: '이름은 비어 있을 수 없습니다' })
  name!: string;

  @ApiProperty({
    example: 1,
    description: '고정할 기수 ID',
  })
  @Type(() => Number)
  @IsInt({ message: 'semesterId는 정수여야 합니다' })
  @Min(1, { message: 'semesterId는 1 이상이어야 합니다' })
  semesterId!: number;

  @ApiProperty({
    enum: TrackCode,
    example: TrackCode.BACKEND,
    description: '고정할 트랙 코드',
  })
  @IsEnum(TrackCode, { message: '유효한 trackCode여야 합니다' })
  trackCode!: TrackCode;
}
