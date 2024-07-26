import useSWR from "swr";
import { UseProfiles } from "../types/useUserType";
import { Profile } from "../types/profile";

export const useUserAll = (): UseProfiles => {
  const { data, error, isLoading, mutate } = useSWR("user/all");

  return {
    users: data as Profile[],
    isLoading,
    error,
    mutate,
  };
};
