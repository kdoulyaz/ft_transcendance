import useSWR from "swr";

export const useRefresh = () => {
  const { data, error, isLoading, mutate } = useSWR("auth/refresh/");

  return {
    data,
    isLoading,
    error,
    mutate,
  };
};
