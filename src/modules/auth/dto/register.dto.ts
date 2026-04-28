import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
} from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '초대 토큰은 비어 있을 수 없습니다' })
  token!: string;

  @Type(() => Number)
  @IsInt({ message: 'semesterTrackId는 정수여야 합니다' })
  @Min(1, { message: 'semesterTrackId는 1 이상이어야 합니다' })
  semesterTrackId!: number;

  @IsString()
  @IsNotEmpty({ message: '이름은 비어 있을 수 없습니다' })
  name!: string;

  @IsString()
  @Matches(PASSWORD_REGEX, {
    message:
      '비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다',
  })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호 확인은 비어 있을 수 없습니다' })
  passwordConfirm!: string;

  @IsBoolean({ message: '운영 규정 동의 여부는 boolean이어야 합니다' })
  agreeTerms!: boolean;

  @IsBoolean({ message: '개인정보처리방침 동의 여부는 boolean이어야 합니다' })
  agreePrivacy!: boolean;
}
