import axios, { AxiosResponse } from "axios";
import { useMutation, UseMutationResult } from "react-query";
import { apiUrl, User } from "../interfaces";

const putLogOut = () => {
  return axios
    .post<User>(
      `${apiUrl}auth/logout`,
      {},
      {
        withCredentials: true,
      },
    )
    .then((response) => response)
    .catch();
};

export function useSetLogOut(): UseMutationResult<
  AxiosResponse,
  unknown,
  string
> {
  return useMutation(putLogOut);
}
