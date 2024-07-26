/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.gateway.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: codespace <codespace@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: Invalid date        by                   #+#    #+#             */
/*   Updated: 2024/03/09 18:19:12 by codespace        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsGuard } from 'src/auth/ws/ws.guard';
import { wsMiddleware } from 'src/auth/ws.mw';
import { Room, Results } from './entities/gamedata.entity';
import { PrismaService } from 'nestjs-prisma';
import { gameLoop } from './game.logic';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { parse } from 'cookie';
import { cvh } from './game.logic';
import { ChatGateway } from 'src/chat/chat.gateway';

@ApiTags('game')
@UseGuards(WsGuard)
@WebSocketGateway({
    namespace: '/game',
    cors: {
        origin: [
            process.env.FRONTEND_URL,
            process.env.BACKEND_URL,
            process.env.DOMAIN,
            process.env.PUBLIC_URL
        ],
        credentials: true
    }
})
export class GameGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
    @WebSocketServer() wss: Server;
    private logger: Logger = new Logger('GameGateway!!!  ><');
    private rooms: Map<number, Room>;
    private roomID = 0;
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private chatGat: ChatGateway,
    ) {
        this.rooms = new Map();
    }
    
    afterInit(server: Socket) {
        server.use(wsMiddleware() as any);
        this.logger.log('Pongo game initialized!');
    }

    async handleConnection(client:Socket) {
        const player = await this.getPlayer(client);
        if (!player) return;
        this.chatGat.setStatus(player, "online");
        client.join(player.id);
    }

    async handleDisconnect(client: Socket) {
        const player = await this.getPlayer(client);
        if (!player) return;
        client.leave(player.id);
        const room = this.getRoom(player.id);
        if (!room) return;
        this.handleGameEnd(client);
    }

    @SubscribeMessage('sendGameInvite')
    @ApiOperation({ operationId: 'handleSendGameInvite' })
    async handleSendGameInvite(
        client: Socket, data: {reciever: string, type: string}
    ) {
        const player = await this.getPlayer(client);
        if (!player) return;
        if (this.getRoom(player.id))
            return 'sender is already in a game';
        if (this.getRoom(data.reciever))
            return 'reciever is already in a game';
        const room = new Room(this.roomID, client, player, data.type);
        room.p1.user = player.name;
        room.state = 'reserved';
        room.type = data.type;
        this.rooms.set(this.roomID++, room);
        client.join(room.id.toString());
        this.wss.to(data.reciever).emit("getGameInvite", player.name);
    }
    
    @SubscribeMessage('acceptGameInvite')
    @ApiOperation({ operationId: 'handlecceptGameInvite' })
    async handlecceptGameInvite(
        client: Socket, sender: string
    ) {
        const player = await this.getPlayer(client);
        if (!player) return;
        if (this.getRoom(player.id))
            return 'reciever is already in a game';
        const room = this.getRoom(sender);
        if (!room) return 'room not found';
        room.client2 = client;
        room.player2 = player;
        room.p2.user = player.name;
        client.join(room.id.toString());
        this.wss.to(room.id.toString()).emit('startGame');
        room.ball.begin = new Date().getTime();
        room.state = 'inProgress';
        this.chatGat.setStatus(room.player1, "in Game");
        this.chatGat.setStatus(room.player2, "in Game");
        room.pid = setInterval(() => {
            gameLoop(this.wss, room);
        }, 30);
    }

    @SubscribeMessage('declineGameInvite')
    @ApiOperation({ operationId: 'handledeclineGameInvite' })
    async handledeclineGameInvite(
        client: Socket, sender: string 
    ) {
        // console.log("inviteDeclined ", sender);
        const player = await this.getPlayer(client);
        if (!player) return;
        const room = this.getRoom(sender);
        if (!room) return;
        this.wss.to(room.id.toString()).emit('gameCanceled');
        room.client1.leave(room.id.toString());
        this.rooms.delete(room.id);
    }
    
    @SubscribeMessage('trainingOn')
    async handleTrainingOn(client: Socket) {
        const player = await this.getPlayer(client);
        if (!player) return;
        this.chatGat.setStatus(player, "in game");
    }

    @SubscribeMessage('trainingOff')
    async handleTrainingOff(client: Socket) {
        const player = await this.getPlayer(client);
        if (!player) return;
        this.chatGat.setStatus(player, "online");
    }
    @SubscribeMessage('gameEnd')
    @ApiOperation({ operationId: 'handleGameEnd' })
    async handleGameEnd(client: Socket) {
        const player = await this.getPlayer(client);
        if (!player) return;
        this.chatGat.setStatus(player, "online");
        const room = this.getRoom(player.id);
        if (!room) return;
        if (room.state == 'onHold' || room.state == 'reserved') {
            room.state = 'canceled';
            room.client1.leave(room.id.toString());
            this.rooms.delete(room.id);
            return;
        } else if (room.state == 'inProgress') {
            room.ball.end = new Date().getTime();
            const results = new Results(
                '',
                room.p1.user,
                room.p2.user,
                room.p1.score,
                room.p2.score,
                room.ball.begin,
                room.ball.end,
            );
            this.wss.to(room.id.toString()).emit('gameEnded', results);
            clearInterval(room.pid);
        }
        room.state = 'ended';
        this.storeGame(room);
        this.updatePlayerData(room, room.p1.score > room.p2.score ? 1 : 2);
        room.client1.leave(room.id.toString());
        room.client2.leave(room.id.toString());
        this.rooms.delete(room.id);
    }

    @SubscribeMessage('JoinWaitRoom')
    @ApiOperation({ operationId: 'handleJoinWaitRoom' })
    async handleJoinWaitRoom(client: Socket, type: string) {
        const player = await this.getPlayer(client);
        if (!player) return;
        const room = this.getRoom(player.id);
        if (room) return;
        let i:number = 0;
        while (i < this.roomID)
        {
            if (this.rooms.has(i) &&
            this.rooms.get(i).state == 'onHold' &&
            (type === 'random' || type === this.rooms.get(i).type))
                break;
            i++;
        }
        if (i < this.roomID)
        {
            const room = this.rooms.get(i);
            room.client2 = client;
            room.player2 = player;
            room.p2.user = player.name;
            client.join(room.id.toString());
            this.wss.to(room.id.toString()).emit('startGame');
            room.state = 'inProgress';
            room.ball.begin = new Date().getTime();
            if (type == 'random' && room.type == 'random') room.type = 'quick';
            this.chatGat.setStatus(room.player1, "in Game");
            this.chatGat.setStatus(room.player2, "in Game");
            room.pid = setInterval(() => {
                gameLoop(this.wss, room);
            }, 30);
        } else {
            const room = new Room(this.roomID, client, player, type);
            room.p1.user = player.name;
            this.rooms.set(this.roomID++, room);
            client.join(room.id.toString());
        }
    }
    
    @SubscribeMessage('playerMoveUp')
    @ApiOperation({ operationId: 'handlePlayerMoveUp' })
    async handlePlayerMoveUp(client: Socket) {
        const player = await this.getPlayer(client);
        if (!player) return;
        const room = this.getRoom(player.id);
        if (!room) return;
        const p = room.p1.user === player.name ? room.p1 : room.p2;
        if (p.y > p.h / 2) p.y -= p.speed;
        if (p.y < p.h / 2) p.y = p.h / 2;
    }

    @SubscribeMessage('playerMoveDown')
    @ApiOperation({ operationId: 'handlePlayerMoveDown' })
    async handlePlayerMoveDown(client: Socket) {
        const player = await this.getPlayer(client);
        if (!player) return;
        const room = this.getRoom(player.id);
        if (!room) return;
        const p = room.p1.user === player.name ? room.p1 : room.p2;
        if (p.y < cvh - p.h / 2) p.y += p.speed;
        if (p.y > cvh - p.h / 2) p.y = cvh - p.h / 2;
    }

    @ApiOperation({ operationId: 'getPlayer' })
    async getPlayer(client: Socket) {
		if (!client || !client.handshake ) return null;
		const cookie = client.handshake.headers?.cookie;
        if (!cookie) return null;
        const { jwtToken } = parse(cookie);
        if (!jwtToken) return null;
        const decoded = await this.jwtService.decode(jwtToken);
        const email = decoded['email'];
        const user = await this.prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                name: true,
                email: true,
                score: true,
                updatedAt: true,
                wins: true,
                losses: true,
                rank: true,
                playTime: true,
                gamesHistory: true
            }
        });
        return user;
    }

    @ApiOperation({ operationId: 'getRoom' })
    getRoom(id: string) {
        return Array.from(this.rooms.values()).find(
            (room) => room.player1.id === id || room.player2?.id === id
        );
    }

    @ApiOperation({ operationId: 'storeGame' })
    async storeGame(room: Room) {
        const beginDate = new Date(room.ball.begin);
        const endDate = new Date(room.ball.end);
        await this.prisma.game.create({
            data: {
                type: room.type,
                userA: room.player1.id,
                userB: room.player2.id,
                score1: room.p1.score,
                score2: room.p2.score,
                begin: beginDate.toISOString(),
                end: endDate.toISOString(),
            }
        });
    }

    @ApiOperation({ operationId: 'updatePlayerData' })
    async updatePlayerData(room: Room, num: number) {
        const winner =
            num === 1
                ? { player: room.player1, p: room.p1 }
                : { player: room.player2, p: room.p2 };
        const loser =
            num === 1
                ? { player: room.player2, p: room.p2 }
                : { player: room.player1, p: room.p1 };
        const winScore =
            winner.p.score * 100 + loser.player.score / winner.player.score;
        const loseScore =
            loser.p.score + winner.player.score / loser.player.score;
        const duration = room.ball.end - room.ball.begin;
        await this.prisma.user.update({
            where: {
                id: winner.player.id
            },
            data: {
                score: { set: winner.player.score + winScore },
                wins: { set: winner.player.wins + 1 },
                playTime: { set: winner.player.playTime + duration },
                gamesHistory: { push: room.id }
            }
        });
        await this.prisma.user.update({
            where: {
                id: loser.player.id
            },
            data: {
                score: { set: loser.player.score + loseScore },
                losses: { set: loser.player.losses + 1 },
                playTime: { set: loser.player.playTime + duration },
                gamesHistory: { push: room.id }
            }
        });
    }
}