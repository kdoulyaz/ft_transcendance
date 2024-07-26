import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TwoFaRequest } from '../types';
import { JwtPayload } from '../types';

export class TwoFaStrategy extends PassportStrategy(
	Strategy,
	'jwt-two-factor'
) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				TwoFaStrategy.extractJWT,
				ExtractJwt.fromAuthHeaderAsBearerToken()
			]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET
		});
	}

	async validate(jwtPayload: JwtPayload): Promise<JwtPayload> {
		return jwtPayload;
	}

	private static extractJWT(req: TwoFaRequest): string | null {
		if (
			req.cookies &&
			'temporaryToken' in req.cookies &&
			req.cookies.temporaryToken.length > 0
		) {
			return req.cookies.temporaryToken;
		} else {
			return null;
		}
	}
}
