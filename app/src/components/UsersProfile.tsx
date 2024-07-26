import React, { useState, useEffect } from "react";
import { IoPersonAddOutline } from "react-icons/io5";
import { MdOutlineDownloadDone } from "react-icons/md";
import { FaUserSlash } from "react-icons/fa";
import LoadingSpinner from "./loading";
import { useUser } from "../hooks/useUser";
import { useGetProfile } from "../hooks/useGetProfile";
import NotFound from "./notFound";
import { useGameHistory } from "./query-hooks/getUserGameHistory";
import {
  requestBlock,
  requestUnblock,
  requestCanceRequest,
  requestSendRequest,
  requestRemoveFriend,
  requestAcceptRequest,
} from "../requests/requestUser";
import { useChatStore } from "./chat/store";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
// import { mutate } from "swr";

interface ProfileProps {
  userId: string;
}

const UserProfile: React.FC<ProfileProps> = ({
  userId,
}: {
  userId: string;
}) => {
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isReceived, setIsReceived] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState<boolean>(false);
  const { user, error, isLoading, mutate } = useGetProfile(userId);
  const {
    user: currentUser,
    error: currentUserError,
    isLoading: currentUserIsloading,
    mutate: mutate_user,
  } = useUser();
  const { history, isLoading: onLoad } = useGameHistory(user?.id);
  const {socket} = useChatStore();
  const [ status, setStatus ] = useState('');
  
  useEffect(() => {
    if (user && !isLoading)
      socket?.emit("UserStatusResquest", user.email);
    socket?.on("UserStatusResponse", (response)=> {setStatus(response); });
    if (user && currentUser) {
      setIsReceived(currentUser.friendRequests.includes(user.id));
      setIsFriend(currentUser.friends.includes(user.id));
      setIsPending(currentUser.friendRequestsSent.includes(user.id));
      setIsBlocked(currentUser.blockedUsers.includes(user.id));
      setIsRequestSent(currentUser.friendRequestsSent.includes(user.id));
    }
    return () => {
      socket?.off("UserStatusResponse");
    }
  }, [user, currentUser, isLoading, onLoad, socket]);

  if (isLoading || currentUserIsloading) {
    return <LoadingSpinner />;
  }

  if (error || currentUserError) {
    return <div>Error:</div>;
  }

  const blockedBy = currentUser?.blockedBy.find((id) => id === userId);

  if (blockedBy) {
    return <NotFound />;
  }

  const handleAddFriend = async () => {
    try {
      setIsPending(true);
      setIsRequestSent(true);
      await requestSendRequest(user.id);
      mutate;
      mutate_user;
    } catch (error) {
      if (isAxiosError(error)) toast.error(error.response?.data?.message);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setIsPending(false);
      await requestCanceRequest(user.id);
      mutate;
    } catch (error) {
      if (isAxiosError(error)) toast.error(error.response?.data?.message);  
    }
  };

  const handleRemoveFriend = async () => {
    try {
      
      setIsFriend(false);
      await requestRemoveFriend(user.id);
      mutate;
      mutate_user;
    } catch (error) {
      if (isAxiosError(error)) toast.error(error.response?.data?.message);  
    }
  };

  const handleBlock = async () => {
    try {
      setIsBlocked(!isBlocked);
      if (!isBlocked) await requestBlock(user.id);
      else await requestUnblock(user.id);
      mutate;
      mutate_user;
    } catch (error) {
      if (isAxiosError(error)) toast.error(error.response?.data?.message);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      setIsFriend(true);
      setIsPending(false);
      setIsRequestSent(true);
      await requestAcceptRequest(user.id);
      mutate;
      mutate_user;
      
    } catch (error) {
      if (isAxiosError(error)) toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="w-screen flex md:w-screen  flex-col  gap-4 justify-center  items-center bg-[#2D097F]">
      <div className="items-center font-bold text-white gap-3 flex flex-col ">
        <img
          className="w-32 h-32 rounded-full"
          src={user.avatarUrl}
          alt="User Avatar"
        />
        <p>{user.name}</p>
        <p className="text-center text-violet-700  text-2xl font-bold font-Poppins">
          {user.rank}
        </p>
        <p className={`${isBlocked ? "hidden" :""}`} >Status: {status} </p>
        <div className="flex items-center gap-2">
          <div className={`flex gap-x-3 p-2 cursor-pointer rounded-xl bg-[#ff7e03] text-white font-poppins text-center" ${isBlocked ? "hidden" :""}`}>
            {isFriend ? (
              <button
                className="flex gap-x-1 items-center px-2 py-1 rounded-md bg-red-500 text-white cursor-pointer"
                onClick={handleRemoveFriend}
              >
                <span>Remove Friend</span>
                <MdOutlineDownloadDone className="text-black h-6" />
              </button>
            ) : (
              <>
                {isPending || isReceived || isRequestSent ? (
                  <button
                    className="flex gap-x-1 items-center px-2 py-1 rounded-md bg-yellow-500 text-white cursor-pointer"
                    onClick={
                      isPending ? handleCancelRequest : handleAcceptRequest
                    }
                  >
                    <span>
                      {/* {isPending ? "Cancel Request" : "Accept Request"} */}
                      {isPending && "Cancel Request"}
                      {isReceived && "Accept Request"}
                    </span>
                    <MdOutlineDownloadDone className="text-black h-6" />
                  </button>
                ) : (
                  <button
                    className={`flex gap-x-1 items-center px-2 py-1 rounded-md bg-[#ff7e03] text-white cursor-pointer" `}
                    onClick={handleAddFriend}
                  >
                    <span>Add Friend!</span>
                    <IoPersonAddOutline className="text-black h-6" />
                  </button>
                )}
              </>
            )}
          </div>

          <div
            className={`flex text-center gap-x-3  rounded-xl cursor-pointer p-3 font-poppins items-center  ${
              isBlocked
                ? " bg-red-700 hover:bg-gray-700"
                : "bg-gray-700 hover:bg-red-700"
            } `}
            onClick={handleBlock}
          >
            {isBlocked ? (
              <>
                <p>Unblock</p>
                <FaUserSlash />
              </>
            ) : (
              <>
                <p>Block</p>
                <FaUserSlash />
              </>
            )}
          </div>
        </div>
      </div>
          <div className={`flex flex-col overflow-y-scroll justify-center items-center w-[65rem] h-80 bg-zinc-300 bg-opacity-0 rounded-lg border border-violet-700 ${isBlocked ? "hidden" :""}`}>
        {history && history.length > 0 ? (
          history.map((game, index) => (
            <div
              key={index}
              className="w-[60rem] m-8 h-10 bg-violet-950 rounded-3xl flex items-center justify-between space-x-4  flex-shrink-0"
            >
              <div className="flex space-x-4">
                <span className="text-white text-xl  font-bold font-poppins">
                  {game.userData1.name}
                </span>
                <img
                  className="rounded-full "
                  width={30}
                  height={30}
                  src={game.userData1.avatarUrl}
                  alt="User Avatar"
                />
              </div>
              <div className="flex space-x-4">
                <span className="text-white text-xl  font-bold font-poppins">
                  {game.game.score1}
                </span>
              </div>
              <div className="flex space-x-4">
                <span className="text-white text-xl  font-bold font-poppins">
                  -
                </span>
              </div>
              <div className="flex space-x-4">
                <span className="text-white text-xl  font-bold font-poppins">
                  {game.game.score2}
                </span>
              </div>
              <div className="flex space-x-4">
                <img
                  className="rounded-full justify-end "
                  width={30}
                  height={30}
                  src={game.userData2.avatarUrl}
                  alt="User Avatar"
                />
                <p className="text-white text-xl  font-bold font-poppins">
                  {game.userData2.name}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No matchs found.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
