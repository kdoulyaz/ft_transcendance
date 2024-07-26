import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { JwtService } from '@nestjs/jwt';
import { WebSocketService } from './chat.gateway.service';
import { RoomService } from './room.service';

@Module({
    controllers: [ChatController],
    providers: [RoomService, JwtService, WebSocketService, ChatGateway],
    exports: [RoomService, WebSocketService, ChatGateway]
})
export class ChatModule {}
