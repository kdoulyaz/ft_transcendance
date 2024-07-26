import { Body, Controller, Get, Post, Req, Param } from '@nestjs/common';
import {
	CreateRoomDto,
	ChangeRoomPrivacy,
	ChangeRoomTitle,
	ChangeRoomAvatar,
	CreateDmDto,
	JoinRoomDto,
	LeaveRoomDto,
	SetAdminDto,
	KickMemberDto,
	BanMemberDto,
	RemoveBanDto,
	MuteUserDto,
	UnmuteUserDto,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	changeRoomPasswordDto,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	ChangeRoomInfoDto
} from './dto/dto';
import { RoomService } from './room.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WebSocketService } from './chat.gateway.service';
import { GetCurrentUserId } from 'src/common/decorators';

@ApiBearerAuth()
@ApiTags('Chat')
@Controller('chat')
export class ChatController {
	constructor(
		private readonly roomService: RoomService,
		private readonly wsService: WebSocketService
	) {}

	@Post('createRoom')
	async createRoom(@Req() req, @Body() createRoomDto: CreateRoomDto) {
		return await this.roomService.createRoom(createRoomDto, req.user.sub);
	}

	@Post('joinRoom')
	async joinRoom(@Req() req, @Body() joinRoomDto: JoinRoomDto) {
		return await this.roomService.joinRoom(joinRoomDto, req.user.sub);
	}

	@Post('leaveRoom')
	async leaveRoom(@Req() req, @Body() leaveRoomDto: LeaveRoomDto) {
		return await this.roomService.leaveRoom(leaveRoomDto, req.user.sub);
	}

	@Post('changeRoomPrivacy')
	async changeRoomPrivacy(
		@Req() req,
		@Body() changeRoomPrivacy: ChangeRoomPrivacy
	) {
		return await this.roomService.changeRoomPrivacy(
			changeRoomPrivacy,
			req.user.sub
		);
	}

	@Post('changeRoomTitle')
	async changeRoomTitle(
		@Req() req,
		@Body() changeRoomTitle: ChangeRoomTitle
	) {
		return await this.roomService.changeRoomTitle(
			changeRoomTitle,
			req.user.sub
		);
	}

	@Post('changeRoomAvatar')
	async changeRoomAvatar(
		@Req() req,
		@Body() changeRoomAvatar: ChangeRoomAvatar
	) {
		return await this.roomService.changeRoomAvatar(
			changeRoomAvatar,
			req.user.sub
		);
	}

	@Get('AllRooms')
	async getAllRooms(@Req() req) {
		return await this.roomService.getAllRooms(req.user.sub);
	}

	@Get('mydms')
	async getMyDms(@Req() req) {
		return this.roomService.getAllMyDms(req.user.sub);
	}

	@Get('myRooms')
	async getMyRooms(@Req() req) {
		return await this.roomService.getMyRooms(req.user.sub);
	}

	@Get('allChannels')
	async getAllChannels(@Req() req) {
		return await this.roomService.getAllChannels(req.user.sub);
	}

	@Get('/room/:id')
	async getRoomUsers(@Req() req, @Param('id') id: string) {
		return await this.roomService.getOneRoom(id, req.user.sub);
	}

	@Get('/dm/:id')
	async getDmRoom(@Req() req, @Param('id') id: string) {
		return await this.roomService.getDmRoom(id, req.user.sub);
	}

	@Post('setAdmin')
	async setUserToAdminRoom(@Req() req, @Body() setAdminDto: SetAdminDto) {
		return this.roomService.setUserToAdminRoom(setAdminDto, req.user.sub);
	}

	@Post('createDm')
	async createDm(
		@GetCurrentUserId() loggedUserId: string,
		@Req() req,
		@Body() createDmDto: CreateDmDto
	) {
		return this.wsService.CheckForExistingDmRoom(
			req.user.sub,
			createDmDto.friendId,
			loggedUserId
		);
	}

	@Post('kickMember')
	async kickMember(@Req() req, @Body() kickMemberDto: KickMemberDto) {
		return this.roomService.kickMember(kickMemberDto, req.user.sub);
	}

	@Post('banMember')
	async banMember(@Req() req, @Body() banMemberDto: BanMemberDto) {
		return this.roomService.banMember(banMemberDto, req.user.sub);
	}

	@Post('removeBan')
	async removeBan(@Req() req, @Body() removeBan: RemoveBanDto) {
		return this.roomService.removeBan(removeBan, req.user.sub);
	}

	@Post('changeRoomPassword')
	async changeRoomPassword(
		@Req() req,
		@Body() changeRoomPasswordDto: changeRoomPasswordDto
	) {
		return this.roomService.changeRoomPassword(
			changeRoomPasswordDto,
			req.user.sub
		);
	}

	@Post('muteUser')
	async muteUser(@Req() req, @Body() muteUserDto: MuteUserDto) {
		return this.roomService.muteUser(muteUserDto, req.user.sub);
	}

	@Post('unmuteUser')
	async unmuteUser(@Req() req, @Body() unmuteUserDto: UnmuteUserDto) {
		return this.roomService.unmuteUser(unmuteUserDto, req.user.sub);
	}

	@Post('changeRoomInfo')
	async changeRoomInfo(
		@Req() req,
		@Body() ChangeRoomInfoDto: ChangeRoomInfoDto
	) {
		return this.roomService.ChangeRoomInfo(ChangeRoomInfoDto, req.user.sub);
	}

	// @Post('addUserToPrivateRoom')
	// async addUserToPrivateRoom(
	//     @Req() req,
	//     @Body() addUser: AddUserToPrivateRoom
	// ) {
	//     return this.roomService.addUserToPrivateRoom(addUser, req.user.sub);
	// }
}
