import React from "react";
import { useNavigate } from "react-router-dom"; // Assuming you're using React Router
import { useLeaderBoard } from "../hooks/useLeaderBoard";

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { users = [] } = useLeaderBoard();

  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`);
  };

  return (
    <div className="w-screen flex md:w-screen h-screen flex-col font-poppins gap-4 justify-center mt-[-328px] items-center bg-[#2D097F]">
      {users.map((user, index) => (
        <div
          key={index}
          className="h-12 flex items-center justify-between bg-violet-950 rounded-xl cursor-pointer  w-[43rem]"
        >
          <div
            className="flex items-center justify-start space-x-4 flex-shrink-0"
            onClick={() => handleProfileClick(user.id)}
          >
            <img
              className="rounded-full"
              width={30}
              height={30}
              src={user.avatarUrl}
              alt={`${user.name}'s profile picture`}
            />
            <p className="text-white text-xl font-bold font-poppins">
              {user.name}
            </p>
          </div>
          <div className="text-white justify-end flex space-x-4">
            <p>{user.score}</p>
            <p className="font-bold text-violet-700 font-poppins">
              #{index + 1}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
