import {
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Get,
	UseGuards,
	Res,
	Req,
	UseFilters
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public, GetCurrentUserId, GetCurrentUser } from '../common/decorators';
import { Api42OauthGuard, RtGuard } from '../common/guards';
import { AuthService } from './auth.service';
import { Tokens } from './types';
import { Api42Filter } from 'src/auth/middleware/filter';
import { Response } from 'express';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@UseGuards(Api42OauthGuard)
	@UseFilters(Api42Filter)
	@Get('42/oauth_callback')
	@ApiCreatedResponse()
	@HttpCode(HttpStatus.CREATED)
	async oauthCallback42(@Res() res, @Req() req): Promise<void> {
		const url = new URL('http://localhost:3090/home');
		const url2FA = new URL(`http://localhost:3090/2fa-sign-in`);
		const urlFirstSignIn = new URL(`http://localhost:3090/me`);
		const tokens = await this.authService.getTokens(
			req.user.id,
			req.user.email
		);
		const user = req.user;
		if (user.twoFactorEnabled) {
			return res
				.cookie('temporaryToken', `${tokens.access_token}`, {
					httpOnly: true
				})
				.redirect(url2FA);
		}
		if (user.updatedAt - user.createdAt === 0)
			res.cookie('jwtToken', `${tokens.access_token}`, {
				httpOnly: true
			}).redirect(urlFirstSignIn);
		else
			res.cookie('jwtToken', `${tokens.access_token}`, {
				httpOnly: true
			}).redirect(url);
	}

	@Post('logout')
	@ApiOkResponse()
	@HttpCode(HttpStatus.OK)
	async logout(
		@GetCurrentUserId() userId: string,
		@Res() res: Response
	): Promise<void> {
		await this.authService.logout(res, userId);
	}

	@Public()
	@UseGuards(RtGuard)
	@Post('refresh')
	@ApiCreatedResponse()
	@HttpCode(HttpStatus.OK)
	refreshTokens(
		@GetCurrentUserId() userId: string,
		@GetCurrentUser('refreshToken') refreshToken: string
	): Promise<Tokens> {
		return this.authService.refreshTokens(userId, refreshToken);
	}

	@Public()
	@Get('islogged')
	async isLogged(@Req() req: Request): Promise<boolean> {
		const jwtToken = req.cookies['jwtToken'];
		if (!jwtToken) return false;
		return this.authService.verifyTokon(jwtToken);
	}
}
