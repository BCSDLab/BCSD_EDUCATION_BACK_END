import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InvitationService } from './invitation.service';
import { InviteDto } from './dto/invite.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly invitationService: InvitationService,
  ) {}

  @Post('invite')
  invite(
    @Headers('x-user-id') userId: string | undefined,
    @Body() dto: InviteDto,
  ) {
    return this.invitationService.invite(userId, dto);
  }

  @Get('invitations/:token')
  getInvitation(@Param('token') token: string) {
    return this.invitationService.getInvitation(token);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }
}
