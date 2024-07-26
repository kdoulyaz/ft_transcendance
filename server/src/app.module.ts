import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AtGuard } from './common/guards';
import {
    PrismaModule,
    providePrismaClientExceptionFilter
} from 'nestjs-prisma';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { TwoFactorAuthenticationModule } from './two-factor-authentication/two-factor-authentication.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        PrismaModule.forRoot({ isGlobal: true }),
        UserModule,
        ChatModule,
        GameModule,
        TwoFactorAuthenticationModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            serveRoot: '/public',
            serveStaticOptions: {
                index: false
            }
        })
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AtGuard
        },
        providePrismaClientExceptionFilter()
    ]
})
export class AppModule {}
