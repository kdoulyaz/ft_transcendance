import {
    IsNumber,
    IsString,
    IsNotEmpty,
    MaxLength,
    IsOptional,
    IsEnum,
    IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlank } from './dec';
import { Transform, TransformFnParams } from 'class-transformer';

export enum RoomPrivacy {
    'PUBLIC',
    'PRIVATE',
    'PROTECTED'
}

export class AddUserToPrivateRoom {
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    userId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;
}

export class BanMemberDto {
    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    userId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomTitle: string;
}

export class changeRoomPasswordDto {
    @ApiProperty()
    @IsNumber()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    currentPassword: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    newPassword: string;
}

export class ChangeRoomAvatar {
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    id: string;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    newAvatar: string;
}

export class ChangeRoomInfoDto {
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    id: string;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    newAvatar: string;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    newPrivacy: RoomPrivacy;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    newTitle: string;

    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    password?: string;
}

export class ChangeRoomPrivacy {
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    id: string;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    newPrivacy: RoomPrivacy;

    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    password?: string;
}

export class ChangeRoomTitle {
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    id: string;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    newTitle: string;
}

export class CreateDmDto {
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    friendId: string;
}

export class CreateMessageDto {
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomTitle: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message: string;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    id: string;

    // @IsString()
    // name: string;
}

export class CreateRoomDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    // @IsNotBlank()
    roomTitle: string;

    @ApiProperty()
    @IsBoolean()
    isConversation: boolean;

    @ApiProperty()
    @IsEnum(RoomPrivacy)
    privacy: RoomPrivacy;

    @ApiProperty({
        required: false
    })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    password?: string;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    avatar: string;
}

export class EmitMessageDto {
    id: string;
    avatar?: string;
    nickName?: string;
    message: string;
    createdAt: Date;
    senderId: string;
}

export class GetRoomsDto {
    id: string;

    avatar: string;

    roomTitle: string;

    lastMessage?: string;

    nickName: string;

    lastMessageTime?: Date;

    privacy?: string;

    isRoom: boolean;
}

export class JoinRoomDto {
    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomTitle: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    password?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    notificationId?: number;
}

export class KickMemberDto {
    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    userId: string;

    @ApiProperty()
    @IsNumber()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomTitle: string;
}

export class LeaveRoomDto {
    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    id: string;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomTitle: string;
}

export class MuteUserDto {
    @ApiProperty()
    @IsNumber()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    userId: string;

    @ApiProperty()
    @IsNumber()
    muteDuration: number;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomTitle: string;
}

export class UnmuteUserDto {
    @ApiProperty()
    @IsNumber()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    userId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomTitle: string;
}

export class UnmuteUserDetails {
    roomID: string;
    userID: string;
    mutEDuration: Date;

    constructor(roomId: string, userId: string, muteDuration: Date) {
        this.roomID = roomId;
        this.userID = userId;
        this.mutEDuration = muteDuration;
    }
}

export class RemoveBanDto {
    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    userId: string;
}

export class SendMessageDto {
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    message: string;

    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    id: string;
}

export class SetAdminDto {
    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    userId: string;

    @ApiProperty()
    @IsNumber()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomTitle: string;
}

export class UnSetAdminDto {
    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    userId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomId: string;

    @ApiProperty()
    @IsString()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    roomTitle: string;
}
