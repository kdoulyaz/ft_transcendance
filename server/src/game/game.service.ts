/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.service.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mel-kora <mel-kora@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/03/04 22:59:18 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/05 17:21:33 by mel-kora         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { GameEntity, GameHistory } from './entities/game.entity';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const games = await this.prisma.game.findMany({
      select: {
        id: true,
        type: true,
        userA: true,
        userB: true,
        score1: true,
        score2: true,
        begin: true,
        end: true,
      },
    });
    return games;
  }

  async getGameHistory(userId: string) {
    const gameHistory = await this.prisma.game.findMany({
      where: {
        OR: [
          {
            userA:  userId,
          },
          {
            userB: userId,
          },
        ],
      },
      select: {
        id: true,
        type: true,
        userA: true,
        userB: true,
        score1: true,
        score2: true,
        begin: true,
        end: true,
      },
      orderBy: {
        begin: 'desc',
      },
    });
    return gameHistory.sort();
  }
  
  async getPlayerdata(userId:string){
    const player = await this.prisma.user.findUnique({
        where: {
            id:userId,
        },
        select:{
            name:true,
            avatarUrl:true,
        },
    })
    return player;
  }
}
