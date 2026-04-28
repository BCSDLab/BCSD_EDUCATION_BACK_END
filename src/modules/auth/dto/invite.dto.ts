import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class InviteDto {
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다' })
  email!: string;
}
