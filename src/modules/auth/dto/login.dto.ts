import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '로그인할 이메일 주소',
  })
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다' })
  email!: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description: '로그인 비밀번호',
  })
  @IsString()
  @IsNotEmpty({ message: '비밀번호는 비어 있을 수 없습니다' })
  password!: string;
}
