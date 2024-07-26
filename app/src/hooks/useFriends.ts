import useSWR from "swr";
import { UseProfiles } from "../types/useUserType";
import { Profile } from "../types/profile";

export const useFriends = (): UseProfiles => {
  const { data, error, isLoading, mutate } = useSWR("user/friends/");

  return {
    users: data as Profile[],
    isLoading,
    error,
    mutate,
  };
};
