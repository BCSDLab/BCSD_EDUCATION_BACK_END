import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/swagger/api-success-response.decorator';
import { AuthService } from './auth.service';
import { InvitationService } from './invitation.service';
import {
  InvitationCreateResponseDto,
  InvitationDetailResponseDto,
  RegisterResponseDto,
  TokenResponseDto,
} from './dto/auth-response.dto';
import {
  invitationDetailResponseExample,
  inviteResponseExample,
  registerResponseExample,
  tokenResponseExample,
} from './dto/auth-response.examples';
import { InviteDto } from './dto/invite.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly invitationService: InvitationService,
  ) {}

  @Post('invite')
  @ApiOperation({ summary: '초대 링크 생성' })
  @ApiHeader({
    name: 'x-user-id',
    required: true,
    description: '임시 관리자 식별용 헤더',
  })
  @ApiSuccessResponse({
    status: 201,
    description: '초대 링크가 생성되었습니다.',
    model: InvitationCreateResponseDto,
    pathExample: '/auth/invite',
    dataExample: inviteResponseExample,
  })
  invite(
    @Headers('x-user-id') userId: string | undefined,
    @Body() dto: InviteDto,
  ) {
    return this.invitationService.invite(userId, dto);
  }

  @Get('invitations/:token')
  @ApiOperation({ summary: '초대 링크 정보 조회' })
  @ApiParam({
    name: 'token',
    description: '초대 링크 토큰',
  })
  @ApiSuccessResponse({
    description: '초대 링크 정보가 조회되었습니다.',
    model: InvitationDetailResponseDto,
    pathExample: '/auth/invitations/example-token',
    dataExample: invitationDetailResponseExample,
  })
  getInvitation(@Param('token') token: string) {
    return this.invitationService.getInvitation(token);
  }

  @Post('register')
  @ApiOperation({ summary: '초대 기반 회원가입' })
  @ApiSuccessResponse({
    status: 201,
    description: '회원가입이 완료되었습니다.',
    model: RegisterResponseDto,
    pathExample: '/auth/register',
    dataExample: registerResponseExample,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일/비밀번호 로그인' })
  @ApiSuccessResponse({
    description: '로그인에 성공했습니다.',
    model: TokenResponseDto,
    pathExample: '/auth/login',
    dataExample: tokenResponseExample,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'access token 재발급' })
  @ApiSuccessResponse({
    description: '토큰이 재발급되었습니다.',
    model: TokenResponseDto,
    pathExample: '/auth/refresh',
    dataExample: tokenResponseExample,
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '로그아웃' })
  @ApiNoContentResponse({ description: '로그아웃이 완료되었습니다.' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }
}
