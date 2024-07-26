import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketServer,
	WsException
} from '@nestjs/websockets';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
	JoinRoomDto,
	CreateDmDto,
	SendMessageDto,
	EmitMessageDto,
	KickMemberDto,
	SetAdminDto,
	UnSetAdminDto,
	BanMemberDto,
	GetRoomsDto,
	MuteUserDto,
	UnmuteUserDetails,
	LeaveRoomDto,
	RoomPrivacy
} from './dto/dto';
import { PrismaService } from 'nestjs-prisma';
import { WebSocketService } from './chat.gateway.service';
import { RoomService } from './room.service';
import { parse } from 'cookie';
import { use } from 'passport';

const cmds = `Hello, I am Pongo bot, your lovely trainer <3. You can call me to help you with the following commands UwU

*General Commands*
/leave                  -> To leave the current room

*Admin Commands*
/add [username]         -> Adds a user to the private room
/kick [username]        -> Kicks a member from the room
/ban [username]         -> Bans a member from the room
/unban [username]       -> Unbans a member from the room
/mute [username]        -> Mutes a member for 5 minutes

*Owner Commands*
/password [newPassword] -> Changes room password
/admin [username]       -> Grants admin privileges
/unadmin [username]     -> Removes admin privileges`;

@WebSocketGateway({
    cors: {
        origin: [
            process.env.FRONTEND_URL,
            process.env.BACKEND_URL,
            process.env.DOMAIN,
            process.env.PUBLIC_URL
        ],
        credentials: true
    },
	namespace: '/chat'
})
@Injectable()
export class ChatGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	constructor(
		private readonly prisma: PrismaService,
		private readonly wsService: WebSocketService,
		@Inject(forwardRef(() => RoomService))
		private readonly roomService: RoomService
	) {}

	private usersSockets: Map<string, string> = new Map<string, string>();
	private usersStatus: Map<string, string> = new Map<string, string>();
	private mutedUsers: Map<string, NodeJS.Timeout> = new Map();

	@WebSocketServer() server: Server;

	private readonly logger = new Logger('ChatGateway');

	afterInit() {
		this.logger.log('Initialized');
	}

	public setStatus (user:any, state:string) {
		this.usersStatus.set(user.email, state);
	}
	public getStatus (user:any) {
		return this.usersStatus.get(user.email);
	}
	async handleConnection(client: Socket) {
		const userCheck = await this.wsService.getUser(client);

		if (!userCheck) this.handleDisconnect(client);
		else {
			this.usersSockets.set(userCheck.email, client.id);
			this.wsService.joinUserSocketToItsRooms(
				client.id,
				userCheck.id,
				this.server
			);
			if (this.usersStatus.has(userCheck.email) && this.usersStatus[userCheck.email] !== 'in game')
				this.usersStatus.set(userCheck.email, "online");
			await this.prisma.user.update({
				where: { id: userCheck.id },
				data: { online: {set : true} }
			});
			client.join(client.id);
		}
	}
	muteUser(userId: string): void {
		if (!this.mutedUsers.has(userId)) {
		  // Mute user for 5 minutes (300,000 milliseconds)
		  const unmuteTimeout = setTimeout(() => {
			this.unmuteUser(userId);
		  }, 300000);
	
		  this.mutedUsers.set(userId, unmuteTimeout);
		}
	  }
	
	  unmuteUser(userId: string): void {
		if (this.mutedUsers.has(userId)) {
		  // Clear the timeout and unmute the user
		  clearTimeout(this.mutedUsers.get(userId));
		  this.mutedUsers.delete(userId);
		}
	  }
	
	  isUserMuted(userId: string): boolean {
		return this.mutedUsers.has(userId);
	  }
	
	
	@SubscribeMessage("UserStatusResquest")
	handleGetUserStatus(client: Socket, email:string){
		if (this.usersStatus.has(email)) {
			client.emit("UserStatusResponse", this.usersStatus.get(email));
		}
		else
			client.emit("UserStatusResponse", "offline");
	}

	async takeRoomActions(
		userId: string,
		data: SendMessageDto
	): Promise<string> {
		const args: string[] = data.message.split(' ');
		// console.log('args:', args);
		if (args.length === 1 && args[0] === '/password') {
			const msg = await this.roomService.changeRoomPrivacy(
				{
					id: data.id,
					newPrivacy: RoomPrivacy.PUBLIC,
					password: ''
				},
				userId
			);
			return msg;
		}
		if (args.length === 1 && args[0] === '/leave') {
			const msg = await this.roomService.leaveRoom(
				{
					id: data.id,
					roomTitle: data.id
				},
				userId
			);
			this.server.to(userId).emit('getOut');
			return msg;
		}
		if (args.length === 1 && args[0] === '/help') {
			return cmds;
		}
		if (args.length === 1){
			return ('Invalid Command');
		}
		const member = args[1] ? await this.prisma.user.findUnique({
			where: {
				name: args[1],
			},
			select: {
				id: true,
			}
		}) : null;
		if (!member && args[0] !== '/password') {
			return `there's no ${args[1]}!`;
		}
		if (args.length === 2) {
			switch (args[0]) {
				case '/mute' :
				{
					this.muteUser(member.id);
					const msg = 'User is muted for a short period of time';
					return msg;
				}; 
				break ;
				case '/password':
					{
						const msg =
							await this.roomService.changeRoomPassword(
								{
									roomId: data.id,
									currentPassword: '',
									newPassword: args[1]
								},
								userId
							);
						return msg;
					};

				case '/add':
					{
						const msg =
							await this.roomService.addUserToPrivateRoom(
								{
									userId: member.id,
									roomId: data.id
								},
								userId
							);
						return msg;
					};

				case '/kick':
					{
						const msg = await this.roomService.kickMember(
							{
								userId: member.id,
								roomId: data.id,
								roomTitle: data.id
							},
							userId
						);
						return msg;
					};

				case '/ban':
					{
						const msg = await this.roomService.banMember(
							{
								userId: member.id,
								roomId: data.id,
								roomTitle: data.id
							},
							userId
						);
						return msg;
					};

				case '/unban':
					{
						const msg = await this.roomService.removeBan(
							{
								userId: member.id,
								roomId: data.id
							},
							userId
						);
						return msg;
					};

				case '/admin':
					{
						const msg =
							await this.roomService.setUserToAdminRoom(
								{
									userId: member.id,
									roomId: data.id,
									roomTitle: data.id
								},
								userId
							);
						return '"'+msg+'"';
					};

				case '/unadmin':
					{
						const msg = await this.roomService.removeFromAdmins(
							{
								userId: member.id,
								roomId: data.id,
								roomTitle: data.id
							},
							userId
						);
						return msg;
					}

				default: {
					return 'Invalid Command';
				}
			}
		}
		return  'Invalid Command';
	}


	async isUserBlocked(receiver:string, sender :string){
		const user = await this.prisma.user.findUnique({
			where : {
				id : receiver,
			}
		});
		if (user.blockedUsers.includes(sender) || user.blockedBy.includes(sender))
			return true;
		return false;
	}

