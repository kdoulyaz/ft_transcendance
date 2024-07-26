
import useSWR from "swr";
import { UseGameHistory } from "../../types/useUserType";
import { GameHistory } from "../interfaces";

export const useGameHistory = (id:string): UseGameHistory => {
  const { data, error, isLoading, mutate } = useSWR(`game/history/${id}`);

  return {
    history: data as GameHistory[],
    isLoading,
    error,
    mutate,
  };
};
