import React, { useState } from 'react';
import { useFriends } from '../hooks/useFriends';
import { useBlock } from '../hooks/useBlocked';
const Friends: React.FC = () => {
	const { users } = useFriends();
	const { users: Block } = useBlock();

	const [activeTab, setActiveTab] = useState(1);
	const handleTabClick = (index: number) => {
		setActiveTab(index);
	};

	return (
		<>
			<div className="w-screen p-8 font-poppins">
				<div className="justify-center gap-2 flex flex-row border-b">
					<div
						className={`text-3xl font-poppins text-white inline-block p-4 border-x-4 border-transparent rounded-t-lg cursor-pointer hover:bg-[#693DCE] hover:text-[#2D097F] ${activeTab === 1 ? 'bg-[#693DCE] text-white' : ''}`}
						onClick={() => handleTabClick(1)}
					>
						friends
					</div>
					<div
						className={`text-white text-3xl font-poppins inline-block p-4 border-x-4 border-transparent rounded-t-lg cursor-pointer hover:bg-[#693DCE] hover:text-[#2D097F] ${activeTab === 2 ? 'bg-[#693DCE] text-white' : ''}`}
						onClick={() => handleTabClick(2)}
					>
						blocked
					</div>
				</div>

				<div
					className={
						activeTab === 1
							? 'flex flex-col text-white text-3xl '
							: 'hidden'
					}
				>
					<div className="h-[53rem] lg:h-[33rem]">
						<div className="grid gap-8  grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
							{users && users.length > 0 ? (
								users.map((user, index) => (
									<div
										key={index}
										className="flex flex-col rounded-lg"
									>
										<div className="h-10 w-20 self-center">
											<img
												className="fixed border rounded-full z-0 "
												width={70}
												height={70}
												src={user.avatarUrl}
												alt={user.name}
											/>
										</div>
										<div className="bg-[#150142] gap-6 flex flex-col rounded-lg h-36">
											<div className="flex flex-row justify-between h-[80%] text-center items-center text-2xl text-white">
												<p
													className="text-white cursor-pointer"
													onClick={() => {
														window.location.href = `profile/${user.id}`;
													}}
												>
													{user.name}
												</p>
												<p className="text-white">
													#{user.score}
												</p>
											</div>
											<div className="flex flex-row justify-center gap-7">
												{/* <ChatIcon
                          sx={{ fontSize: 30 }}
                          className="text-[#150142] w-8 h-8 rounded-full bg-[#693DCE]"
                        />
                        <FaTableTennisPaddleBall className="w-8 h-8 text-[#150142] rounded-full bg-[#693DCE]" />
                        <PersonRemoveIcon
                          sx={{ fontSize: 30 }}
                          className="text-[#150142] w-8 h-8 rounded-full bg-[#693DCE]"
                        />
                        <FaUserSlash className="text-[#150142] rounded-full w-8 h-8 bg-[#693DCE]" /> */}
											</div>
										</div>
									</div>
								))
							) : (
								<></>
							)}
						</div>
					</div>
				</div>
				<div
					className={
						activeTab === 2
							? 'flex flex-col text-white text-3xl'
							: 'hidden'
					}
				>
					<div className="h-[53rem] lg:h-[33rem]">
						<div className="grid gap-8 grid-cols-1  md:grid-cols-2 lg:grid-cols-4">
							{Block && Block.length > 0 ? (
								Block.map((blocked, index) => (
									<div
										key={index}
										className="flex flex-col rounded-lg"
									>
										<div className="w-16 h-16 self-center">
											<img
												className="fixed border rounded-full mt-[35px]"
												width={70}
												height={70}
												src={blocked.avatarUrl}
												alt=""
											/>
										</div>
										<div className="bg-[#150142]  flex flex-col  rounded-lg h-36">
											<div className="flex flex-row  justify-between h-[80%]  text-center items-center text-2xl text-white">
												<p className="text-white  cursor-pointer" onClick={() => {
														window.location.href = `profile/${blocked.id}`;
													}}>
													{blocked.name}
												</p>
												<p></p>
											</div>
										</div>
									</div>
								))
							) : (
								<p> </p>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Friends;
