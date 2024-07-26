import { Request } from 'express';

export interface HandshakeRequest extends Request {
    handshake?: { headers: { cookie: string } };
}

export interface TwoFaRequest extends Request {
    cookies: { temporaryToken: string };
}

export interface JwtRequest extends Request {
    cookies: { jwtToken: string };
}
