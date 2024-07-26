import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies';
import { Api42Strategy } from './strategies/api42.strategy';
import { TwoFaStrategy } from './strategies/tf.strategy';
import { AuthMiddleware } from './middleware/auth.middleware';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        HttpModule,
        PassportModule,
        UserModule,
        JwtModule.registerAsync({
            useFactory: async () => {
                return {
                    secret: process.env.JWT_SECRET,
                    signOptions: {
                        expiresIn: '3600m'
                    }
                };
            },
            inject: [ConfigService]
        })
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        Api42Strategy,
        JwtStrategy,
        TwoFaStrategy,
        AuthMiddleware
    ],
    exports: [AuthService, JwtStrategy, Api42Strategy, TwoFaStrategy]
})
export class AuthModule {}
