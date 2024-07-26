import { useState, useEffect } from "react";
import axios from "../api/axios";
import { Channel } from "./chat/store";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
// import { RoomsList } from '../../../shared/types';
// import { axiosPrivate } from '../api';
// import toast from 'react-hot-toast';
// import { picture, FormComponent } from '.';
// import { useChatLayoutStore } from '../stores/chatLayoutStore';
// import { FieldValues } from 'react-hook-form';

const JoinGroup = () => {
  const fields = ["PUBLIC", "PROTECTED"];
  const [filter, setFilter] = useState("PUBLIC");
  const [roomsList, SetRoomsList] = useState<Channel[]>([]);
  // const { socket, pushRoom } = useChatLayoutStore();
  //   const [isLoading, setIsloading] = useState(false);

  // const HandleJoin = async (room: RoomsList) => {
  //     try {
  //         setIsloading(true);
  //         await axiosPrivate.post('/chat/joinRoom', {
  //             name: room.name,
  //             roomId: room.id,
  //             password: room.password
  //         });
  //         toast.success('joined the room successfully');
  //         socket?.emit('joinRoom', { ...room });
  //         pushRoom(room);
  //         closeEvent();
      // } catch (error) {
      //     if (isAxiosError(error)) toast.error(error.response?.data?.message);
  //     }
  //     setIsloading(false);
  // };

  useEffect(() => {
    const fetchRoomsList = async () => {
      try {
        const res = await axios.get("/chat/AllRooms/");
        // console.log("all roooms", res);
        SetRoomsList(res.data);
      } catch (error) {
        if (isAxiosError(error))
          toast.error(error.response?.data?.message);
        // console.log(error);
      }
    };

    fetchRoomsList();
  }, []);

  // const filteredRooms = roomsList.filter((room) => room.privacy === filter);
  return (
    <div className="overflow-y-auto h-[400px] w-[400px]  p-1 bg-violet-400 items-start justify-start mb-2 rounded-[20px] shadow  ">
      <div className=" px-2.5  justify-start items-center gap-5 inline-flex sticky top-0 z-10 w-full">
        <div className="grow shrink basis-0 self-stretch px-2.5 justify-between items-center flex ">
          <div className="self-stretch px-2.5justify-start items-center gap-4 flex">
            {fields.map((field, index) => (
              <div
                key={index}
                className={`self-stretch px-3 py-4 justify-start items-center gap-2.5 flex  text-sm font-normal font-['poppins'] cursor-pointer  ${
                  field == filter
                    ? "text-black border-b-2 border-black"
                    : "text-zinc-500"
                } `}
                onClick={() => {
                  setFilter(field);
                }}
              >
                <div>{field.toLowerCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full  ">
        {roomsList.map((room, index) => (
          <div
            key={`rooms${index}`}
            className="w-full p-2.5 border-b border-neutral-200 justify-between items-center gap-2.5 flex cursor-pointer  "
          >
            <div className="flex items-center justify-center gap-2">
              {/* <img
                         src={room.avatar}
                        //  style="w-14	h-14 bg-black rounded-[150px] border border-white"

                     /> */}
              <div className="text-black text-[17px] font-semibold font-['Maven Pro'] leading-snug tracking-tight">
                {room.name}
              </div>
            </div>
            {filter !== "PROTECTED" ? (
              <div
                className="flex items-center rounded-md justify-center gap-2 p-1.5 hover:p-2 cursor-pointer font-['Acme'] bg-black text-white"
                // onClick={() => {
                //   HandleJoin(room);
                // }}
              >
                join Rooms
                {/* {isLoading ? "loading..." : "join Rooms"} */}
              </div>
            ) : (
              <div className="w-[30%] flex items-center justify-center gap-2">
                {/* <FormComponent
                             fields={[
                                 {
                                     label: '',
                                     type: 'password',
                                     name: 'password',
                                     placeholder: 'password',
                                     validation: {
                                         required:
                                             'password is required!'
                                     }
                                 }
                             ]}
                             onSubmit={async (data: FieldValues) => {
                                 room.password = data['password'];
                                 HandleJoin(room);
                             }}
                         /> */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinGroup;
