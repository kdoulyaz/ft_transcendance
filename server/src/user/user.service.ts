import { HttpException, Injectable, Res } from '@nestjs/common';
import { UpdateUsernameDto, UpdateEmailDto, UsersDto } from './dto';
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';
import { UserEntity } from './entities/user.entity';
import { Response } from 'express';
// import { WebSocketService } from 'src/chat/chat.gateway.service';
// import { ChatService } from 'src/chat/chat.service';

enum Actions {
	sendRequest = 'sendRequest',
	acceptRequest = 'acceptRequest',
	declineRequest = 'declineRequest',
	blockUser = 'blockUser',
	unblockUser = 'unblockUser',
	removeFriend = 'removeFriend'
}

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll(userId: string) {
		const users = await this.prismaService.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				avatarUrl: true,
				score: true,
				createdAt: true,
				updatedAt: true,
				wins: true,
				losses: true,
				rank: true,
				playTime: true
			}
		});
		const blocks = await this.prismaService.user.findUnique({
			where: {
				id: userId
			},
			select: {
				blockedBy: true
			}
		});
		return users.filter((u) => !blocks.blockedBy.includes(u.id));
	}

	async findUsers(userId: string, usersDto: UsersDto) {
		const users = await this.prismaService.user.findMany({
			where: {
				id: {
					in: usersDto.ids
				}
			},
			select: {
				id: true,
				name: true,
				email: true,
				avatarUrl: true,
				score: true,
				createdAt: true,
				updatedAt: true,
				wins: true,
				losses: true,
				rank: true,
				playTime: true
			}
		});

		const blocks = await this.prismaService.user.findUnique({
			where: {
				id: userId
			},
			select: {
				blockedBy: true
			}
		});
		return users.filter((u) => !blocks.blockedBy.includes(u.id));
	}

	async findOne(id: string, userId: string) {
		if (id === userId) {
			return new UserEntity(
				await this.prismaService.user.findUnique({
					where: {
						id
					}
				})
			);
		}

		const user = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: {
				id: true,
				name: true,
				email: true,
				avatarUrl: true,
				score: true,
				createdAt: true,
				updatedAt: true,
				online: true
			}
		});

		if (!user) throw new HttpException('User not found', 404);
		const blocks = await this.prismaService.user.findUnique({
			where: {
				id: userId
			},
			select: {
				blockedBy: true
			}
		});
		if (blocks.blockedBy.includes(user.id)) {
			if (!user) throw new HttpException('User not found', 404);
		}
		return user;
	}

	async updateUsername(
		id: string,
		updateUserDto: UpdateUsernameDto
	): Promise<User> {
		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				name: updateUserDto.username.trim()
			}
		});
		if (!user) throw new HttpException('User not found', 404);
		return user;
	}

	async updateEmail(
		id: string,
		updateUserDto: UpdateEmailDto
	): Promise<User> {
		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				...updateUserDto
			}
		});
		if (!user) throw new HttpException('User not found', 404);
		return user;
	}

	async search(name: string, userId: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId
			},
			select: {
				blockedBy: true
			}
		});

		const users = await this.prismaService.user.findMany({
			where: {
				name: {
					contains: name
				}
			},
			select: {
				id: true,
				name: true,
				email: true,
				avatarUrl: true,
				score: true,
				createdAt: true,
				updatedAt: true,
				wins: true,
				losses: true,
				rank: true,
				playTime: true
			}
		});

		return users.filter((u) => !user.blockedBy?.includes(u.id));
	}

	async editAvatar(file: Express.Multer.File, userId: string) {
		const user = await this.prismaService.user.update({
			where: {
				id: userId
			},
			data: {
				avatarUrl: 'http://localhost:3080/' + file.path
			}
		});
		if (!user) throw new HttpException('User not found', 404);
		return user;
	}

	async userAvatar(@Res() res, userId: string) {
		const user = await this.prismaService.user.findFirst({
			where: {
				id: userId
			},
			select: {
				avatarUrl: true
			}
		});
		if (!user) throw new HttpException('User not found', 404);
		return res.sendFile(user.avatarUrl.split('/')[1], {
			root: './upload'
		});
	}

	async leaderboard(id: string) {
		const users = await this.prismaService.user.findMany({
			orderBy: {
				score: 'desc'
			},
			select: {
				id: true,
				name: true,
				email: true,
				avatarUrl: true,
				score: true,
				createdAt: true,
				updatedAt: true,
				wins: true,
				losses: true,
				rank: true,
				playTime: true
			}
		});
		const blocks = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: {
				blockedBy: true
			}
		});
		return users.filter((u) => !blocks.blockedBy.includes(u.id));
	}
	async blocked(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: {
				blockedUsers: true
			}
		});

		const users = await this.prismaService.user.findMany({
			where: {
				id: {
					in: user.blockedUsers
				}
			},
			select: {
				id: true,
				name: true,
				avatarUrl: true
			}
		});

		return users;
	}

	async friends(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: {
				friends: true,
				blockedBy: true
			}
		});

		const friendsUser = await this.prismaService.user.findMany({
			where: {
				id: {
					in: user.friends
				}
			},
			select: {
				id: true,
				name: true,
				email: true,
				avatarUrl: true,
				score: true,
				createdAt: true,
				updatedAt: true,
				wins: true,
				losses: true,
				rank: true,
				playTime: true
			}
		});
		return friendsUser.filter((u) => !user.blockedBy.includes(u.id));
	}

	async requests(id: string) {
		const requestsIds = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: {
				friendRequests: true
			}
		});

		const requests = await this.prismaService.user.findMany({
			where: {
				id: {
					in: requestsIds.friendRequests
				}
			},
			select: {
				id: true,
				name: true,
				email: true,
				avatarUrl: true,
				score: true,
				createdAt: true,
				updatedAt: true,
				wins: true,
				losses: true,
				rank: true,
				playTime: true
			}
		});
		return requests;
	}

	async sendRequest(id: string, userId: string): Promise<User> {
		// console.log('sendRequest ', id, ' | ', userId);
		if ((await this.allowed(id, userId, Actions.sendRequest)) === false) {
			throw new HttpException('Forbidden', 403);
		}
		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				friendRequestsSent: {
					push: userId
				}
			}
		});

		await this.prismaService.user.update({
			where: {
				id: userId
			},
			data: {
				friendRequests: {
					push: id
				}
			}
		});
		return user;
	}

	async acceptRequest(id: string, userId: string): Promise<User> {
		if ((await this.allowed(id, userId, Actions.acceptRequest)) === false) {
			throw new HttpException('Forbidden', 403);
		}
		// console.log('acceptRequest ', id, ' | ', userId);
		const { friendRequests } = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: {
				friendRequests: true
			}
		});

		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				friendRequests: {
					set: friendRequests.filter((d) => d !== userId)
				},
				friends: {
					push: userId
				}
			}
		});

		const { friendRequestsSent } = await this.prismaService.user.findUnique(
			{
				where: {
					id: userId
				},
				select: {
					friendRequestsSent: true
				}
			}
		);

		await this.prismaService.user.update({
			where: {
				id: userId
			},
			data: {
				friendRequestsSent: {
					set: friendRequestsSent.filter((d) => d !== id)
				},
				friends: {
					push: id
				}
			}
		});
		// create dm
		// await this.chatService.createDm(id, userId , id);
		await this.prismaService.channel.create({
			data: {
				name: user.name,
				picture: user.avatarUrl,
				members: {
					connect: [{ id }, { id: userId }]
				},
				dm: true
			},
			include: {
				members: true,
				messages: true
			}
		});
		return user;
	}

	async declineRequest(id: string, userId: string): Promise<User> {
		if (
			(await this.allowed(id, userId, Actions.declineRequest)) === false
		) {
			throw new HttpException('Forbidden', 403);
		}
		// console.log('declineRequest ', id, ' | ', userId);
		const { friendRequests } = await this.prismaService.user.findUnique({
			where: {
				id
			}
		});

		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				friendRequests: {
					set: friendRequests.filter((d) => d !== userId)
				}
			}
		});

		return user;
	}

	async blockUserWS(id: string, userId: string): Promise<User> {
		if ((await this.allowed(id, userId, Actions.blockUser)) === false) {
			throw new HttpException('Forbidden', 403);
		}
		// console.log('blockUser ', id, ' | ', userId);

		const { friendRequestsSent, friendRequests, friends } =
			await this.prismaService.user.findUnique({
				where: {
					id
				},
				select: {
					friendRequestsSent: true,
					friendRequests: true,
					friends: true
				}
			});

		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				blockedUsers: {
					push: userId
				},
				friendRequestsSent: {
					set: friendRequestsSent.filter((d) => d !== userId)
				},
				friendRequests: {
					set: friendRequests.filter((d) => d !== userId)
				},
				friends: {
					set: friends.filter((d) => d !== userId)
				}
			}
		});
		{
			const { friendRequestsSent, friendRequests, friends } =
				await this.prismaService.user.findUnique({
					where: {
						id: userId
					},
					select: {
						friendRequestsSent: true,
						friendRequests: true,
						friends: true
					}
				});

			await this.prismaService.user.update({
				where: {
					id: userId
				},
				data: {
					blockedBy: {
						push: id
					},
					friendRequestsSent: {
						set: friendRequestsSent.filter((d: string) => d !== id)
					},
					friendRequests: {
						set: friendRequests.filter((d: string) => d !== id)
					},
					friends: {
						set: friends.filter((d: string) => d !== id)
					}
				}
			});
		}
		return user;
	}

	async unblockUserWS(id: string, userId: string): Promise<string> {
		if ((await this.allowed(id, userId, Actions.unblockUser)) === false) {
			return 'You are not allowed to unblock anyone';
		}
		try {
			const { blockedUsers } = await this.prismaService.user.findUnique({
				where: {
					id
				},
				select: {
					blockedUsers: true
				}
			});

			const user = await this.prismaService.user.update({
				where: {
					id
				},
				data: {
					blockedUsers: {
						set: blockedUsers.filter((d) => d !== userId)
					}
				}
			});

			const { blockedBy } = await this.prismaService.user.findUnique({
				where: {
					id: userId
				},
				select: {
					blockedBy: true
				}
			});

			await this.prismaService.user.update({
				where: {
					id: userId
				},
				data: {
					blockedBy: {
						set: blockedBy.filter((d) => d !== id)
					}
				}
			});
		} catch (e) {
			return e.message;
		}
		return '';
	}

	async blockUser(id: string, userId: string): Promise<User> {
		if ((await this.allowed(id, userId, Actions.blockUser)) === false) {
			throw new HttpException('Forbidden', 403);
		}

		const { friendRequestsSent, friendRequests, friends } =
			await this.prismaService.user.findUnique({
				where: {
					id
				},
				select: {
					friendRequestsSent: true,
					friendRequests: true,
					friends: true
				}
			});

		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				blockedUsers: {
					push: userId
				},
				friendRequestsSent: {
					set: friendRequestsSent.filter((d) => d !== userId)
				},
				friendRequests: {
					set: friendRequests.filter((d) => d !== userId)
				},
				friends: {
					set: friends.filter((d) => d !== userId)
				}
			}
		});

		{
			const { friendRequestsSent, friendRequests, friends } =
				await this.prismaService.user.findUnique({
					where: {
						id: userId
					},
					select: {
						friendRequestsSent: true,
						friendRequests: true,
						friends: true
					}
				});

			await this.prismaService.user.update({
				where: {
					id: userId
				},
				data: {
					blockedBy: {
						push: id
					},
					friendRequestsSent: {
						set: friendRequestsSent.filter((d: string) => d !== id)
					},
					friendRequests: {
						set: friendRequests.filter((d: string) => d !== id)
					},
					friends: {
						set: friends.filter((d: string) => d !== id)
					}
				}
			});
		}

		const dms = await this.prismaService.channel.findMany({
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
	
		const specificDM = dms.find(dm => dm.members.some(member => member.id === id));
		if (!specificDM)
			return user;

		await  this.prismaService.user.update({
			where: {
				id: id
			},
			data: {
				member: {
					disconnect: { id: specificDM.id }
				}
			}
		});

		await  this.prismaService.user.update({
			where: {
				id: userId
			},
			data: {
				member: {
					disconnect: { id: specificDM.id }
				}
			}
		});
		// // console.log(specificDM.id);
		// await this.prismaService.channel.delete({
		// 	where: {
		// 		id: specificDM.id
		// 	},
		// });
		return user;
	}

	async unblockUser(id: string, userId: string): Promise<User> {
		if ((await this.allowed(id, userId, Actions.unblockUser)) === false) {
			throw new HttpException('Forbidden', 403);
		}
		// console.log('unblockUser', id, ' | ', userId);
		const { blockedUsers } = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: {
				blockedUsers: true
			}
		});

		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				blockedUsers: {
					set: blockedUsers.filter((d) => d !== userId)
				}
			}
		});

		const { blockedBy } = await this.prismaService.user.findUnique({
			where: {
				id: userId
			},
			select: {
				blockedBy: true
			}
		});

		await this.prismaService.user.update({
			where: {
				id: userId
			},
			data: {
				blockedBy: {
					set: blockedBy.filter((d) => d !== id)
				}
			}
		});
		return user;
	}

	async removeFriend(id: string, userId: string): Promise<User> {
		if ((await this.allowed(id, userId, Actions.removeFriend)) === false) {
			throw new HttpException('Forbidden', 403);
		}
		// console.log('removeFriend', id, ' | ', userId);
		const { friends } = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: {
				friends: true
			}
		});

		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				friends: {
					set: friends.filter((d) => d !== userId)
				}
			}
		});

		const { friends: friends2 } = await this.prismaService.user.findUnique({
			where: {
				id: userId
			},
			select: {
				friends: true
			}
		});

		await this.prismaService.user.update({
			where: {
				id: userId
			},
			data: {
				friends: {
					set: friends2.filter((d) => d !== id)
				}
			}
		});

		const dms = await this.prismaService.channel.findMany({
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
	
		const specificDM = dms.find(dm => dm.members.some(member => member.id === id));
		if (!specificDM)
			return user;

		await  this.prismaService.user.update({
			where: {
				id: id
			},
			data: {
				member: {
					disconnect: { id: specificDM.id }
				}
			}
		});

		await  this.prismaService.user.update({
			where: {
				id: userId
			},
			data: {
				member: {
					disconnect: { id: specificDM.id }
				}
			}
		});
	
		return user;
	}

	async enableTwoFactorAuthentication(userId: string, res: Response) {
		try {
			await this.prismaService.user.update({
				where: {
					id: userId
				},
				data: {
					twoFactorEnabled: true
				}
			});

			return res.status(201).send('2FA enabled');
		} catch (error) {}
		return null;
	}
	async profile(userId: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId
			},
			select: {
				id: true,
				name: true,
				email: true,
				avatarUrl: true,
				score: true,
				createdAt: true,
				updatedAt: true,
				wins: true,
				losses: true,
				rank: true,
				playTime: true,
				gamesHistory: true,
				blockedUsers: true,
				blockedBy: true,
				friends: true,
				friendRequests: true,
				friendRequestsSent: true,
				twoFactorEnabled: true
			}
		});
		return user;
	}
	async toggleTwoFactorAuthentication(secret: string, userId: string) {
		try {
			await this.prismaService.user.update({
				where: {
					id: userId
				},
				data: {
					twoFactorSecret: secret,
					twoFactorEnabled: false
				}
			});
		} catch (error) {}
		return null;
	}
	async cancelRequest(id: string, userId: string) {
		const { friendRequestsSent } = await this.prismaService.user.findUnique(
			{
				where: { id },
				select: { friendRequestsSent: true }
			}
		);
		const user = await this.prismaService.user.update({
			where: { id },
			data: {
				friendRequestsSent: {
					set: friendRequestsSent.filter((d) => d != userId)
				}
			}
		});
		const { friendRequests } = await this.prismaService.user.findUnique({
			where: { id },
			select: { friendRequests: true }
		});
		await this.prismaService.user.update({
			where: { id: userId },
			data: {
				friendRequests: {
					set: friendRequests.filter((d) => d != id)
				}
			}
		});
		return user;
	}
	async allowed(id: string, userId: string, action: Actions) {
		const userA = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: {
				blockedUsers: true,
				friends: true,
				friendRequests: true,
				blockedBy: true,
				friendRequestsSent: true
			}
		});

		const userB = await this.prismaService.user.findUnique({
			where: {
				id: userId
			}
		});

		if (!userA || !userB || id === userId) return false;

		switch (action) {
			case Actions.sendRequest:
				if (
					userA.friendRequests.includes(userId) ||
					userA.friends.includes(userId) ||
					userA.blockedUsers.includes(userId) ||
					userA.blockedBy.includes(userId)
				) {
					return false;
				}
				break;
			case Actions.acceptRequest:
				if (
					userA.blockedUsers.includes(userId) ||
					userA.blockedBy.includes(userId) ||
					userA.friends.includes(userId) ||
					!userA.friendRequests.includes(userId)
				) {
					return false;
				}
				break;
			case Actions.declineRequest:
				if (!userA.friendRequests.includes(userId)) {
					return false;
				}
				break;
			case Actions.blockUser:
				if (userA.blockedUsers.includes(userId)) {
					return false;
				}
				break;
			case Actions.unblockUser:
				if (!userA.blockedUsers.includes(userId)) {
					return false;
				}
				break;
			case Actions.removeFriend:
				if (!userA.friends.includes(userId)) {
					return false;
				}
				break;
			default:
				return true;
		}
	}
}
