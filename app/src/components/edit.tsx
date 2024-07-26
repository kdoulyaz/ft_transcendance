import { useUser } from "../hooks/useUser";
import LoadingSpinner from "./loading";
// import { User } from "../types/user";

const Edit = () => {
  const { user, error, isLoading, mutate } = useUser();
  // console.log(user);
  if (isLoading) {
    return <LoadingSpinner></LoadingSpinner>;
  }
  if (error) {
    return <div>Error: </div>;
  }
  mutate;
  return (
    <>
      <div className="w-screen flex md:w-screen  flex-col  gap-4 justify-center  items-center bg-[#150142]">
        <div className=" items-center font-bold text-white flex flex-col ">
          <img className=" w-32 h-32 rounded-full" src={user.avatarUrl} />
          <p> {user.name} </p>
          <p className="text-center text-violet-700 text-2xl font-bold font-Poppins">
            {user.rank}
          </p>
          <div className="flex  items-center w-60 h-12 bg-violet-950 rounded-3xl">
            <p className="text-center text-violet-700">Edit profile</p>
          </div>
        </div>
        <div className="grid grid-cols-3  gap-4 ">
          <div className="flex flex-col items-center w-72 h-80 bg-zinc-300 bg-opacity-0 rounded-lg border border-violet-700">
            <div className="w-60 h-12 bg-violet-950 rounded-3xl"></div>
          </div>
          <div className="w-72 h-80 bg-zinc-300 bg-opacity-0 rounded-lg border border-violet-700"></div>
          <div className="flex flex-col items-center w-72 h-80 bg-zinc-300 bg-opacity-0 rounded-lg border border-violet-700">
            <div className="w-60 h-12 bg-violet-950 rounded-3xl "></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Edit;
