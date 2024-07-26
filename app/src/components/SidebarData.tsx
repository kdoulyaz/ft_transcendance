import { sidebarNavigation } from "./icons";
import { useNavigate } from "react-router-dom";
// import { useSetLogOut } from "./query-hooks/setLogOut";
import LogoutButton from "./LogoutButton";

const SidebarData = () => {
  // const logoutMutation = useSetLogOut();
  // const logout = () => {

  //   logoutMutation.mutate(
  //     "logout",
  //     {
  //       onSuccess: () => {
  //         window.location.href = "/login";
  //       },
  //     },
  //   );
  // }

  const navigate = useNavigate();
  return (
    <div className=" ">
      {sidebarNavigation.map((item) => (
        <div
          key={item.name}
          onClick={() => navigate(item.href)}
          className={
            item.current
              ? "text-white text-xl items-center flex flex-col p-9 -ml-4 rounded-lg   cursor-pointer  transition-all duration-300 last:absolute left-2 bottom-5"
              : "bg-red-500"
          }
        >
          <item.icon />
        </div>
      ))}
      <LogoutButton />
    </div>
  );
};

export default SidebarData;
