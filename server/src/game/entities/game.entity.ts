/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.entity.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mel-kora <mel-kora@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/03/05 12:55:30 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/05 16:29:20 by mel-kora         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDate } from 'class-validator';

export class GameEntity {
    constructor(partial: Partial<GameEntity>) {
        Object.assign(this, partial);
    }
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userA: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userB: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    score1: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    score2: number;

    @ApiProperty()
    @IsDate()
    @IsNotEmpty()
    begin: Date;

    @ApiProperty()
    @IsDate()
    @IsNotEmpty()
    end: Date;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    type: string;
}
export class GameHistory {
    constructor(partial: Partial<GameHistory>) {
        Object.assign(this, partial);
    }
    game : GameEntity;
    userData1:{
    name: string;
    avatarUrl: string;
    };
    userData2:{
    name: string;
    avatarUrl: string;
    }
  }