import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateUsernameDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    @Transform(({ value }: TransformFnParams) => value?.trim())
    username: string;
}

export class UpdateEmailDto {
    @ApiProperty()
    @IsString()
    @IsEmail()
    @MaxLength(50)
    @IsNotEmpty()
    email: string;
}
