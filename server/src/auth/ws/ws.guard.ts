import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { parse } from 'cookie';

@Injectable()
export class WsGuard implements CanActivate {
    private static jwtService: JwtService = new JwtService();
    private static config: ConfigService = new ConfigService();

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        if (context.getType() === 'ws') {
            return true;
        }

        const client: Socket = context.switchToWs().getClient();

        const payload = WsGuard.validateToken(client);
        if (payload) {
            return true;
        }

        return false;
    }

    static async validateToken(client: Socket) {
		if (!client || !client.handshake ) return null;
		const cookie = client.handshake.headers?.cookie;
        if (!cookie) return false;
        const { jwtToken } = parse(cookie);
        if (!jwtToken) return false;
        try {
            const payload = await WsGuard.jwtService.verify(jwtToken, {
                secret: WsGuard.config.get<string>('AT_SECRET')
            });
            return payload;
        } catch (error) {
            return false;
        }
    }
}
