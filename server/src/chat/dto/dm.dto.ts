import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DmDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string; 
}
