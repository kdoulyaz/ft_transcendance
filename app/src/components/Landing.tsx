import React from "react";
import { useNavigate } from "react-router-dom";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#150142] h-screen flex flex-col">
      <div className="bg-[#150142] h-36 flex justify-around items-center">
        <div>
          <img src="Pongo-logo 1.png" />
        </div>
        <div className="flex text-3xl gap-12 justify-center items-center font-poppins text-white">
          <div>
            <button className="Home" onClick={() => navigate("/home")}>
              Home
            </button>
          </div>
          <div>
            <button className="About-us" onClick={() => navigate("/About-us")}>
              About us
            </button>
          </div>
          <div>
            <button
              className="How-to-play"
              onClick={() => navigate("/How-to-play")}
            >
              How to play
            </button>
          </div>
        </div>
        <div className="">
          <button
            className="bg-[#ff7e03] rounded-lg px-10 py-1  text-white h-11 text-3xl font-poppins"
            onClick={() => navigate("/Login")}
          >
            Login
          </button>
        </div>
      </div>
      <div className="flex flex-col w-full  justify-center items-center">
        <div className="text-3xl text-white m-8 font-poppins">
          Welcome to Pongo the world‘s most entertaining ping pong online game
        </div>
        <img className="" src="huge_global.png" />
      </div>
      <div className="text-3xl text-[#ff7e03] font-poppins flex flex-col w-full justify-center items-center decoration-20">
        Why pongo?
      </div>
    </div>
  );
};
export default Landing;
