import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    MaxLength,
    IsBoolean
} from 'class-validator';

export class UserEntity {
    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(65_000)
    avatarUrl: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    wins: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    losses: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    played: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    rank: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    score: number;

    @ApiProperty()
    @IsBoolean()
    online: boolean;

    @ApiProperty()
    friendRequests: string[];
    @ApiProperty()
    friendRequestsSent: string[];
    @ApiProperty()
    friends: string[];

    @ApiProperty()
    blockedUsers: string[];
    @ApiProperty()
    blockedBy: string[];

    @ApiProperty()
    twoFactorEnabled: boolean;

    @Exclude()
    passwordHash: string;

    @Exclude()
    refreshTokenHash: string;

    @Exclude()
    twoFactorSecret: string;
}
