import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvitationStatus, Role, SemesterHalf } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { InviteDto } from './dto/invite.dto';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async invite(invitedByHeader: string | undefined, dto: InviteDto) {
    const invitedById = this.parseUserId(invitedByHeader);
    const inviter = await this.prisma.user.findUnique({
      where: { id: invitedById },
      select: { id: true, role: true, isActive: true },
    });

    if (!inviter || !inviter.isActive || inviter.role !== Role.ADMIN) {
      throw new ForbiddenException('초대 권한이 없습니다');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existingUser) {
      throw new BadRequestException('이미 가입된 이메일입니다');
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.authTokenService.hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() +
        this.config.getOrThrow<number>('INVITATION_TOKEN_TTL_HOURS') *
          60 *
          60 *
          1000,
    );

    await this.prisma.$transaction([
      this.prisma.invitation.updateMany({
        where: {
          email: dto.email,
          status: InvitationStatus.PENDING,
        },
        data: {
          status: InvitationStatus.CANCELLED,
        },
      }),
      this.prisma.invitation.create({
        data: {
          email: dto.email,
          tokenHash,
          expiresAt,
          invitedById: inviter.id,
        },
      }),
    ]);

    return {
      email: dto.email,
      invitationToken: rawToken,
      expiresAt,
    };
  }

  async getInvitation(token: string) {
    const invitation = await this.findActiveInvitation(token);
    const semesterTracks = await this.prisma.semesterTrack.findMany({
      where: { isActive: true },
      include: {
        semester: true,
        track: true,
      },
      orderBy: [{ semester: { year: 'desc' } }, { track: { code: 'asc' } }],
    });

    return {
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      semesterTracks: semesterTracks.map((semesterTrack) => ({
        id: semesterTrack.id,
        semester: {
          year: semesterTrack.semester.year,
          half: semesterTrack.semester.half,
          label: this.formatSemester(
            semesterTrack.semester.year,
            semesterTrack.semester.half,
          ),
        },
        track: {
          code: semesterTrack.track.code,
          name: semesterTrack.track.name,
        },
      })),
    };
  }

  async findActiveInvitation(token: string) {
    const tokenHash = this.authTokenService.hashToken(token);
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash },
    });

    if (!invitation) {
      throw new NotFoundException('유효하지 않은 초대 링크입니다');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('사용할 수 없는 초대 링크입니다');
    }

    if (invitation.expiresAt <= new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('만료된 초대 링크입니다');
    }

    return invitation;
  }

  private parseUserId(userIdHeader: string | undefined) {
    const userId = Number(userIdHeader);
    if (!userIdHeader || Number.isNaN(userId) || userId < 1) {
      throw new UnauthorizedException('x-user-id 헤더가 필요합니다');
    }

    return userId;
  }

  private formatSemester(year: number, half: SemesterHalf) {
    const shortYear = String(year).slice(-2);
    const label = half === SemesterHalf.FIRST_HALF ? '상반기' : '하반기';

    return `${shortYear}-${label}`;
  }
}
