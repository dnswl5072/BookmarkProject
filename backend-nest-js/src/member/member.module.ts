import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { CustomEncrypt, CustomUtils, FileAdapter } from 'src/publicComponents/utils';
import { Constraint } from 'src/publicComponents/constraint';
import { ApiClient } from 'src/publicComponents/apiClient';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { Authentication } from 'src/authentication/entities/authentication.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './entities/memberAuth.constant';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      Member, Authentication
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    
    
  ],
  controllers: [MemberController],
  providers: [MemberService, AuthenticationService, CustomUtils, Constraint, ApiClient, FileAdapter],
  exports : [MemberService]
})
export class MemberModule {}
