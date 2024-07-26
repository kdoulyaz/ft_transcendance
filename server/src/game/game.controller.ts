/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.controller.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mel-kora <mel-kora@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/03/05 12:55:13 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/05 17:23:14 by mel-kora         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, HttpCode, HttpException, HttpStatus, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { GameEntity, GameHistory } from './entities/game.entity';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('game')
@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('history/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        status: 200,
        description: 'The player game history is loaded'
    })
    
    async findId(@Param('id') id: string): Promise<Promise<GameHistory>[]> {
        const gameHistoryList:GameEntity[] = await this.gameService.getGameHistory(id);
        let history = [];
        for (const match of gameHistoryList){
          try {
              const entry = await this.getEntry(match);
              history.push(entry);
          }
          catch {
            throw new HttpException('Forbidden', 403);
          }
        };
        return history;
    }

    async getEntry(game:GameEntity): Promise<GameHistory>{
      const userData1 = await this.gameService.getPlayerdata(game.userA);
      const userData2 = await this.gameService.getPlayerdata(game.userB);
      return {game, userData1, userData2};
    }
}
