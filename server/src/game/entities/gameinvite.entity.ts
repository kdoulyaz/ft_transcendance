/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameinvite.entity.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mel-kora <mel-kora@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/03/05 12:55:20 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/05 12:55:21 by mel-kora         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GameInvitationEntity {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    senderId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    friendId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    state: string;
}