@SubscribeMessage('message')
async handleMessage(client: any, payload: SendMessageDto) {
	let isCommand = false;
	const userCheck = await this.wsService.getUserFromAccessToken(client);
	try {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userCheck.userData.sub
			}
		});
		await this.prisma.channel.findUnique({
			where: {
				id: payload.id
			},
			include: {
				members: true,
			}
		});

		if (payload.message.substring(0, 1) == '/') {
			payload.message = await this.takeRoomActions(user.id, payload);
			user.name = 'Pongo bot';
			isCommand = true;
		}
		
		const { room } = await this.wsService.createMessage(
			payload,
			userCheck.userData.sub
		);
		
		const message: EmitMessageDto = {
			id: room.messages[room.messages.length - 1].roomId,
			avatar: user.avatarUrl,
			nickName: user.name,
			message: room.messages[room.messages.length - 1].message,
			createdAt: room.messages[room.messages.length - 1].createdAt,
			senderId: room.messages[room.messages.length - 1].senderId
		};
		if (isCommand){
			const message_ = payload.message;
			this.server.in(client.id).emit('message', {...message, message: message_});
			return { payload };
		}
		if (this.isUserMuted(user.id)) {
			const message_ = 'Sorry you are muted';
			this.server.in(client.id).emit('message', {...message, message: message_});
			return { payload };
		}
		const sockets = await this.server.in(room.id).fetchSockets();
		sockets.forEach(async (oneSocket) => {
			if (client.id !== oneSocket.id){
				const reciever = await this.wsService.getUserFromAccessToken(oneSocket);
				const sender = await this.wsService.getUserFromAccessToken(client);
				const check = await this.isUserBlocked(reciever.userData.sub, sender.userData.sub)
				if (!check)
					this.server.in(oneSocket.id).emit('message', message);
			}});
		this.server.in(client.id).emit('message', message);
		} catch (err) {
			return err;
		}
		return { payload };
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(client: Socket, joinRoomDto: JoinRoomDto) {
		const userCheck = await this.wsService.getUserFromAccessToken(client);
		if (userCheck.state === false) throw new WsException('..');
		else {
			this.server.in(client.id).socketsJoin(joinRoomDto.roomTitle);
			const user = await this.prisma.user.findUnique({
				where: {
					id: userCheck.userData.sub
				}
			});
			this.server.to(joinRoomDto.roomTitle).emit('joinRoom', user);
		}
	}

	async joinPrvRoom({ roomId, roomTitle, userId }) {
		this.server.emit('prvRoom', { roomId, roomTitle, userId });
	}

	@SubscribeMessage('leaveRoom')
	async leaveRoom(client: Socket, leaveRoomDto: LeaveRoomDto) {
		const userCheck = await this.wsService.getUserFromAccessToken(client);
		if (userCheck.state === false) throw new WsException('...');
		await this.roomService.leaveRoom(leaveRoomDto, userCheck.userData.sub);
		const userSocket = this.usersSockets.get(userCheck.userData.email);
		await this.server.in(userSocket).socketsLeave(leaveRoomDto.roomTitle);

		const user = await this.prisma.user.findUnique({
			where: {
				id: userCheck.userData.sub
			},
			select: {
				id: true,
				name: true
			}
		});

		const message = {
			id: user.id,
			nickname: user.name,
			roomId: leaveRoomDto.id
		};

		this.server.to(leaveRoomDto.roomTitle).emit('leaveRoom', message);
	}

	// @SubscribeMessage('Mute')
	// async muteUser(client: Socket, muteUserDto: MuteUserDto) {
	// 	const userCheck = await this.wsService.getUserFromAccessToken(client);
	// 	if (userCheck.state === false) throw new WsException('...');
	// 	await this.wsService.muteUser(muteUserDto, userCheck.userData.sub);
	// 	const userMuted = await this.prisma.user.findUnique({
	// 		where: {
	// 			id: muteUserDto.userId
	// 		},
	// 		select: {
	// 			name: true,
	// 			id: true
	// 		}
	// 	});
	// 	const message = {
	// 		nickname: userMuted.name,
	// 		id: userMuted.id,
	// 		roomId: muteUserDto.roomId
	// 	};
	// 	this.server.to(muteUserDto.roomTitle).emit('muteUser', message);
	// }

	// @SubscribeMessage('Unmute')
	// async unmuteUser(unmuteUserDto: UnmuteUserDetails) {
	// 	const room = await this.prisma.channel.findUnique({
	// 		where: {
	// 			id: unmuteUserDto.roomID
	// 		},
	// 		select: {
	// 			name: true
	// 		}
	// 	});

	// 	const userunMuted = await this.prisma.user.findUnique({
	// 		where: {
	// 			id: unmuteUserDto.userID
	// 		},
	// 		select: {
	// 			name: true,
	// 			id: true
	// 		}
	// 	});
	// 	const message = {
	// 		nickname: userunMuted.id,
	// 		id: userunMuted.id,
	// 		roomId: unmuteUserDto.roomID
	// 	};
	// 	this.server.to(room.name).emit('unmuteUser', message);
	// }

	@SubscribeMessage('dm')
	async sendDM(client: Socket, sendMessage: SendMessageDto) {
		if (!client || !client.handshake) return null;
		const cookie = client.handshake.headers.cookie;
		if (!cookie) return await this.handleDisconnect(client); //please check this out
		const { jwtToken } = parse(cookie);
		if (!jwtToken) return await this.handleDisconnect(client); //please check this out
		const userCheck = await this.wsService.getUserFromAccessToken(client);
		if (userCheck.state === false) await this.handleDisconnect(client); //please check this out
		else {
			const dmroom = await this.wsService.sendDM(
				userCheck.userData.sub,
				sendMessage.id,
				sendMessage.message
			);
			// if (
			//     await this.wsService.isUserBlocked(
			//         userCheck.userData.sub,
			//         dmroom.users[0].id
			//     )
			// )
			//     return;
			// else {
			// const message: EmitMessageDto = {
			//     id: dmroom.message[dmroom.message.length - 1].dmId,
			//     message: dmroom.message[dmroom.messages.length - 1].message,
			//     createdAt:
			//         dmroom.messages[dmroom.messages.length - 1].createdAt,
			//     senderId: dmroom.messages[dmroom.messages.length - 1].senderId
			// };
			this.server.to(dmroom.roomId).emit('dm', dmroom);
			// }
		}
	}

	@SubscribeMessage('atta')
	async atta(client: any, id: string) {
		// console.log(client.id, '           ', id);
		client.join(id);
		// const user = await this.prisma.user.findUnique({
		//     where: {
		//         id: userId
		//     },
		//     select: {
		//         email: true
		//     }
		// });

		// const userSocket = this.usersSockets.get(user.email);
		// if (userSocket) this.server.in(userSocket).socketsJoin(roomTitle);
	}

	@SubscribeMessage('joinDm')
	async joinDm(userId: string, roomTitle: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				email: true
			}
		});

		const userSocket = this.usersSockets.get(user.email);
		if (userSocket) this.server.in(userSocket).socketsJoin(roomTitle);
	}

	@SubscribeMessage('checkDm')
	async checkDM(client: any, createDmDto: CreateDmDto) {
		const userCheck = await this.wsService.getUserFromAccessToken(client);
		if (userCheck.state === false) {
			await this.handleDisconnect(client);
		} else {
			const dm = await this.wsService.CheckForExistingDmRoom(
				userCheck.userData.sub,
				createDmDto.friendId,
				userCheck.userData.sub
			);

			const user = await this.prisma.user.findUnique({
				where: {
					id: createDmDto.friendId
				},
				select: {
					email: true,
					name: true
				}
			});

			dm.members = dm.members.filter(
				(user) => user.id != createDmDto.friendId
			);

			const lastMessage = '';
			const createdAt = new Date();
			const singleRoom: GetRoomsDto = {
				id: dm.id,
				avatar: dm.members[0].avatarUrl,
				roomTitle: dm.members[0].name,
				lastMessage: lastMessage,
				nickName: dm.members[0].name,
				lastMessageTime: createdAt,
				isRoom: false
			};

			const userSocket = this.usersSockets.get(user.email);
			if (userSocket)
				this.server.in(userSocket).emit('checkDm', singleRoom);
		}
	}

	@SubscribeMessage('Kick')
	async kickUser(client: any, kickmemberDto: KickMemberDto) {
		const userCheck = await this.wsService.getUserFromAccessToken(client);
		if (userCheck.state === false) await this.handleDisconnect(client);
		else {
			await this.roomService.kickMember(
				kickmemberDto,
				userCheck.userData.sub
			);
			const userToKick = await this.prisma.user.findUnique({
				where: {
					id: kickmemberDto.userId
				},
				select: {
					email: true,
					name: true,
					id: true
				}
			});

			const message = {
				nickname: userToKick.name,
				id: userToKick.id,
				roomId: kickmemberDto.roomId
			};
			this.server.to(kickmemberDto.roomTitle).emit('kickMember', message);
			const userSocket = await this.usersSockets.get(userToKick.email);
			if (userSocket)
				await this.server
					.in(userSocket)
					.socketsLeave(kickmemberDto.roomTitle);
		}
	}

	@SubscribeMessage('Set As Admin')
	async setAdmin(client: any, setAdminDto: SetAdminDto) {
		const userCheck = await this.wsService.getUserFromAccessToken(client);
		if (userCheck.state === false) await this.handleDisconnect(client);
		else {
			this.roomService.setUserToAdminRoom(
				setAdminDto,
				userCheck.userData.sub
			);
			const newAdmin = await this.prisma.user.findUnique({
				where: {
					id: setAdminDto.userId
				},
				select: {
					id: true,
					name: true
				}
			});
			const message = {
				id: newAdmin.id,
				nickname: newAdmin.name,
				roomId: setAdminDto.roomId
			};
			this.server.to(setAdminDto.roomTitle).emit('setAdmin', message);
		}
	}

	@SubscribeMessage('Ban')
	async banMember(client: any, banMemberDto: BanMemberDto) {
		const userCheck = await this.wsService.getUserFromAccessToken(client);
		if (userCheck.state === false) await this.handleDisconnect(client);
		else {
			const memberBanned = await this.prisma.user.findUnique({
				where: {
					id: banMemberDto.userId
				},
				select: {
					name: true,
					id: true,
					email: true
				}
			});

			await this.roomService.banMember(
				banMemberDto,
				userCheck.userData.sub
			);
			const userSocket = await this.usersSockets.get(memberBanned.email);
			const message = {
				id: memberBanned.id,
				nickname: memberBanned.name,
				roomId: banMemberDto.roomId
			};
			this.server.to(banMemberDto.roomTitle).emit('banMember', message);
			if (userSocket)
				await this.server
					.in(userSocket)
					.socketsLeave(banMemberDto.roomTitle);
		}
	}

	@SubscribeMessage('Unset Admin')
	async unsetAdmin(client: any, unsetAdminDto: UnSetAdminDto) {
		const userCheck = await this.wsService.getUserFromAccessToken(client);
		if (userCheck.state === false) await this.handleDisconnect(client);
		else {
			const admineRemoved = await this.prisma.user.findUnique({
				where: {
					id: unsetAdminDto.userId
				},
				select: {
					name: true,
					id: true
				}
			});
			const message = {
				id: admineRemoved.id,
				nickname: admineRemoved.name,
				roomId: unsetAdminDto.roomId
			};

			this.roomService.removeFromAdmins(
				unsetAdminDto,
				userCheck.userData.sub
			);
			this.server.to(unsetAdminDto.roomTitle).emit('unsetAdmin', message);
		}
	}

	// @SubscribeMessage('notification')
	// async notificationEvent(receiver, sender, senderId, action, type) {
	//     const userSocket = this.usersSockets.get(receiver.email);
	//     if (userSocket) {
	//         const notification = await this.prisma.notification.create({
	//             data: {
	//                 userId: senderId,
	//                 senderNickName: sender.nickname,
	//                 senderAvatar: sender.avatar,
	//                 recieverNickName: receiver.nickname,
	//                 recieverAvatar: receiver.avatar,
	//                 action,
	//                 type
	//             }
	//         });
	//         const notificationPayload = {
	//             id: notification.id,
	//             userId: senderId,
	//             nickName: sender.nickname,
	//             avatar: sender.avatar,
	//             action: action,
	//             type
	//         };
	//         // console.log('lokii:       ', notificationPayload);
	//         this.server
	//             .to(userSocket)
	//             .emit('notification', notificationPayload);
	//     } else {
	//         const notification = await this.prisma.notification.create({
	//             data: {
	//                 userId: senderId,
	//                 senderNickName: sender.nickname,
	//                 senderAvatar: sender.avatar,
	//                 recieverNickName: receiver.nickname,
	//                 recieverAvatar: receiver.avatar,
	//                 action,
	//                 type
	//             }
	//         });
	//     }
	// }

	async handleDisconnect(client: Socket) {
		const userCheck = await this.wsService.getUserFromAccessToken(client);
		let user;
		try {
			user = await this.prisma.user.findFirst({
				where: {
					id: userCheck.userData.sub
				}
			});
			this.usersStatus.set(user.email, "offline");
		} catch (errrr) {
			return;
		}

		if (!user) return;

		await this.prisma.user.update({
			where: { id: user.id },
			data: { online: {set : false} }
		});
		client.disconnect(true);
	}
}
