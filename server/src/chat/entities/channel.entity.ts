import { ApiProperty } from '@nestjs/swagger';

export class ChannelEntity {
    constructor(channel: any) {
        this.id = channel.id;
        this.name = channel.name;
        this.createdAt = channel.createdAt;
        this.updatedAt = channel.updatedAt;
        this.picture = channel.picture;
        this.dm = channel.dm;
        this.private = channel.private;
        this.isPassword = channel.isPassword;
        this.ownerId = channel.ownerId;
        this.admins = channel.admins.map((admin) => admin.id);
        this.members = channel.members.map((member) => member.id);
        if (channel.blocked) {
            this.blocked = channel.blocked.map((blocked) => blocked.id);
        } else {
            this.blocked = [];
        }
        if (channel.muted) {
            this.muted = channel.muted.map((muted) => muted.id);
        } else {
            this.muted = [];
        }
    }

    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    picture: string;

    @ApiProperty()
    dm: boolean;

    @ApiProperty()
    private: boolean;

    @ApiProperty()
    isPassword: boolean;

    @ApiProperty()
    ownerId: string;

    @ApiProperty()
    admins: string[];

    @ApiProperty()
    members: string[];

    @ApiProperty()
    blocked: string[];

    @ApiProperty()
    muted: string[];
}
