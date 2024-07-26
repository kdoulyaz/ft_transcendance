export enum channelType {
  Public = "PUBLIC",
  Private = "PRIVATE",
  Protected = "PROTECTED",
  DirectMessage = "DIRECTMESSAGE",
}

export const apiUrl: string = "http://localhost:3080/";

export enum channelRole {
  User = "USER",
  Admin = "ADMIN",
  Owner = "OWNER",
}
export enum channelActionType {
  Ban = "BAN",
  Mute = "MUTE",
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  wins: number;
  losses: number;
  rank: number;
  playTime: true;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  wins: number;
  losses: number;
  rank: number;
  playTime: true;
  blockedUsers: string[];
  blockedBy: string[];
  friends: string[];
  friendRequests: string[];
  friendRequestsSent: string[];
}

export interface GameHistory {
  game : {
    id: string;
    type: string;
    userA: string;
    userB:string;
    score1: number;
    score2: number;
    begin: Date;
    end: Date;
  },
  userData1:{
  name: string;
  avatarUrl: string;
  }, 
  userData2:{
  name: string;
  avatarUrl: string;
  }
}