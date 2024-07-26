import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MuteUserDto, UnmuteUserDto, SendMessageDto } from './dto/dto';
import { RoomService } from './room.service';
import { parse } from 'cookie';
// import { WsException } from '@nestjs/websockets';

@Injectable()
export class WebSocketService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly roomService: RoomService, 
		private readonly jwt: JwtService
	) {}

	async joinUserSocketToItsRooms(
		userSocket: string,
		userId: string,
		server: Server
	) {
		let joinedRooms;
		try {
			joinedRooms = await this.roomService.getMyRooms(userId);
			const dms = await this.getAllDms(userId);
			for (let j = 0; j < dms.length; j++) {
				server.in(userSocket).socketsJoin(dms[j]?.name);
			}
			if (!joinedRooms) {
				return;
			}
			for (let i = 0; i < joinedRooms.length; i++) {
				server.in(userSocket).socketsJoin(joinedRooms[i].roomTitle);
			}
		} catch (err) {}
	}

	async getUserFromAccessToken(client: any) {
		if (!client || !client.handshake ) return null;
		const cookie = client.handshake.headers?.cookie;
		if (!cookie) return null;
		const { jwtToken } = parse(cookie);
		try {
			const jwtCheck = await this.jwt.verify(jwtToken, {
				secret: process.env.AT_SECRET
			});
			return { userData: jwtCheck, state: true };
		} catch (err) {
			return null
		}
	}

	async getUser(client: Socket) {
		if (!client || !client.handshake ) return null;
		const cookie = client.handshake.headers?.cookie;
		if (!cookie) return null;
		const { jwtToken } = parse(cookie);
		if (!jwtToken) return null;
		const decoded = await this.jwt.decode(jwtToken);
		const email = decoded['email'];
		const user = await this.prisma.user.findUnique({
			where: {
				email: email
			},
			select: {
				id: true,
				name: true,
				email: true,
				score: true,
				updatedAt: true,
				wins: true,
				losses: true,
				rank: true,
				playTime: true,
				gamesHistory: true
			}
		});
		return user;
	}

	async retrieveAccessToken(cookie: string): Promise<string> {
		const index = cookie.indexOf(';');
		const accessToken = cookie.slice(12, index);
		return accessToken;
	}

	async muteUser(muteUserDto: MuteUserDto, userId: string) {
		try {
			await this.roomService.muteUser(muteUserDto, userId);
		} catch (err) {}
	}

	async unmuteUser(unmuteUserDto: UnmuteUserDto, userId: string) {
		try {
			await this.roomService.unmuteUser(unmuteUserDto, userId);
		} catch (err) {}
	}

	async createMessage(payload: SendMessageDto, userId: string) {
		try {
			const { room, newMessage } = await this.roomService.createMessage(
				payload,
				userId
			);
			return { room, newMessage };
		} catch (err) {
			const message = err;
			throw Error(message);
		}
	}

	async joinUserSocketToGlobalChat(userSocket: string, server: Server) {
		const title = 'GlobalChat';
		server.in(userSocket).socketsJoin(title);
	}

	async createDm(user1id: string, user2id: string, loggedUserId: string) {
		// const title: string = user1id + user2id;
		const user = await this.prisma.user.findUnique({
			where: { id: user2id }
		});
		const newDm = await this.prisma.channel.create({
			data: {
				name: user.name,
				picture: user.avatarUrl,
				members: {
					connect: [{ id: loggedUserId }, { id: user2id }]
				},
				dm: true
			},
			include: {
				members: true,
				messages: true
			}
		});
		return newDm;
	}

	async CheckForExistingDmRoom(
		user1id: string,
		user2id: string,
		loggedUserId: string
	) {
		const dm = await this.prisma.channel.findFirst({
			where: {
				AND: [
					{ members: { some: { id: user1id } } },
					{ members: { some: { id: user2id } } }
				]
			},
			include: {
				members: true,
				messages: true
			}
		});

		if (!dm) {
			const newDm = await this.createDm(user1id, user2id, loggedUserId);
			return newDm;
		}
		return dm;
	}

	async sendDM(user1id: string, roomId: string, message: string) {
		// if ((await this.allowedToSendMessage(user1id, roomId)) === false) {
		//     throw new HttpException(
		//         'You do not have permission to send messages in this channel',
		//         HttpStatus.BAD_REQUEST
		//     );
		// }

		const channel = await this.prisma.channel.findUnique({
			where: {
				id: roomId
			}
		});

		if (!channel) {
			throw new HttpException(
				'Channel with this id does not exist',
				HttpStatus.BAD_REQUEST
			);
		}

		return await this.prisma.message.create({
			data: {
				message: message,
				room: {
					connect: {
						id: roomId
					}
				},
				sender: {
					connect: {
						id: user1id
					}
				},
				nickName: '',
				avatar: ''
			},
			select: {
				id: true,
				message: true,
				createdAt: true,
				roomId: true,
				senderId: true
			}
		});
	}

	async getAllDms(userId: string) {
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
				name: true,
				members: true,
				picture: true
			}
		});

		return dms;
	}

	async allowedToSendMessage(userId: string, channelId: string) {
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: channelId
			},
			select: {
				members: true,
				blocked: true,
				muted: true,
				dm: true
			}
		});

		if (!channel) {
			return false;
		}

		if (channel.dm) {
			if (!channel.members.find((u) => u.id === userId)) {
				return false;
			}

			const otherUser = await this.prisma.user.findFirst({
				where: {
					id: channel.members.find((u) => u.id !== userId).id
				},
				select: {
					blockedUsers: true
				}
			});

			if (otherUser.blockedUsers.find((u) => u === userId)) {
				return false;
			}
		}
		if (
			!channel.members.find((u) => u.id === userId) ||
			!channel.blocked.find((u) => u.id === userId)
		) {
			return false;
		}

		return true;
	}
}
