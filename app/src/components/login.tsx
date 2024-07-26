import React from "react";
import { UseQueryResult } from "react-query";
import useCheckIsLoggedIn from "./query-hooks/useCheckIsLoggedIn";
// import LoadingSpinner from "./loading";
import { Navigate } from "react-router-dom";
import {User} from '../types/user';

const Login: React.FC = () => {
  const userInfo: UseQueryResult<User> = useCheckIsLoggedIn();
  if (userInfo.isSuccess && userInfo.data) {
    return <Navigate to="/home" />;
  }

  return (
      <>
        <div className="bg-[#150142]">
          <div className="h-screen overflow-hidden flex flex-col items-center justify-center">
            <div className="">
              <img src="Pongo-login.png" />
            </div>
            <div className="text-4xl text-white m-8 font-poppins">
              Let the fun begin!
            </div>
            <div>
              <button
                className="flex  bg-[#ff7e03] rounded-lg px-8 py-4 text-white  text-3xl font-poppins"
                onClick={() => {
                  window.location.assign(
                    "http://localhost:3080/auth/42/oauth_callback",
                  );
                }}
              >
                <svg
                  className="mr-[7px]"
                  width="33"
                  height="33"
                  viewBox="0 0 33 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.09998 20.928H12.4472V26.6136H18.1087V16.3389H6.78216L18.1087 4.98828H12.4472L1.09998 16.3389V20.928Z"
                    fill="white"
                  />
                  <path
                    d="M20.5529 10.8006L26.2179 5.11841H20.5529V10.8006Z"
                    fill="white"
                  />
                  <path
                    d="M26.2179 10.6705L20.5529 16.3389V22.0039H26.2179V16.3389L31.9 10.6705V4.98828H26.2179V10.6705Z"
                    fill="white"
                  />
                  <path
                    d="M31.9 16.469L26.2178 22.134H31.9V16.469Z"
                    fill="white"
                  />
                </svg>
                <span className="">Continue with intra</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
};
export default Login;
