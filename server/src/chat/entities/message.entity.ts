import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MessagetEntity {
    constructor(partial: Partial<MessagetEntity>) {
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

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    id: string;
}
