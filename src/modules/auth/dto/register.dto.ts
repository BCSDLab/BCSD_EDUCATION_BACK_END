import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, Matches } from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export class RegisterDto {
  @ApiProperty({
    example: '6f3edfa77f3f9b93034aa3b4a90474e0c2d6f23f4b0e3b2b14f7a4e0fbc0c912',
    description: '초대 링크에서 전달받은 토큰',
  })
  @IsString()
  @IsNotEmpty({ message: '초대 토큰은 비어 있을 수 없습니다' })
  token!: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description: '8자 이상, 영문/숫자/특수문자 포함 비밀번호',
  })
  @IsString()
  @Matches(PASSWORD_REGEX, {
    message:
      '비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다',
  })
  password!: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description: '비밀번호 확인',
  })
  @IsString()
  @IsNotEmpty({ message: '비밀번호 확인은 비어 있을 수 없습니다' })
  passwordConfirm!: string;

  @ApiProperty({
    example: true,
    description: '운영 규정 및 개인정보처리방침 통합 동의 여부',
  })
  @IsBoolean({ message: '약관 동의 여부는 boolean이어야 합니다' })
  agreePolicies!: boolean;
}
