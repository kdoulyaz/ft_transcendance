import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate } from 'class-validator';

export class MuteDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty()
    @IsDate()
    @IsNotEmpty()
    until: Date;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    channelId: string;
}
