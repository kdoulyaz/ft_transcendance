import { UseQueryResult } from "react-query";
import { Navigate, Outlet } from "react-router-dom";
import { User } from "./interfaces";
import LoadingSpinner from "./loading";
import useCheckIsLoggedIn from "./query-hooks/useCheckIsLoggedIn";

export default function RequireAuth() {

  const userInfo: UseQueryResult<User | undefined> = useCheckIsLoggedIn();
  if (userInfo.isSuccess && userInfo.data) {
    return <Outlet />;
  } else if (userInfo.isLoading) {
    return <LoadingSpinner />;
  } else {
    return <Navigate to="/login" />;
  }
}
