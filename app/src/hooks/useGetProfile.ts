import useSWR from "swr";
import { UseProfile } from "../types/useUserType";
import { Profile } from "../types/profile";

export const useGetProfile = (id: string): UseProfile => {
  const { data, error, isLoading, mutate } = useSWR("user/get/" + id);

  return {
    user: data as Profile,
    isLoading,
    error,
    mutate,
  };
};
