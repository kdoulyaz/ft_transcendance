import React from "react";
import { useNavigate, redirect } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { requestLogout } from "../requests/requestUser";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    navigate("/login");
    // redirect("/login");
    localStorage.removeItem("gameData");
    localStorage.removeItem("gameIsOpen");
    localStorage.removeItem("chakra-ui-color-mode");
    await requestLogout();
    navigate(0);
  };

  return (
    <LuLogOut
      onClick={handleLogout}
      className="text-white text-xl  transition-all duration-300  items-center flex rounded-lg  cursor-pointer last:absolute ml-3 bottom-14"
    />
  );
};

export default LogoutButton;
