import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 비어 있을 수 없습니다' })
  password!: string;
}
