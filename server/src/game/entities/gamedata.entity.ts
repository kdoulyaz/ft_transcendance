/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gamedata.entity.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mel-kora <mel-kora@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/02/23 13:42:37 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/05 00:19:21 by mel-kora         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Socket } from 'socket.io';
import { cvw, cvh } from '../game.logic';

export class Ball {
    x: number;
    y: number;
    d: number;
    hit: number;
    velox: number;
    veloy: number;
    begin: number;
    end: number;
    constructor(cvw: number, cvh: number) {
        this.x = cvw / 2;
        this.y = cvh / 2;
        this.d = cvh / 30;
        this.hit = 0;
        this.velox = 0;
        this.veloy = 1;
        this.begin = 0;
        this.end = 0;
    }
}

export class Paddle {
    user: string;
    x: number;
    y: number;
    w: number;
    h: number;
    score: number;
    speed: number;
    constructor(user: string, x: number, y: number, cvw: number, cvh: number) {
        this.user = user;
        this.x = x;
        this.y = y;
        this.w = cvw / 50;
        this.h = cvh / 4;
        this.score = 0;
        this.speed = 5;
    }
}

export class Room {
    id: number;
    client1: Socket;
    client2: Socket;
    player1: any;
    player2: any;
    ball: Ball;
    p1: Paddle;
    p2: Paddle;
    state: string;
    type: string;
    pid: any;
    constructor(id: number, cli: Socket, player: any, type: string) {
        this.id = id;
        this.client1 = cli;
        this.client2 = null;
        this.player1 = player;
        this.player2 = null;
        this.ball = new Ball(cvw, cvh);
        this.p1 = new Paddle('', cvw / 120, cvh / 2, cvw, cvh);
        this.p2 = new Paddle('', cvw - cvw / 120, cvh / 2, cvw, cvh);
        this.state = 'onHold';
        this.type = type;
        this.pid = -1;
    }
}

export class Results {
    username: string;
    userA: string;
    userB: string;
    score1: number;
    score2: number;
    begin: number;
    end: number;
    constructor(
        user: string,
        p1: string,
        p2: string,
        p1_score: number,
        p2_score: number,
        begin: number,
        end: number
    ) {
        this.username = user;
        this.userA = p1;
        this.userB = p2;
        this.score1 = p1_score;
        this.score2 = p2_score;
        this.begin = begin;
        this.end = end;
    }
}
