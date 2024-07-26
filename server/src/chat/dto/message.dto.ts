import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MessagetDto {
    constructor(partial: Partial<MessagetDto>) {
        Object.assign(this, partial);
    }

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    writeId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    channelId: string;
}
