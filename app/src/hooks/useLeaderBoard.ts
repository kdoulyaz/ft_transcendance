import useSWR from "swr";
import { UseProfiles } from "../types/useUserType";
import { Profile } from "../types/profile";

export const useLeaderBoard = (): UseProfiles => {
  const { data, error, isLoading, mutate } = useSWR("user/leaderboard");

  return {
    users: data as Profile[],
    isLoading,
    error,
    mutate,
  };
};
