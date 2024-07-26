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
  blockedUsers: string[];
  blockedBy: string[];
  friends: string[];
  friendRequests: string[];
  friendRequestsSent: string[];
  twoFactorEnabled: boolean;
}
