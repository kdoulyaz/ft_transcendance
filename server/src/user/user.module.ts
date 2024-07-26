import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MulterModule } from '@nestjs/platform-express';
// import { WebSocketService } from 'src/chat/chat.gateway.service';
// import { ChatModule } from 'src/chat/chat.module';
// import { WebSocketService } from 'src/chat/chat.gateway.service';

@Module({
    imports: [
        MulterModule.register({
            dest: './upload'
        })
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
