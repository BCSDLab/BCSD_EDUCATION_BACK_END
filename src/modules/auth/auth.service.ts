import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InvitationStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokenService } from './auth-token.service';
import { InvitationService } from './invitation.service';
import { PasswordHasherService } from './password-hasher.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitationService: InvitationService,
    private readonly authTokenService: AuthTokenService,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다',
      );
    }
    if (!dto.agreeTerms || !dto.agreePrivacy) {
      throw new BadRequestException(
        '운영 규정과 개인정보처리방침 동의는 필수입니다',
      );
    }

    const invitation = await this.invitationService.findActiveInvitation(
      dto.token,
    );
    const semesterTrack = await this.prisma.semesterTrack.findUnique({
      where: { id: dto.semesterTrackId },
      select: { id: true, isActive: true },
    });

    if (!semesterTrack || !semesterTrack.isActive) {
      throw new BadRequestException('활성화된 기수-트랙이 아닙니다');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true },
    });
    if (existingUser) {
      throw new BadRequestException('이미 가입된 이메일입니다');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const agreedAt = new Date();

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: invitation.email,
          password: passwordHash,
          name: dto.name.trim(),
          role: Role.BEGINNER,
          agreedTermsAt: agreedAt,
          agreedPrivacyAt: agreedAt,
        },
      });

      await tx.userSemesterTrack.create({
        data: {
          userId: createdUser.id,
          semesterTrackId: semesterTrack.id,
          role: Role.BEGINNER,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
          acceptedUserId: createdUser.id,
        },
      });

      return createdUser;
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    }
    if (!user.isActive) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    }

    const isPasswordValid = await this.passwordHasher.verify(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    }

    return this.authTokenService.issueTokens(user.id, user.email, user.role);
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.authTokenService.verifyRefreshToken(
      dto.refreshToken,
    );
    const refreshTokenHash = this.authTokenService.hashToken(dto.refreshToken);

    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash },
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.authSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });

      return this.authTokenService.issueTokens(
        user.id,
        user.email,
        user.role,
        tx,
      );
    });
  }

  async logout(dto: RefreshTokenDto) {
    const refreshTokenHash = this.authTokenService.hashToken(dto.refreshToken);
    const result = await this.prisma.authSession.updateMany({
      where: {
        refreshTokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      revoked: result.count > 0,
    };
  }
}
