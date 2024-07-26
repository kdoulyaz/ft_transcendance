import useSWR from "swr";
import { UseProfiles } from "../types/useUserType";
import { Profile } from "../types/profile";

export const useSearch = (name: string): UseProfiles => {
  const { data, error, isLoading, mutate } = useSWR("user/search?name=" + name);

  return {
    users: data as Profile[],
    isLoading,
    error,
    mutate,
  };
};
