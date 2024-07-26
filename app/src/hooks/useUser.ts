import useSWR from "swr";
import { UseUser } from "../types/useUserType";
import { User } from "../types/user";

export const useUser = (): UseUser => {
  const { data, error, isLoading, mutate } = useSWR("user/me");

  return {
    user: data as User,
    isLoading,
    error,
    mutate,
  };
};
