/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.logic.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mel-kora <mel-kora@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/02/23 23:23:09 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/04 22:14:25 by mel-kora         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Room, Paddle, Ball, Results } from './entities/gamedata.entity';
import { Server } from 'socket.io';

//variables
export const cvw = 800;
export const cvh = cvw * 0.7;

function sendGameData(wss: Server, room: Room) {
    const gameData = { ball: room.ball, p1: room.p1, p2: room.p2, cvw: cvw };
    wss.to(room.id.toString()).emit('gameData', gameData);
}

export const gameLoop = (wss: Server, room: Room) => {
    const win = room.type === 'classic' ? 5 : 3;
    if (room.state === 'ended') {
        room.ball.end = new Date().getTime();
        const results = new Results(
            '',
            room.p1.user,
            room.p2.user,
            room.p1.score,
            room.p2.score,
            room.ball.begin,
            room.ball.end
        );
        wss.to(room.id.toString()).emit('gameEnded', results);
        clearInterval(room.pid);
        return;
    }
    ball_mover(wss, room);
    sendGameData(wss, room);
    if (room.p2.score == win || room.p1.score == win) {
        room.state = 'ended';
    }
};

function ball_mover(wss: Server, room: Room) {
    serving(room);
    moving(room);
    bouncing(wss, room);
    if (room.ball.x >= cvw || room.ball.x <= 0) scoring(room);
}

function serving(room: Room) {
    if (!room.ball.velox) {
        (room.p2.score + room.p1.score) % 2
            ? (room.ball.velox = -1)
            : (room.ball.velox = 1);
        room.ball.veloy = Math.random() % 2 ? -1 : 1;
    }
}

function moving(room: Room) {
    room.ball.x += room.ball.velox * (room.ball.hit + 4);
    room.ball.y += room.ball.veloy * (room.ball.hit + 4);
}

function bouncing(wss: Server, room: Room) {
    if (room.ball.y + room.ball.d / 2 >= cvh || room.ball.y <= room.ball.d / 2)
        room.ball.veloy *= -1;
    if (room.ball.y + room.ball.d / 2 > cvh)
        room.ball.y = cvh - room.ball.d / 2;
    else if (room.ball.y < room.ball.d / 2) room.ball.y = room.ball.d / 2;
    let player_paddle = room.ball.velox > 0 ? room.p2 : room.p1;
    if (collision(player_paddle, room.ball)) {
        mechanics(player_paddle, room.ball);
        room.ball.velox *= -1;
        if (room.ball.hit < 13) {
            room.ball.hit++;
            room.p1.speed++;
            room.p2.speed++;
        }
    }
    if (
        room.ball.y + room.ball.d / 2 >= cvh ||
        room.ball.y <= room.ball.d / 2 ||
        collision(player_paddle, room.ball)
    )
        wss.to(room.id.toString()).emit('ballBounce');
}

function scoring(room: Room) {
    if (room.ball.x >= cvw) room.p1.score++;
    if (room.ball.x <= 0) room.p2.score++;
    room.ball.x = cvw / 2;
    room.ball.y = cvh / 2;
    room.ball.hit = 0;
    room.ball.velox = 0;
    room.p1.speed = 5;
    room.p2.speed = 5;
}

function mechanics(p: Paddle, b: Ball) {
    if (b.y > p.y - 1 && b.y < p.y + 1) b.veloy = 0;
    else if (b.y <= p.h / 2 || (!b.veloy && b.y < p.y)) b.veloy = -1;
    else if (b.y >= p.y + p.h / 2 || (!b.veloy && b.y > p.y)) b.veloy = 1;
}

function collision(p: Paddle, b: Ball) {
    let p_top = p.y - p.h / 2;
    let p_bottom = p.y + p.h / 2;
    let p_right = p.x + p.w / 2;
    let p_left = p.x - p.w / 2;
    let b_top = b.y - b.d / 2;
    let b_bottom = b.y + b.d / 2;
    let b_right = b.x + b.d / 2;
    let b_left = b.x - b.d / 2;
    return (
        p_top <= b_bottom &&
        p_bottom >= b_top &&
        p_right >= b_left &&
        p_left <= b_right
    );
}
