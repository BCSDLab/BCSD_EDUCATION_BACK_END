import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { InvitationService } from './invitation.service';
import { PasswordHasherService } from './password-hasher.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokenService,
    InvitationService,
    PasswordHasherService,
  ],
})
export class AuthModule {}
