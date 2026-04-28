import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'refreshToken은 비어 있을 수 없습니다' })
  refreshToken!: string;
}
