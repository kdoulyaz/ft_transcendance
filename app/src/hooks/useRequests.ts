import useSWR from "swr";
import { UseProfiles } from "../types/useUserType";
import { Profile } from "../types/profile";

export const useRequests = (): UseProfiles => {
  const { data, error, isLoading, mutate } = useSWR("user/requests/");

  return {
    users: data as Profile[],
    isLoading,
    error,
    mutate,
  };
};
