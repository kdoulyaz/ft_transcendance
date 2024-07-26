import instance from "../api/axios";
import { User } from "../types/user";
import { UpdateEmail, UpdateUsername } from "../types/Update";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";

export const requestAcceptRequest = async (
  id: string,
): Promise<User | null> => {
  const response = await instance.post(
    "/user/acceptRequest/" + id,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const requestBlock = async (id: string): Promise<User | null> => {
  const response = await instance.post(
    "/user/block/" + id,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const requestRejectRequest = async (
  id: string,
): Promise<User | null> => {
  const response = await instance.post(
    "/user/rejectRequest/" + id,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const requestRemoveFriend = async (id: string): Promise<User | null> => {
  const response = await instance.post(
    "/user/removeFriend/" + id,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const requestSendRequest = async (id: string): Promise<User | null> => {
  const response = await instance.post(
    "/user/sendRequest/" + id,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const requestCanceRequest = async (id: string): Promise<User | null> => {
  const response = await instance.post(
    "/user/cancelRequest/" + id,
    {},
    { withCredentials: true },
  );
  return response.data;
};
export const requestUnblock = async (id: string): Promise<User | null> => {
  const response = await instance.post(
    "/user/unblock/" + id,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const requestUpdateUserEmail = async (
  data: UpdateEmail,
): Promise<User | null> => {
  const response = await instance.patch("/user/update/email", data, {
    withCredentials: true,
  });
  return response.data;
};

export const requestUpdateUserName = async (
  data: UpdateUsername,
): Promise<User | null> => {
  const response = await instance.patch("/user/update/username", data, {
    withCredentials: true,
  });
  return response.data;
};

export const requestUploadAvatar = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await instance.post("/user/uploadAvatar", formData, {
      // headers: {
      //   'Content-Type': 'multipart/form-data'
      // },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    // console.error("Error uploading file:", error);
    if (isAxiosError(error))
        toast.error(error.response?.data?.message);
  }
};

export const requestLogout = async (): Promise<null> => {
  const response = await instance.post("/auth/logout", {}, {
    withCredentials: true,
  });
  return response.data;
};
