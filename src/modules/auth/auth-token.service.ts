import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from './auth.types';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async issueTokens(
    userId: number,
    email: string,
    role: Role,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.getOrThrow<string>(
        'JWT_ACCESS_EXPIRES_IN',
      ) as never,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as never,
    });

    await tx.authSession.create({
      data: {
        userId,
        refreshTokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(
          Date.now() +
            this.parseDurationToMs(
              this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
            ),
        ),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        role,
      },
    };
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async verifyRefreshToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다');
    }
  }

  private parseDurationToMs(value: string) {
    if (/^\d+$/.test(value)) {
      return Number(value) * 1000;
    }

    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`지원하지 않는 duration 형식입니다: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`지원하지 않는 duration 단위입니다: ${unit}`);
    }
  }
}
