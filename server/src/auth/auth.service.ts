import { Injectable, ForbiddenException } from '@nestjs/common';
import { AuthDto, LocalAuthDto } from './dto';
import { JwtPayload, Tokens } from './types';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import axios from 'axios';
import { generateUsername } from 'unique-username-generator';
import { Response } from 'express';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private config: ConfigService
	) {}

	async signupLocal(dto: LocalAuthDto): Promise<Tokens> {
		const hash = await argon.hash(dto.password);
		const user = await this.prisma.user.create({
			data: {
				name: dto.email.split('@')[0],
				email: dto.email,
				passwordHash: hash,
				avatarUrl: ''
			}
		});
		if (!user) return null;
		const token = await this.getTokens(user.id, user.email);
		await this.updateRtHash(user.id, token.refresh_token);
		return token;
	}

	async signinLocal(dto: LocalAuthDto): Promise<Tokens> {
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		});

		if (!user) throw new ForbiddenException('Access Denied');

		const passwordMatches = await argon.verify(
			user.passwordHash,
			dto.password
		);
		if (!passwordMatches) throw new ForbiddenException('Access Denied');

		const tokens = await this.getTokens(user.id, user.email);
		await this.updateRtHash(user.id, tokens.refresh_token);

		return tokens;
	}

	async logout(res: Response, userId: string) {
		try {
			await this.prisma.user.update({
				where: {
					id: userId
				},
				data: {
					online: false
				}
			});
			return res
				.status(200)
				.clearCookie('jwtToken', { httpOnly: true })
				.send();
		} catch (error) {
			return res.status(403).send();
		}
	}
	async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId
			}
		});
		if (!user || !user.refreshTokenHash)
			throw new ForbiddenException('Access Denied no user');

		const rtMatches = await argon.verify(
			user.refreshTokenHash,
			refreshToken
		);
		if (!rtMatches) throw new ForbiddenException('Access Denied no match');

		const tokens = await this.getTokens(user.id, user.email);
		await this.updateRtHash(user.id, tokens.refresh_token);

		return tokens;
	}

	async getTokens(userId: string, email: string): Promise<Tokens> {
		const jwtPayload: JwtPayload = {
			sub: userId,
			email: email
		};

		const [at, rt] = await Promise.all([
			this.jwtService.signAsync(jwtPayload, {
				secret: this.config.get<string>('JWT_SECRET'),
				expiresIn: '7d'
			}),
			this.jwtService.signAsync(jwtPayload, {
				secret: this.config.get<string>('JWT_SECRET'),
				expiresIn: '7d'
			})
		]);

		return {
			access_token: at,
			refresh_token: rt
		};
	}

	async updateRtHash(userId: string, rt: string): Promise<void> {
		const hash = await argon.hash(rt);
		await this.prisma.user.update({
			where: {
				id: userId
			},
			data: {
				refreshTokenHash: hash
			}
		});
	}

	async get42AccessToken(code: any) {
		try {
			// console.log(
			// 	'get42AccessToken',
			// 	code.code,
			// 	this.config.get<string>('USER_ID'),
			// 	this.config.get<string>('USER_SECRET')
			// );
			const response = await axios.post(
				'https://api.intra.42.fr/oauth/token',
				{
					grant_type: 'authorization_code',
					code: code.code,
					client_id: this.config.get<string>('USER_ID'),
					client_secret: this.config.get<string>('USER_SECRET'),
					redirect_uri: 'http://localhost:5173/callback'
				}
			);
			// console.log(response.data);
			return response.data.access_token;
		} catch (error) {
			// console.log(error);
			throw new ForbiddenException('Access Denied get42AccessToken');
		}
	}

	async get42UserData(accessToken: string) {
		try {
			const response = await axios.get('https://api.intra.42.fr/v2/me', {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			return response.data;
		} catch (error) {
			throw new ForbiddenException('Access Denied');
		}
	}

	async oauthCallback42(userData: any): Promise<Tokens> {
		// const accessToken = await this.get42AccessToken(code);
		// const userData = await this.get42UserData(accessToken);

		const user = await this.prisma.user.findUnique({
			where: {
				email: userData.email
			}
		});

		if (!user) {
			const newUser = await this.prisma.user.create({
				data: {
					name: userData.login,
					email: userData.email,
					avatarUrl: userData.image_url
				}
			});

			const token = await this.getTokens(newUser.id, newUser.email);
			await this.updateRtHash(newUser.id, token.refresh_token);
			return token;
		}

		const tokens = await this.getTokens(user.id, user.email);
		await this.updateRtHash(user.id, tokens.refresh_token);
		// console.log(tokens);
		return tokens;
	}

	login2FA(user: User) {
		const jwtPayload: JwtPayload = {
			sub: user.id,
			email: user.email
		};
		return this.jwtService.sign(jwtPayload);
	}

	async verifyTokon(cookie: string) {
		return await this.jwtService.verify(cookie);
	}

	async loginIntra(userData: AuthDto) {
		const userEmail = await this.prisma.user.findUnique({
			where: {
				email: userData.login + '@student.42.fr'
			}
		});

		const userName = await this.prisma.user.findUnique({
			where: {
				name: userData.login
			}
		});

		const username = userName ? generateUsername() : userData.login;
		if (!userEmail) {
			const newUser = await this.prisma.user.create({
				data: {
					name: username,
					email: userData.login + '@student.42.fr',
					avatarUrl: userData.image.link,
					twoFactorEnabled: false,
					games: 0
				}
			});

			const token = await this.getTokens(newUser.id, newUser.email);
			await this.updateRtHash(newUser.id, token.refresh_token);
			return newUser;
		}
		return userEmail;
	}
}
