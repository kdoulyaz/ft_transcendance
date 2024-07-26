import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
	forwardRef
} from '@nestjs/common';  
import { Inject } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
	JoinRoomDto,
	CreateRoomDto,
	MuteUserDto,
	LeaveRoomDto,
	UnmuteUserDto,
	SetAdminDto,
	UnSetAdminDto,
	KickMemberDto,
	UnmuteUserDetails,
	BanMemberDto,
	RemoveBanDto,
	changeRoomPasswordDto,
	ChangeRoomPrivacy,
	ChangeRoomAvatar,
	ChangeRoomTitle,
	ChangeRoomInfoDto,
	GetRoomsDto,
	SendMessageDto,
	AddUserToPrivateRoom
} from './dto/dto';

enum RoomPrivacy {
	'PUBLIC',
	'PRIVATE',
	'PROTECTED'
}
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatGateway } from './chat.gateway';

import * as argon from 'argon2';
import { DmEntity } from './entities';
import { join } from 'path';
// import { isDecimal } from 'class-validator';

export enum Actions {
	transfer = 'transfer',
	delete = 'delete',
	addAdmin = 'addAdmin',
	removeAdmin = 'removeAdmin',
	block = 'block',
	unblock = 'unblock',
	mute = 'mute',
	unmute = 'unmute',
	addUser = 'addUser',
	removeUser = 'removeUser',
	join = 'join',
	leave = 'leave',
	sendMessage = 'sendMessage',
	addUserToRoom = 'addUserToRoom'
}

@Injectable()
export class RoomService {
	private mutedUsers: Map<string, UnmuteUserDetails> = new Map<
		string,
		UnmuteUserDetails
	>();

	constructor(
		private readonly prisma: PrismaService,
		@Inject(forwardRef(() => ChatGateway))
		private readonly emit: ChatGateway
	) {}

	async createRoom(createRoomDto: CreateRoomDto, userId: string) {
		let hashedPassword: string;
		let isPassword: boolean;
		let isPrivate: boolean = false;
		if (createRoomDto.privacy === RoomPrivacy.PROTECTED) {
			hashedPassword = await argon.hash(createRoomDto.password);
			isPassword = true;
		} else {
			hashedPassword = null;
			isPassword = false;
		}

		if (createRoomDto.privacy === RoomPrivacy.PRIVATE) isPrivate = true;
		const channel = await this.prisma.channel.create({
			data: {
				name: createRoomDto.roomTitle,
				private: isPrivate,
				isPassword: isPassword,
				password: hashedPassword,
				picture: createRoomDto.avatar,
				owner: {
					connect: {
						id: userId
					}
				},
				members: {
					connect: {
						id: userId
					}
				}
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				ownerId: true,
				admins: true,
				members: true,
				blocked: true,
				muted: true
			}
		});

		const roomCreated: GetRoomsDto = {
			id: channel.id,
			avatar: channel.picture,
			roomTitle: channel.name,
			lastMessage: '',
			nickName: channel.name,
			lastMessageTime: null,
			isRoom: true
		};
		return roomCreated;
	}

