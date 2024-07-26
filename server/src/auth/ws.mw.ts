import { Socket } from 'socket.io';
import { WsGuard } from './ws/ws.guard';

export const wsMiddleware = () => {
    return (client: Socket, next: any) => {
        const payload = WsGuard.validateToken(client);
        if (payload) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    };
};
