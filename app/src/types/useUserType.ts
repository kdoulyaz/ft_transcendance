import { User } from "./user";
import { Profile } from "./profile";
import { GameHistory } from "../components/interfaces";
import { mutate as mutateFunction } from 'swr';

export interface UseProfiles {
  users: Profile[];
  isLoading: boolean;
  error: unknown;
  mutate: typeof mutateFunction;
}

export interface UseProfile {
  user: Profile;
  isLoading: boolean;
  error: unknown;
  mutate: typeof mutateFunction;
}

export interface UseUser {
  user: User;
  isLoading: boolean;
  error: unknown;
  mutate: typeof mutateFunction;
}

export interface UseGameHistory {
  history: GameHistory[];
  isLoading: boolean;
  error: unknown;
  mutate:typeof mutateFunction;
}