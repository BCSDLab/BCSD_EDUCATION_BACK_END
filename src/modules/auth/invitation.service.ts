import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InvitationStatus,
  Prisma,
  Role,
  SemesterHalf,
  TrackCode,
} from '@prisma/client';
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

    const semesterTrack = await this.findActiveSemesterTrack(
      dto.semesterId,
      dto.trackCode,
    );
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
          name: dto.name.trim(),
          semesterTrackId: semesterTrack.id,
          tokenHash,
          expiresAt,
          invitedById: inviter.id,
        },
      }),
    ]);

    return {
      email: dto.email,
      name: dto.name.trim(),
      semesterTrack: this.serializeSemesterTrack(semesterTrack),
      invitationToken: rawToken,
      expiresAt,
    };
  }

  async getInvitation(token: string) {
    const invitation = await this.findActiveInvitation(token);

    return {
      email: invitation.email,
      name: invitation.name,
      expiresAt: invitation.expiresAt,
      semesterTrack: this.serializeSemesterTrack(invitation.semesterTrack),
    };
  }

  async findActiveInvitation(token: string) {
    const tokenHash = this.authTokenService.hashToken(token);
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash },
      include: {
        semesterTrack: {
          include: {
            semester: true,
            track: true,
          },
        },
      },
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

    if (!invitation.semesterTrack.isActive) {
      throw new BadRequestException('현재 가입할 수 없는 초대입니다');
    }

    return invitation;
  }

  private async findActiveSemesterTrack(
    semesterId: number,
    trackCode: TrackCode,
  ) {
    const semesterTrack = await this.prisma.semesterTrack.findFirst({
      where: {
        semesterId,
        isActive: true,
        track: {
          code: trackCode,
        },
      },
      include: {
        semester: true,
        track: true,
      },
    });

    if (!semesterTrack) {
      throw new BadRequestException('활성화된 기수-트랙이 아닙니다');
    }

    return semesterTrack;
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

  private serializeSemesterTrack(
    semesterTrack: Prisma.SemesterTrackGetPayload<{
      include: {
        semester: true;
        track: true;
      };
    }>,
  ) {
    return {
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
    };
  }
}
