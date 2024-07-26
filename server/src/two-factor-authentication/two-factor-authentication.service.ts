import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(
        private readonly userService: UserService,
        private readonly prisma: PrismaService
    ) {}

    public async generateTwoFactorAuthenticationSecret(
        userId: string,
        res: Response
    ) {
        try {
            const secret: string = authenticator.generateSecret();
            await this.userService.toggleTwoFactorAuthentication(
                secret,
                userId
            );
            const otpauthURL = authenticator.keyuri(
                userId,
                'Transcendance',
                secret
            );
            const qrCode = await QRCode.toDataURL(otpauthURL);
            return res.status(201).send(qrCode);
        } catch (error) {
            if (typeof error === 'string') return error;
            return 'errorGenerate2FA';
        }
    }

    async isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode: string,
        userId: string
    ) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (user !== null) {
            return authenticator.verify({
                token: twoFactorAuthenticationCode,
                secret: user.twoFactorSecret
            });
        }
        return false;
    }
}
