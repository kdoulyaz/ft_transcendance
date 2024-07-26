export enum channelType {
    Public = 'PUBLIC',
    Private = 'PRIVATE',
    Protected = 'PROTECTED',
    DirectMessage = 'DIRECTMESSAGE',
  }
  
  export enum channelRole {
    User = 'USER',
    Admin = 'ADMIN',
    Owner = 'OWNER',
  }
  export enum channelActionType {
    Ban = 'BAN',
    Mute = 'MUTE',
  }

  
  export interface Channel {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    picture: string;
    dm: boolean;
    private: boolean;
    isPassword: boolean;
    ownerId: string;
    admins: string[];
    members: string[];
    blocked: string[];
    muted: string[];
  }
  
  export interface Message {
    id: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
    senderId: string;
    channelId: string;
  }
  export enum AcknoledgementStatus {
    OK = 'OK',
    FAILED = 'FAILED',
  }
  
  export enum friendshipStatus {
    REQUSTED,
    ACCEPTED,
    PENDING,
    ADD,
  }
  
  export enum UserListType {
    MEMBERS = 'MEMBERS',
    FRIENDS = 'FRIENDS',
  }
  
  export enum UserConnectionStatus {
    OFFLINE = 'OFFLINE',
    ONLINE = 'ONLINE',
    PLAYING = 'PLAYING',
  }
  
  export interface User {
    id: string;
    avatarImg: string;
    nickname: string;
    eloScore: number;
    status: UserConnectionStatus;
    twoFactorAuthenticationSet: boolean;
  }
  
  export interface RankingData {
    id: string;
    nickname: string;
    avatarImg: string;
    eloScore: number;
  }
  
  export interface Stats {
    numberOfWin: number;
    numberOfLoss: number;
    ranking: string;
    eloScore: number;
  }
  
  export interface AchievementData {
    id: string;
    label: string;
    description: string;
    image: string;
  }
  
  export interface MatchData {
    id: string;
    imageCurrentUser: string;
    imageOpponent: string;
    score: string;
    matchWon: boolean;
  }
  
  export interface TargetInfo {
    id: string;
    nickname: string;
    avatarImg: string;
    eloScore: number;
    status: string;
    friendStatus?: string;
  }
  
  export enum GameStatus {
    PLAYING = 'PLAYING',
    DONE = 'DONE',
    OVER = 'OVER',
    PENDING = 'PENDING',
    PAUSED = 'PAUSED',
  }
  
  export interface GameCoords {
    p1y: number;
    p2y: number;
    bx: number;
    by: number;
    p1s: number;
    p2s: number;
  }
  
  export interface ModerationInfo {
    channelActionTargetId: string;
    channelActionOnChannelId: string;
  }
  
  export interface ChannelDto {
    name: string;
    private: boolean;
    isPassword: boolean;
    password: string;
  }


export interface ChannelUpdateDto {
        name: string;
        private: boolean;
        isPassword: boolean;
        password: string;
        picture: string;
        ownerId: string;
}

export interface DmDTO {
        userId: string;
}

export interface JoinChannelDto {
        id: string;
        password: string;
}

export interface MessagetDto {
        writeId: string;
        content: string;
        channelId: string;
}

export interface MuteDto {
        userId: string;
        until: string;
        channelId: string;
}


export interface UserChatDto {
        id: string;
}


export interface ChannelEntity {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        picture: string;
        dm: boolean;
        private: boolean;
        isPassword: boolean;
        ownerId: string;
        admins: string[];
        members: string[];
        blocked: string[];
        muted: string[];
}

export interface ChatRoomEntity {
    channelId: string;
    socketId: string;
    userId: string;
}

export interface DmEntity {
    id: string;
    userAId: string;
    userBId: string;
    avatar: string;
}

export interface MessagetEntity {
    id: string;
    content: string;
    createdAt: Date;
    writeId: string;
    channelId: string;
}