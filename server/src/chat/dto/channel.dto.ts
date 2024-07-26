import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class ChannelDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsBoolean()
    isPrivate: boolean;

    @ApiProperty()
    @IsBoolean()
    isPassword: boolean;

    @ApiProperty()
    @IsString()
    @IsOptional()
    password: string;
}
