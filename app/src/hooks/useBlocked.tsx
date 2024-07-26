import useSWR from "swr";
import { UseProfiles } from "../types/useUserType";

export const useBlock = (): UseProfiles => {
  const { data, error, isLoading, mutate } = useSWR("user/blocked/");

  return {
    users: data,
    isLoading,
    error,
    mutate,
  };
};