	async joinRoom(joinRoomDto: JoinRoomDto, userId: string) {
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: joinRoomDto.roomId
			},
			select: {
				members: true,
				isPassword: true,
				password: true,
				dm: true,
				blocked: true
			}
		});

		if (!channel) {
			throw new HttpException(
				'Channel with this id does not exist',
				HttpStatus.BAD_REQUEST
			);
		}
		const blockedids = channel.blocked.map(user => user.id);
		if (blockedids.includes(userId)) {
			throw new HttpException(
				'You are banned from this channel forever',
				HttpStatus.BAD_REQUEST
			);
		}

		if (channel.dm) {
			throw new HttpException(
				'This is a direct message channel',
				HttpStatus.BAD_REQUEST
			);
		}

		if (channel.members.find((u) => u.id === userId)) {
			throw new HttpException(
				'You are already a member of this channel',
				HttpStatus.BAD_REQUEST
			);
		}

		// console.log(channel.password, 'join password ', joinRoomDto);
		if (
			channel.isPassword &&
			(joinRoomDto.password === '' || !joinRoomDto.password)
		) {
			throw new HttpException(
				'You have to provide the password to join this channel',
				HttpStatus.BAD_REQUEST
			);
		}
		if (channel.isPassword) {
			const isPasswordValid = await argon.verify(
				channel.password,
				joinRoomDto.password
			);
			if (!isPasswordValid) {
				throw new HttpException(
					'Invalid password for this channel',
					HttpStatus.FORBIDDEN
				);
			}
		}

		const room = await this.prisma.channel.update({
			where: {
				id: joinRoomDto.roomId
			},
			data: {
				members: {
					connect: {
						id: userId
					}
				}
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				members: true,
				admins: true,
				ownerId: true
			}
		});
		const roomCreated: GetRoomsDto = {
			id: room.id,
			avatar: room.picture,
			roomTitle: room.name,
			lastMessage: '',
			nickName: room.name,
			lastMessageTime: null,
			isRoom: true
		};

		return roomCreated;
	}

	async leaveRoom(
		leaveRoomDto: LeaveRoomDto,
		userId: string
	): Promise<string> {
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: leaveRoomDto.id
			},
			select: {
				members: true,
				ownerId: true,
				dm: true
			}
		});

		if (!channel) {
			return 'Channel with this id does not exist';
		}

		if (channel.dm) {
			return 'This is a direct message channel';
		}

		if (channel.ownerId === userId) {
			return 'You cannot leave a channel you own';
		}

		if (!channel.members.find((u) => u.id === userId)) {
			return 'You are not a member of this channel';
		}

		const res = await this.prisma.channel.update({
			where: {
				id: leaveRoomDto.id
			},
			data: {
				members: {
					disconnect: {
						id: userId
					}
				}
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				members: true,
				admins: true,
				ownerId: true
			}
		});
		if (!res)
			return 'something went wrong, you will not leave';
		return 'Goodbye!';
	}

	async getAllRooms(userId: string) {
		const allRooms = [];

		const rooms = await this.prisma.channel.findMany({
			where: {
				NOT: [
					{
						members: {
							some: {
								id: userId
							}
						},
						blocked: {
							some: {
								id: userId
							}
						}
					}
				],
				dm: false,
				private: false
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				ownerId: true,
				admins: true,
				members: true,
				messages: true
			}
		});
		// console.log('allrooms', rooms);
		rooms.forEach((item) => {
			const privacy = item.isPassword ? 'PROTECTED' : 'PUBLIC';

			const singleRoom = {
				id: item.id,
				picture: item.picture,
				name: item.name,
				isRoom: true,
				privacy: privacy
			};
			allRooms.push(singleRoom);
		});

		return allRooms;
	}

	async getOneRoom(roomId: string, userId: string) {
		const loggedUser = await this.prisma.user.findUnique({where: { id: userId }});
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: roomId,
				dm: false
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				ownerId: true,
				admins: true,
				members: true,
				messages: true
			}
		});

		if (!channel) {
			throw new HttpException(
				'Channel with this id does not exist',
				HttpStatus.BAD_REQUEST
			);
		}

		if (!channel.members.find((u) => u.id === userId)) {
			throw new HttpException(
				'You are not a member of this channel',
				HttpStatus.BAD_REQUEST
			);
		}
		// if (
		// 	channel.ownerId === userId ||
		// 	channel.admins.find((u) => u.id === userId)
		// ) {
		// 	return channel;
		// }


		
		const oneRoom = await this.prisma.channel.findUnique({
			where: {
				id: roomId
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				ownerId: true,
				admins: true,
				members: true,
				messages: true
			}
		});

		// console.log(loggedUser.blockedUsers, '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
		const messages = oneRoom.messages.filter((msg) => {
			if (loggedUser.blockedUsers.includes(msg.senderId) || loggedUser.blockedBy.includes(msg.senderId)) {
				// console.log(msg, '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++||||||');
				return false;
			}
				
			return true;
		});

		return {...oneRoom, messages};
	}

	async getDmRoom(dmId: string, userId: string) {
		// console.log(dmId, '            ', userId);
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: dmId
			},
			include: {
				members: true,
				messages: true
			}
		});
		if (!channel) {
			throw new HttpException('NO channel', HttpStatus.NOT_FOUND);
		}

		// if (!channel.members.find((u) => u.id === userId)) {
		//     throw new HttpException(
		//         'You are not a member of this channel',
		//         HttpStatus.BAD_REQUEST
		//     );
		// }

		// channel.members = channel.members.filter((user) => userId != user.id);
		// this.emit.joinDm(userId, channel.name);
		// console.log('                       ', channel);
		const currentUser = channel.members.filter((user) => user.id != userId);
		// console.log(
		// 	'                                                                  : ',
		// 	currentUser
		// );
		return { ...channel, currentUserId: currentUser[0]?.id };
	}

	async setUserToAdminRoom(
		setAdminDto: SetAdminDto,
		userId: string
	): Promise<string> {
		const can = await this.CanDoAction(
			userId,
			setAdminDto.roomId,
			Actions.addAdmin
		);
		if (!can) {
			return 'You do not have permissions';
		}
		const newAdminId: string = setAdminDto.userId;
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: setAdminDto.roomId
			},
			select: {
				blocked: true,
				ownerId: true
			}
		});
		// console.log('mouniaaaa ');
		// console.log(setAdminDto.roomId)
		if (!channel) {
			return 'Channel with this id does not exist';
		}

		if (channel.ownerId !== userId) {
			return 'You are not the owner of this channel';
		}

		const user = await this.prisma.user.findUnique({
			where: {
				id: newAdminId
			}
		});

		if (channel.blocked.find((u) => u.id === user.id)) {
			return 'This user is blocked in this channel';
		}
		const res = await this.prisma.channel.update({
			where: {
				id : setAdminDto.roomId,
			},
			data: {
				admins: {
					connect: {
						id: newAdminId
					}
				}
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				members: true,
				blocked: true,
				muted: true,
				admins: true,
				ownerId: true
			}
		});
		if (!res) return 'Error happened';
		return 'Member is now admin';
	}

	async removeFromAdmins(
		unSetAdminDto: UnSetAdminDto,
		userId: string
	): Promise<string> {
		const can = await this.CanDoAction(
			userId,
			unSetAdminDto.roomId,
			Actions.removeAdmin
		);
		if (!can) {
			return 'You do not have permissions';
		}
		const removeUserId: string = unSetAdminDto.userId;
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: unSetAdminDto.roomId
			},
			select: {
				admins: true,
				ownerId: true
			}
		});

		if (!channel) {
			return 'Channel with this id does not exist';
		}

		if (channel.ownerId !== userId) {
			return 'You are not the owner of this channel';
		}

		if (!channel.admins.find((u) => u.id === removeUserId)) {
			return 'This user is not an admin in this channel';
		}

		const res = await this.prisma.channel.update({
			where: {
				id: unSetAdminDto.roomId
			},
			data: {
				admins: {
					disconnect: {
						id: removeUserId
					}
				}
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				members: true,
				blocked: true,
				muted: true,
				admins: true,
				ownerId: true
			}
		});

		if (!res) return 'Error happened';
		return 'Member is not admin anymore';
	}

	async kickMember(kickMemberDto: KickMemberDto, userId: string) {
		const can = await this.CanDoAction(
			userId,
			kickMemberDto.roomId,
			Actions.removeUser
		);
		if (!can) {
			return 'You do not have permissions';
		}
		const removeUserId: string = kickMemberDto.userId;
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: kickMemberDto.roomId
			},
			select: {
				dm: true
			}
		});

		if (!channel) {
			return 'Channel with this id does not exist';
		}

		if (channel.dm) {
			return 'This is a direct message channel';
		}
		const user = await this.prisma.user.findUnique({
			where: {
				id: removeUserId
			},
			select: {
				name: true
			}
		});

		if (!user) {
			return 'User with this id does not exist';
		}

		const res = await this.prisma.channel.update({
			where: {
				id: kickMemberDto.roomId
			},
			data: {
				members: {
					disconnect: {
						id: removeUserId
					}
				}
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				members: true,
				blocked: true,
				muted: true,
				admins: true,
				ownerId: true
			}
		});
		if (!res) return 'Error happened while kicking';
		return user.name + ' is kicked';
	}

	async changeRoomTitle(changeRoomTitle: ChangeRoomTitle, userId: string) {
		if (!this.CanDoAction(userId, changeRoomTitle.id, Actions.removeUser)) {
			throw new HttpException(
				'You do not have permission to remove an admin from this channel',
				HttpStatus.UNAUTHORIZED
			);
		}
		await this.prisma.channel.update({
			where: {
				id: changeRoomTitle.id
			},
			data: {
				name: changeRoomTitle.newTitle
			}
		});
	}

	async changeRoomAvatar(changeRoomAvatar: ChangeRoomAvatar, userId: string) {
		if (
			!this.CanDoAction(userId, changeRoomAvatar.id, Actions.removeUser)
		) {
			throw new HttpException(
				'You do not have permission to remove an admin from this channel',
				HttpStatus.UNAUTHORIZED
			);
		}

		const id = changeRoomAvatar.id;
		await this.prisma.channel.update({
			where: {
				id: id
			},
			data: {
				picture: changeRoomAvatar.newAvatar
			}
		});
	}

	async changeRoomPrivacy(
		changeRoomPrivacy: ChangeRoomPrivacy,
		userId: string
	): Promise<string> {
		const can = await this.CanDoAction(userId, changeRoomPrivacy.id, Actions.transfer)
		if (!can) {
			return ('You do not have permissions');
		}
		// if (changeRoomPrivacy.newPrivacy === RoomPrivacy.PROTECTED) {
		// 	const password = await argon.hash(changeRoomPrivacy.password);
		// 	const id = changeRoomPrivacy.id;
		// 	await this.prisma.channel.update({
		// 		where: {
		// 			id: id
		// 		},
		// 		data: {
		// 			password: password,
		// 			isPassword: true,
		// 			private: true
		// 		}
		// 	});
		// } else {
		// 	await this.prisma.channel.update({
		// 		where: {
		// 			id: changeRoomPrivacy.id
		// 		},
		// 		data: {
		// 			private:
		// 				changeRoomPrivacy.newPrivacy === RoomPrivacy.PRIVATE
		// 					? true
		// 					: false
		// 		}
		// 	});
		// }
		if (changeRoomPrivacy.password === '') {
			const res = await this.prisma.channel.update({
				where: {
					id: changeRoomPrivacy.id
				},
				data: {
					password: '',
					isPassword: false,
					private: false
				}
			});
			if (!res)
				return 'Error happened';
			return 'Password is removed. This room is now public.';
		}
	}

	async getMyRooms(userId: string) {
		const channels = await this.prisma.channel.findMany({
			where: {
				members: {
					some: {
						id: userId
					}
				},
				dm: false
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				ownerId: true,
				admins: true,
				members: true
			}
		});

		return channels;
	}

	async banMember(
		banMemberDto: BanMemberDto,
		userId: string
	): Promise<string> {
		const can = await this.CanDoAction(
			userId,
			banMemberDto.roomId,
			Actions.block
		);
		if (!can) {
			return 'You do not have permissions';
		}
		const blockUserId: string = banMemberDto.userId;
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: banMemberDto.roomId
			},
			select: {
				members: true,
				dm: true,
				// blocked: true
			}
		});

		if (!channel) {
			return 'Channel with this id does not exist';
		}

		if (channel.dm) {
			return 'This is a direct message channel';
		}

		if (!channel.members.find((u) => u.id === blockUserId)) {
			return 'This user is not a member of this channel';
		}

		const res = await this.prisma.channel.update({
			where: {
				id: banMemberDto.roomId
			},
			data: {
				blocked: {
					connect: {
						id: blockUserId
					}
				},
				members: {
					disconnect: {
						id: blockUserId
					}
				}
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				members: true,
				blocked: true,
				muted: true,
				admins: true,
				ownerId: true
			}
		});

		if (!res) return 'Error happened';
		return 'Member is banned';
	}

	async removeBan(removeBan: RemoveBanDto, userId: string): Promise<string> {
		const can = await this.CanDoAction(userId, removeBan.roomId, Actions.block);
		if (!can) {
			return 'You do not have permissions';
		}
		const unblockUserId: string = removeBan.userId;
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: removeBan.roomId
			},
			select: {
				blocked: true,
				ownerId: true,
				admins: true,
				dm: true
			}
		});

		if (!channel) {
			return 'Channel with this id does not exist';
		}

		if (channel.dm) {
			return 'This is a direct message channel';
		}

		if (!channel.blocked.find((u) => u.id === unblockUserId)) {
			return 'This user is not blocked in this channel';
		}

		const res = await this.prisma.channel.update({
			where: {
				id: removeBan.roomId
			},
			data: {
				blocked: {
					disconnect: {
						id: unblockUserId
					}
				}
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				members: true,
				blocked: true,
				muted: true,
				admins: true,
				ownerId: true
			}
		});

		if (!res) return 'Error happened';
		return 'Member is unbanned';
	}

	async changeRoomPassword(
		changeRoomPasswordDto: changeRoomPasswordDto,
		userId: string
	): Promise<string> {
		const can = await this.CanDoAction(
			userId,
			changeRoomPasswordDto.roomId,
			Actions.unblock
		);
		if (!can) {
			return 'You do not have permissions';
		}

		const newPassword = await argon.hash(changeRoomPasswordDto.newPassword);
		const res = await this.prisma.channel.update({
			where: {
				id: changeRoomPasswordDto.roomId
			},
			data: {
				password: newPassword,
				isPassword: true
			}
		});

		if (!res) {
			return 'Error happened password';
		} else {
			return 'New password is set';
		}
	}

	async muteUser(muteUserDto: MuteUserDto, userId: string): Promise<string> {
		if (await !this.CanDoAction(userId, muteUserDto.roomId, Actions.mute)) {
			return;
			('You do not have permission to mute a user in this channel');
		}
		const unmuteTime = new Date();
		unmuteTime.setMinutes(
			unmuteTime.getMinutes() + muteUserDto.muteDuration
		);
		try {
			const roomWithMutedUsers = await this.prisma.channel.findUnique({
				where: {
					id: muteUserDto.roomId
				},
				select: {
					muted: true
				}
			});

			await this.prisma.channel.updateMany({
				where: {
					id: muteUserDto.roomId
				},
				data: {
					muted: {
						set: [...roomWithMutedUsers.muted, muteUserDto.userId]
					}
				}
			});

			await this.prisma.channel.findUnique({
				where: {
					id: muteUserDto.roomId
				},
				select: {
					muted: true
				}
			});
		} catch (e) {
			return e.message;
		}
		const userDetails = new UnmuteUserDetails(
			muteUserDto.roomId,
			muteUserDto.userId,
			unmuteTime
		);
		this.mutedUsers.set(muteUserDto.userId, userDetails);
		return 'Member is muted';
	}

	async unmuteUser(unmuteUserDto: UnmuteUserDto, userId): Promise<string> {
		const can = await this.CanDoAction(
			userId,
			unmuteUserDto.roomId,
			Actions.mute
		);
		if (!can) {
			return 'You do not have permissions';
		}

		const roomWithMutedUsers = await this.prisma.channel.findUnique({
			where: {
				id: unmuteUserDto.roomId
			},
			select: {
				muted: true
			}
		});
		if (!roomWithMutedUsers) return 'Error happened';
		const res = await this.prisma.channel.updateMany({
			where: {
				id: unmuteUserDto.roomId
			},
			data: {
				muted: {
					set: roomWithMutedUsers.muted.filter(
						(mutedUser) => mutedUser !== unmuteUserDto.userId
					)
				}
			}
		});
		if (!res) return 'Error happened';
		this.mutedUsers.delete(unmuteUserDto.userId);

		return 'Member is unmuted';
	}

	async addUserToPrivateRoom(
		addUser: AddUserToPrivateRoom,
		userId: string
	): Promise<string> {
		const can = await this.CanDoAction(
			userId,
			addUser.roomId,
			Actions.addUserToRoom
		);
		if (!can) {
			return 'You do not have permissions';
		}
		const room = await this.prisma.channel.findUnique({
			where: {
				id: addUser.roomId,
				private: true
			},
			select: {
				members: true
			}
		});

		if (!room) return 'Not private channel';

		const res = await this.prisma.channel.update({
			where: {
				id: addUser.roomId,
				private: true
			},
			data: {
				members: {
					connect: {
						id: addUser.userId
					}
				}
			}
		});

		if (!res) return 'Error happend';
		return 'Member is added';
	}

	// @Cron(CronExpression.EVERY_10_SECONDS)
	// async checkUsersToUnmute() {
	// 	this.mutedUsers.forEach((mutedUntil) => {
	// 		const currentTime = new Date();
	// 		if (currentTime >= mutedUntil.mutEDuration) {
	// 			this.unmuteUserForCron(mutedUntil);
	// 		}
	// 	});
	// }

	// async unmuteUserForCron(unmuteUser: UnmuteUserDetails) {
	// 	const roomWithMutedUsers = await this.prisma.channel.findUnique({
	// 		where: {
	// 			id: unmuteUser.roomID
	// 		},
	// 		select: {
	// 			muted: true
	// 		}
	// 	});

	// 	await this.prisma.channel.updateMany({
	// 		where: {
	// 			id: unmuteUser.roomID
	// 		},
	// 		data: {
	// 			muted: {
	// 				set: roomWithMutedUsers.muted.filter(
	// 					(mutedUser) => mutedUser !== unmuteUser.userID
	// 				)
	// 			}
	// 		}
	// 	});

	// 	this.mutedUsers.delete(unmuteUser.userID);
	// 	this.emit.unmuteUser(unmuteUser);
	// }

	async isUserMuted(roomId: string, userToCheck: string) {
		const roomWithMutedUsers = await this.prisma.channel.findUnique({
			where: {
				id: roomId
			},
			select: {
				muted: true
			}
		});

		if (roomWithMutedUsers.muted.includes(userToCheck)) {
			return false;
		} else {
			return true;
		}
	}

	async createMessage(sendMessageDto: SendMessageDto, senderId: string) {
		let room = await this.prisma.channel.findFirst({
			where: {
				id: sendMessageDto.id
			},
			include: {
				messages: true
			}
		});

		const user = await this.prisma.user.findUnique({
			where: {
				id: senderId
			}
		});

		if (await this.isUserMuted(room.id, senderId)) {
			const newMessage = await this.prisma.message.create({
				data: {
					message: sendMessageDto.message,
					avatar: user.avatarUrl,
					nickName: user.name,
					sender: {
						connect: {
							id: senderId
						}
					},
					room: {
						connect: {
							id: room.id
						}
					}
				},
				include: {
					sender: true,
					room: true
				}
			});

			room = await this.prisma.channel.findFirst({
				where: {
					id: sendMessageDto.id
				},
				include: {
					messages: true
				}
			});

			return { room, newMessage };
		} else {
			return null;
		}
	}

	async getAllMyDms(userId: string) {
		const dms = await this.prisma.channel.findMany({
			where: {
				members: {
					some: {
						id: userId
					}
				},
				dm: true
			},
			select: {
				id: true,
				members: true,
				picture: true
			}
		});

		const dmEntities = dms.map((dm) => {
			const userBId = dm.members.find((u) => u.id !== userId).id;
			const avatar = dm.members.find((u) => u.id !== userId).avatarUrl;
			return new DmEntity({ id: dm.id, userId: userBId, avatar });
		});
		return dmEntities;
	}

	async getAllChannels(userId: string) {
		const channels = await this.prisma.channel.findMany({
			where: {
				members: {
					some: {
						id: userId
					}
				}
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				picture: true,
				private: true,
				isPassword: true,
				ownerId: true,
				admins: true,
				members: true,
				dm: true
			}
		});

		return channels.map((c) => {
			if (c.dm) {
				const user =
					c.members[0].id === userId ? c.members[1] : c.members[0];

				return {
					...c,
					id: c.id,
					private: c.private,
					isRoom: !c.dm,
					isPassword: c.isPassword,
					name: user.name,
					picture: user.avatarUrl
				};
			}
			return { ...c, isRoom: true };
		});
	}

	async ChangeRoomInfo(changeRoomInfoDto: ChangeRoomInfoDto, userId: string) {
		if (!this.CanDoAction(userId, changeRoomInfoDto.id, Actions.transfer)) {
			throw new HttpException(
				'You do not have permission to unblock a user in this channel',
				HttpStatus.UNAUTHORIZED
			);
		}
		const id = changeRoomInfoDto.id;
		if (changeRoomInfoDto.newPrivacy === RoomPrivacy.PROTECTED) {
			const password = await argon.hash(changeRoomInfoDto.password);
			await this.prisma.channel.update({
				where: {
					id: id
				},
				data: {
					password: password,
					isPassword: true
				}
			});
		} else {
			await this.prisma.channel.update({
				where: {
					id: id
				},
				data: {
					private:
						changeRoomInfoDto.newPrivacy === RoomPrivacy.PRIVATE
							? true
							: false,
					picture: changeRoomInfoDto.newAvatar,
					name: changeRoomInfoDto.newTitle
				}
			});
		}
	}

	// async addUserToPrivateRoom(addUser: AddUserToPrivateRoom) {
	//     const roomWithPrvMembers = await this.prisma.channel.findUnique({
	//         where: {
	//             id: addUser.roomId
	//         }
	//     });

	//     await this.prisma.channel.updateMany({
	//         where: {
	//             id: addUser.roomId
	//         },
	//         data: {
	//             privateMembers: {
	//                 set: [...roomWithPrvMembers.privateMembers, addUser.userId]
	//             }
	//         }
	//     });
	//     this.emit.joinPrvRoom({
	//         roomId: addUser.roomId,
	//         roomTitle: roomWithPrvMembers.roomTitle,
	//         userId: addUser.userId
	//     });
	// }

	async getUserData(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId
			}
		});

		const userData = {
			email: user.email,
			nickname: user.name,
			avatar: user.avatarUrl
		};

		return userData;
	}

	async CanDoAction(userId: string, id: string, action: string) {
		// return true;
		const channel = await this.prisma.channel.findUnique({
			where: {
				id
			},
			select: {
				members: true,
				admins: true,
				ownerId: true,
				blocked: true,
				muted: true,
				dm: true
			}
		});
		if (!channel) return false;

		if (
			channel.dm &&
			(action === Actions.sendMessage ||
				action === Actions.block ||
				action === Actions.unblock ||
				action === Actions.mute ||
				action === Actions.unmute ||
				action === Actions.addUserToRoom ||
				action === Actions.delete)
				) {
					return true;
				}
				if (channel.dm) {
					return false;
				}
				
				if (channel.ownerId === userId) {
					// console.log('tayfot ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++==')
					return true;
				}

		if (
			channel.admins.find((u) => u.id === userId) &&
			action !== Actions.transfer &&
			action !== Actions.delete &&
			action !== Actions.addAdmin &&
			action !== Actions.removeAdmin
		) {
			return true;
		}

		if (
			channel.members.find((u) => u.id === userId) &&
			!channel.blocked.find((u) => u.id === userId) &&
			!channel.muted.find((i) => i === userId) &&
			(action === Actions.sendMessage ||
				action === Actions.join ||
				action === Actions.leave)
		) {
			return true;
		}

		return false;
	}
}
