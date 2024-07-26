import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import LoadingSpinner from "./loading";

const Home: React.FC = () => {
  const { user, error, isLoading } = useUser();
  const navigate = useNavigate();

  if (error) {
    return <p>Error</p>
  }

  if (isLoading) {
    <LoadingSpinner></LoadingSpinner>
  }

  return (
    <>
      <div className="bg-[#2D097F] w-screen  ">
        <div className="grid  gap-4 items-start mt-8 justify-center p-8 ">
          <div className="relative">
            <div className=" flex flex-col items-center   p-4 rounded-lg leading-none  ">
              <div className="   shadow-xl bg-[#693DCE] -mt-10 shadow-[#189AB4] rounded-lg h-32 flex  ">
                <div className="-mt-10 justify-stretch  ">
                  <img
                    className="rounded-full border-4   border-[#693DCE] "
                    src={user.avatarUrl}
                    width={100}
                    height={100}
                    alt=""
                  />
                </div>
                <div className="  p-2 flex justify-between flex-col font-poppins font-semibold ">
                  <span className="text-3xl  text-[#189AB4]">
                    Welcome {user.name} !
                  </span>
                  <span className="text-white text-2xl -mt-10">
                    Get ready for an amazing experience
                  </span>
                </div>
                <div className=" mt-10 w-15  p-10">
                  <button
                    className="  py-2 px-6 bg-[#FF8200] hover:bg-[#FFD68A] text-white font-poppins rounded-2xl "
                    onClick={() => navigate("/Classic")}
                  >
                    Play Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" text-black  grid grid-cols-3 px-20 py-20  gap-4  ">
          <div className="shadow-lg bg-[#693DCE] flex flex-row shadow-[#189AB4]  rounded-3xl">
            <div className="flex-grow flex gap-5 flex-col p-10 rounded-3xl justify-center">
              <div className="text-white space-x-1 text-3xl font-poppins">
                <span>Quick Mode</span>
                <br />
                <span className="text-xl">Dive into fast-paced action</span>
              </div>
              <div className="">
                <button
                  className=" rounded-3xl justify-end  text-white px-6  bg-[#FF8200]"
                  onClick={() => navigate("/Quick")}
                >
                  Play now
                </button>
              </div>
            </div>
            <div className="flex-grow flex justify-end">
              <img
                className="self-end"
                src="quick.png"
                width={200}
                height={200}
              />
            </div>
          </div>
          <div className="shadow-lg flex flex-row  bg-[#693DCE] shadow-[#189AB4] rounded-3xl">
            <div className="flex-grow gap-5  flex flex-col p-10 rounded-3xl justify-center">
              <div className="text-white space-x-1 text-3xl font-poppins">
                <span>Classic Mode</span>
                <br />
                <span className="text-xl">
                  Relive the original gameplay experience
                </span>
              </div>
              <div className="">
                <button
                  className=" rounded-3xl justify-end  text-white px-6  bg-[#FF8200]"
                  onClick={() => navigate("/Classic")}
                >
                  Play now
                </button>
              </div>
            </div>
            <div className="flex-grow flex justify-end">
              <img
                className="self-end"
                src="classic.png"
                width={200}
                height={200}
              />
            </div>
          </div>
          <div className="shadow-lg flex flex-row bg-[#693DCE] shadow-[#189AB4] rounded-3xl">
            <div className="justify-center gap-5 flex-grow p-10  flex flex-col rounded-3xl ">
              <div className="text-white space-x-1 text-3xl font-poppins">
                <span>Bot Mode</span>
                <br />
                <span className="text-xl">Challenge AI opponents solo</span>
              </div>
              <div className="">
                <button
                  className=" rounded-3xl justify-end  text-white px-6  bg-[#FF8200]"
                  onClick={() => navigate("/Bot")}
                >
                  Play now
                </button>
              </div>
            </div>
            <div className="flex-grow flex justify-end">
              <img
                className="self-end"
                src="bot.png"
                width={200}
                height={200}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Home;
