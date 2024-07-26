import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class UsersDto {
    @ApiProperty()
    @IsArray()
    ids: string[];
}
