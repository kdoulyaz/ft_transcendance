/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.module.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: codespace <codespace@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/03/05 12:54:59 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/08 23:38:28 by codespace        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [GameController],
  providers: [GameGateway, PrismaService, JwtService, GameService],
})
export class GameModule {}
