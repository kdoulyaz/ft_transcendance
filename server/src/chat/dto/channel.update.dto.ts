import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class ChannelUpdateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    private: boolean;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    isPassword: boolean;

    @ApiProperty()
    @IsString()
    @IsOptional()
    password: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    picture: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    ownerId: string;
}
