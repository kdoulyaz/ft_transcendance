import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserChatDto {
    @ApiProperty()
    @IsString()
    id: string;
}
