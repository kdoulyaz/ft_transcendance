import { Body, Controller, Post, Res, UseGuards, Delete } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { GetCurrentUserId, Public } from 'src/common/decorators';
import { TwoFaAuthGuard } from 'src/common/guards/twof.guard';
import { PrismaService } from 'nestjs-prisma';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { Expose } from 'class-transformer';

class Res2fa {
	@Expose()
	msg: string;
}

@Serialize(Res2fa)
@Controller('2fa')
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly prisma: PrismaService
	) {}

	@Post('generate')
	register(@GetCurrentUserId() userId: string, @Res() res: Response) {
		return this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
			userId,
			res
		);
	}

	@Post('validate')
	async validate(
		@GetCurrentUserId() userId: string,
		@Body() data: { twoFactorAuthenticationCode: string },
		@Res() res: Response
	) {
		/* Check that the user has a valid 2fa secret */
		const user: User | null = await this.prisma.user.findUnique({
			where: {
				id: userId
			}
		});
		if (!user?.twoFactorSecret) {
			return res.send({ msg: 'invalidSecret' });
		}

		const isCodeValid: boolean =
			await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
				data.twoFactorAuthenticationCode,
				userId
			);
		if (!isCodeValid) {
			return res.send({ msg: 'invalidCode' });
		}
		await this.userService.enableTwoFactorAuthentication(userId, res);
		return res.status(201).send();
	}

	@Public()
	@Post('authenticate')
	@UseGuards(TwoFaAuthGuard)
	async authenticate(
		@GetCurrentUserId() userId: string,
		@Body() data: { twoFactorAuthenticationCode: string },
		@Res() res: Response
	) {
		const user: User | null = await this.prisma.user.findUnique({
			where: {
				id: userId
			}
		});

		if (!user?.twoFactorSecret) {
			return res.send({ msg: 'invalidSecret' });
		}

		const isCodeValid: boolean | null =
			await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
				data.twoFactorAuthenticationCode,
				userId
			);
		if (!isCodeValid) {
			return res.send({ msg: 'invalidCode' });
		}
		const token = this.authService.login2FA(user);
		res.clearCookie('temporaryToken', { httpOnly: true });
		res.cookie('jwtToken', `${token}`, { httpOnly: true });
		return res.status(201).send();
	}

	@Delete('disable')
	toggle(@GetCurrentUserId() userId: string) {
		return this.userService.toggleTwoFactorAuthentication('', userId);
	}
}
