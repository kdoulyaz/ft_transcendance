import { NavLink, Outlet } from 'react-router-dom';
import { useChatStore } from './store';
import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import PortalModal from '../PortalModal';
import JoinGroup from './JoinGroup';
import CreateGroup from './CreateGroup';
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
// import { FieldValues, useForm } from "react-hook-form";
// const RoomPrivacy: { [key: string]: number } = {
//   PUBLIC: 0,
//   PRIVATE: 1,
//   PROTECTED: 2,
// };
// export interface channel {
//   id: number;
//   picture: string;
//   name: string;
//   isRoom: boolean;
// }
// const VISIBILTYOPTIONS = ["public", "private", "protected"];
function Layout() {
	const { channels, updateState } = useChatStore();
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [openGroupModel, setOpenGroupModel] = useState<boolean>(false);
	const [openNavigationModel, setOpenNavigationModel] = useState<boolean>(false);

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get('/chat/allChannels');
			// console.log('channels', response.data);
			updateState({ channels: response.data });
		};

    try {
      fetchData();
    } catch (error) {
      if (isAxiosError(error))
          toast.error(error.response?.data?.message);
    }
  }, [updateState]);

	const filteredItems = channels.filter((channel) =>
		channel.name.toLowerCase().startsWith(searchTerm.toLowerCase())
	);

  // const onSubmit = async (data: FieldValues) => {
  //   try {
  //     console.log(data);
  //     const privacyInt = RoomPrivacy[data["privacy"].toUpperCase()];
  //     const res = await axios.post(
  //       "/chat/createRoom",
  //       JSON.stringify({
  //         roomTitle: data["groupName"],
  //         isConversation: false,
  //         privacy: privacyInt,
  //         avatar:
  //           "https://www.simplilearn.com/ice9/free_resources_article_thumb/what_is_image_Processing.jpg",
  //         password: data["password"],
  //       }),
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     const room = res.data;
  //     pushRoom({ name: room.roomTitle, picture: room.avatar, ...room });
  //     setOpenGroupModel(false); 
  //     console.log(res);
  //   } catch (error) {
  //     if (isAxiosError(error))
  //       toast.error(error.response?.data?.message);
  //   }
  // };

	return (
		<div className=" flex-grow h-full flex overflow-hidden rounded-3xl">
			<PortalModal
				isEventOpen={openGroupModel}
				removable={true}
				closeEvent={() => setOpenGroupModel(false)}
			>
				<CreateGroup closeEvent={() => setOpenGroupModel(false)} />
			</PortalModal>
			<PortalModal
				isEventOpen={openNavigationModel}
				removable={true}
				closeEvent={() => setOpenNavigationModel(false)}
			>
				<JoinGroup closeEvent={() => setOpenNavigationModel(false)} />
			</PortalModal>

			<div className="w-[20%] border-l bg-violet-400  overflow-y-auto flex-col justify-start items-center inline-flex border-r">
				<div className="bg-violet-400 w-full flex flex-col items-center justify-center border-b px-5 gap-2 py-2 ">
					<input
						id="desktop-search"
						type="search"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search"
						className=" z-0 block w-full text-center h-10 relative z-10 rounded-full border-none outline-0 placeholder-white bg-[#693DCE] font-poppins text-white  outline-none border-black"
					/>
					<div className="inline-flex items-center justify-center gap-4">
						<span
							className="bg-[#693DCE] flex items-center justify-center px-2 py-1 text-white rounded-xl  cursor-pointer"
							onClick={() => {
								setOpenNavigationModel(true);
							}}
						>
							join rooms
						</span>
						<span
							className=" bg-[#693DCE] flex items-center justify-center px-2 py-1 text-white rounded-xl  cursor-pointer"
							onClick={() => {
								setOpenGroupModel(true);
							}}
						>
							create rooom
						</span>
					</div>
				</div>
				{filteredItems.map((channle, index) => (
					<NavLink
						key={`rooms${index}`}
						to={`${channle.isRoom ? 'room' : 'dm'}/${channle.id}`}
						className={({ isActive }) =>
							`w-full p-2.5 border-b  border-neutral-200 justify-start items-center gap-4 flex cursor-pointer ${
								isActive
									? 'bg-[#9EABF0] text-white'
									: 'bg-violet-400'
							}`
						}
					>
						<img
							style={{
								borderRadius: '50%',
								objectFit: 'cover',
								width: '42px',
								height: '42px',
								border: 'solid black'
							}}
							src={channle?.picture}
							alt="User picture"
						/>

						<span>{channle.name}</span>
					</NavLink>
				))}
			</div>

			<div className="flex-grow bg-white font-poppins ">
				<Outlet />
			</div>
		</div>
	);
}

export default Layout;
