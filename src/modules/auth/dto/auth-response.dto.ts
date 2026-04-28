import { ApiProperty } from '@nestjs/swagger';
import { Role, SemesterHalf, TrackCode } from '@prisma/client';

export class AuthUserResponseDto {
  @ApiProperty({
    example: 1,
    description: '회원 ID',
  })
  id!: number;

  @ApiProperty({
    example: 'user@example.com',
    description: '회원 이메일',
  })
  email!: string;

  @ApiProperty({
    example: '홍길동',
    description: '회원 이름',
  })
  name!: string;

  @ApiProperty({
    enum: Role,
    example: Role.BEGINNER,
    description: '회원 권한',
  })
  role!: Role;
}

export class InvitationSemesterResponseDto {
  @ApiProperty({
    example: 2026,
    description: '기수 연도',
  })
  year!: number;

  @ApiProperty({
    enum: SemesterHalf,
    example: SemesterHalf.FIRST_HALF,
    description: '상반기/하반기 구분',
  })
  half!: SemesterHalf;

  @ApiProperty({
    example: '26-상반기',
    description: '표시용 기수 라벨',
  })
  label!: string;
}

export class InvitationTrackResponseDto {
  @ApiProperty({
    enum: TrackCode,
    example: TrackCode.BACKEND,
    description: '트랙 코드',
  })
  code!: TrackCode;

  @ApiProperty({
    example: 'BackEnd',
    description: '트랙 표시명',
  })
  name!: string;
}

export class InvitationSemesterTrackResponseDto {
  @ApiProperty({
    example: 1,
    description: '기수-트랙 ID',
  })
  id!: number;

  @ApiProperty({
    type: () => InvitationSemesterResponseDto,
    description: '기수 정보',
  })
  semester!: InvitationSemesterResponseDto;

  @ApiProperty({
    type: () => InvitationTrackResponseDto,
    description: '트랙 정보',
  })
  track!: InvitationTrackResponseDto;
}

export class InvitationCreateResponseDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '초대된 이메일 주소',
  })
  email!: string;

  @ApiProperty({
    example: '홍길동',
    description: '초대 대상자 이름',
  })
  name!: string;

  @ApiProperty({
    type: () => InvitationSemesterTrackResponseDto,
    description: '고정된 기수-트랙 정보',
  })
  semesterTrack!: InvitationSemesterTrackResponseDto;

  @ApiProperty({
    example: '6f3edfa77f3f9b93034aa3b4a90474e0c2d6f23f4b0e3b2b14f7a4e0fbc0c912',
    description: '메일 발송 전 임시로 반환하는 초대 토큰',
  })
  invitationToken!: string;

  @ApiProperty({
    example: '2026-05-01T09:00:00.000Z',
    description: '초대 링크 만료 시각',
  })
  expiresAt!: Date;
}

export class InvitationDetailResponseDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '초대된 이메일 주소',
  })
  email!: string;

  @ApiProperty({
    example: '홍길동',
    description: '초대 대상자 이름',
  })
  name!: string;

  @ApiProperty({
    example: '2026-05-01T09:00:00.000Z',
    description: '초대 링크 만료 시각',
  })
  expiresAt!: Date;

  @ApiProperty({
    type: () => InvitationSemesterTrackResponseDto,
    description: '고정된 기수-트랙 정보',
  })
  semesterTrack!: InvitationSemesterTrackResponseDto;
}

export class RegisterResponseDto extends AuthUserResponseDto {}

export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token',
    description: 'access token',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token',
    description: 'refresh token',
  })
  refreshToken!: string;
}
