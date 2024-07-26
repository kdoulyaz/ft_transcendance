import instance from "../api/axios";
import { ChannelEntity, DmEntity } from "../types/channel";

export const requestCreateChannel = async (
  name: string,
  isPrivate: boolean,
  isPassword: boolean,
  password: string,
): Promise<ChannelEntity | null> => {
  const response = await instance.post(
    "/channel/create",
    { name, isPrivate, isPassword, password },
    { withCredentials: true },
  );
  return response.data;
};

export const requestCreateDm = async (userId: string): Promise<DmEntity | null> => {
  const response = await instance.post(
    "/channel/create-dm",
    { userId },
    { withCredentials: true },
  );
  return response.data;
}

export const requestDeleteChannel = async (id: string) => {
    await instance.delete(
        "/channel/delete-channel/" + id,
        { withCredentials: true },
        );
}