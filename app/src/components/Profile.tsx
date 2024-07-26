import React from "react";
import { useUser } from "../hooks/useUser";
import LoadingSpinner from "./loading";
import { useDisclosure } from "@chakra-ui/react";

import UserProfile from "./UsersProfile";
import NotFound from "./notFound";
import { useParams } from "react-router-dom";
import Setting from "./Setting";
import { useGameHistory } from "./query-hooks/getUserGameHistory";

const Profile: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isLoading } = useUser();
  const { history, isLoading: onLoad } = useGameHistory(user.id);
  const handleEditProfileClick = () => {
    onOpen();
  };

  if (isLoading || onLoad) {
    return <LoadingSpinner />;
  }

  // if (error) {
  //   return <div>Error</div>;
  // }

  // console.log(history);
  return (
    <>
      <div className="w-screen flex md:w-screen  flex-col  gap-4 justify-center  items-center bg-[#2D097F]">
        <div className="items-center font-bold text-white flex flex-col ">
          <img
            className="w-32 h-32 rounded-full"
            src={user.avatarUrl}
            alt="User Avatar"
          />
          <p>{user.name}</p>
          <p className="text-center text-violet-700 text-2xl font-bold font-Poppins">
            {user.rank}
          </p>
          <button
            className="w-60 h-12 bg-violet-950 rounded-3xl"
            onClick={handleEditProfileClick}
          >
            Edit Profile
          </button>
        </div>

        {/* Modal Component */}

        <div className="flex ">
          <div className="flex flex-col overflow-y-scroll justify-center items-center w-[65rem] h-80 bg-zinc-300 bg-opacity-0 rounded-lg border border-violet-700">
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
              <p className="text-3xl text-white ">
                No matchs found.
              </p>
            )}
          </div>
        </div>
      </div>

      <Setting isOpen={isOpen} onClose={onClose}></Setting>
    </>
  );
};

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const { user } = useUser();

  if (user.id === id) {
    return <Profile />;
  }
  if (!id) {
    return <NotFound />;
  }

  return <UserProfile userId={id} />;
};

export { ProfilePage, Profile };
