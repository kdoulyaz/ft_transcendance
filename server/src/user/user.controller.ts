import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    Post,
    Res,
    Query
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUsernameDto, UpdateEmailDto } from './dto';
import { GetCurrentUserId } from '../common/decorators';
import { UserEntity } from './entities/user.entity';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { multerOptions } from 'src/config/multer.config';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('all')
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    async findAll(@GetCurrentUserId() userId: string) {
        return await this.userService.findAll(userId);
    }
    @Get('me')
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    async profile(@GetCurrentUserId() userId: string) {
        return await this.userService.profile(userId);
    }

    @Get('search')
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    async search(
        @Query('name') name: string,
        @GetCurrentUserId() userId: string
    ) {
        return await this.userService.search(name, userId);
    }

    @Get('get/:id')
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @GetCurrentUserId() userId: string) {
        return this.userService.findOne(id, userId);
    }

    @Get('avatar')
    @ApiOkResponse()
    async userAvatar(@Res() res, @GetCurrentUserId() userId: string) {
        return await this.userService.userAvatar(res, userId);
    }

    @Get('avatar/:id')
    @ApiOkResponse()
    async userAvatarId(@Res() res, @Param('id') userId: string) {
        return await this.userService.userAvatar(res, userId);
    }

    @Post('uploadAvatar')
    @ApiCreatedResponse()
    @UseInterceptors(FileInterceptor('avatar', multerOptions))
    async uploadAvatar(
        @UploadedFile()
        file: Express.Multer.File,
        @GetCurrentUserId() userId: string
    ) {
        return new UserEntity(await this.userService.editAvatar(file, userId));
    }

    @Patch('update/username')
    @ApiCreatedResponse({ type: UserEntity })
    async updateUsername(
        @Body() updateUsernameDto: UpdateUsernameDto,
        @GetCurrentUserId() userId: string
    ) {
        return new UserEntity(
            await this.userService.updateUsername(userId, updateUsernameDto)
        );
    }

    @Patch('update/email')
    @ApiCreatedResponse({ type: UserEntity })
    async updateEmail(
        @Body() updateEmailDto: UpdateEmailDto,
        @GetCurrentUserId() userId: string
    ) {
        return new UserEntity(
            await this.userService.updateEmail(userId, updateEmailDto)
        );
    }

    @Get('leaderboard')
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    async leaderboard(@GetCurrentUserId() userId: string) {
        const users = await this.userService.leaderboard(userId);

        return users;
    }

    @Get('friends')
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    async friends(@GetCurrentUserId() userId: string) {
        const users = await this.userService.friends(userId);

        return users;
    }

    @Get('blocked')
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    async blocked(@GetCurrentUserId() userId: string) {
        const users = await this.userService.blocked(userId);

        return users;
    }

    @Get('requests')
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    async Requests(@GetCurrentUserId() userId: string) {
        const users = await this.userService.requests(userId);

        return users;
    }

    @Post('sendRequest/:id')
    @ApiCreatedResponse({ type: UserEntity })
    @HttpCode(HttpStatus.OK)
    async sendRequest(
        @Param('id') id: string,
        @GetCurrentUserId() userId: string
    ) {
        return new UserEntity(await this.userService.sendRequest(userId, id));
    }

    @Post('acceptRequest/:id')
    @ApiCreatedResponse({ type: UserEntity })
    @HttpCode(HttpStatus.OK)
    async acceptRequest(
        @Param('id') id: string,
        @GetCurrentUserId() userId: string
    ) {
        return new UserEntity(await this.userService.acceptRequest(userId, id));
    }

    @Post('rejectRequest/:id')
    @ApiCreatedResponse({ type: UserEntity })
    @HttpCode(HttpStatus.OK)
    async rejectRequest(
        @Param('id') id: string,
        @GetCurrentUserId() userId: string
    ) {
        return new UserEntity(
            await this.userService.declineRequest(userId, id)
        );
    }

    @Post('cancelRequest/:id')
    @ApiCreatedResponse()
    @HttpCode(HttpStatus.OK)
    async cancelRequest(
        @Param('id') id: string,
        @GetCurrentUserId() userId: string
    ) {
        return new UserEntity(await this.userService.cancelRequest(userId, id));
    }
    @Post('block/:id')
    @ApiCreatedResponse({ type: UserEntity })
    @HttpCode(HttpStatus.OK)
    async block(@Param('id') id: string, @GetCurrentUserId() userId: string) {
        return new UserEntity(await this.userService.blockUser(userId, id));
    }

    @Post('unblock/:id')
    @ApiCreatedResponse({ type: UserEntity })
    @HttpCode(HttpStatus.OK)
    async unblock(@Param('id') id: string, @GetCurrentUserId() userId: string) {
        return new UserEntity(await this.userService.unblockUser(userId, id));
    }

    @Post('removeFriend/:id')
    @ApiCreatedResponse({ type: UserEntity })
    @HttpCode(HttpStatus.OK)
    async removeFriend(
        @Param('id') id: string,
        @GetCurrentUserId() userId: string
    ) {
        return new UserEntity(await this.userService.removeFriend(userId, id));
    }
}
