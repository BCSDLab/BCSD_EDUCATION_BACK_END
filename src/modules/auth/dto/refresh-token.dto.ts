import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '재발급 또는 로그아웃에 사용할 refresh token',
  })
  @IsString()
  @IsNotEmpty({ message: 'refreshToken은 비어 있을 수 없습니다' })
  refreshToken!: string;
}
