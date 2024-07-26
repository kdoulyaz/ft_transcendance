import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChatRoomEntity {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    channelId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    socketId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string;
}
