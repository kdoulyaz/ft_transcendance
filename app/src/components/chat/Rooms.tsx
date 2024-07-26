import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { useChatStore } from './store';
import { useUser } from '../../hooks/useUser';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import axios from '../../api/axios';

function Rooms() {
	const [message, setMessage] = useState<string>('');
	const {
		messages,
		updateState,
		pushMessage,
		socket,
		name,
		picture,
		members
	} = useChatStore();
	const scrollRef = useRef<HTMLDivElement>(null);
	const { id } = useParams();
	const nav = useNavigate();

	const sendMessage = () => {
		if (message.trim()) {
			socket?.emit('message', { message, id });
			setMessage('');
		}
	};
	const { user } = useUser();
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.value.length <= 200) setMessage(e.target.value);
	};

	useEffect(() => {
		scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	useEffect(() => {
		const fetchMessages = async () => {
			const response = await axios.get(`/chat/room/${id}`, {
				withCredentials: true
			});
			if (socket) socket.emit('atta', id);
			// console.log('room data response', response);
			updateState({ ...response.data });
		};
		try {
			fetchMessages();
		} catch (error) {
			if (isAxiosError(error)) toast.error(error.response?.data?.message);
		}
		if (socket) {
			socket.on('message', pushMessage);
			socket.on('getOut', () => {
				nav(-1);
			});
		}
		return () => {
			if (socket) {
				socket.off('message', pushMessage);
				socket.off('getOut');
			}
		};
	}, [updateState, pushMessage, socket, id]);

	return (
		<div className=" w-full h-full  inline-flex items-center justify-end rounded-md ">
			<div className="flex flex-col items-center justify-end flex-grow w-full h-full ">
				<div className=" flex-grow w-full  bg-[#2D097F] z-[0]  overflow-y-auto flex flex-col relative justify-between border">
					<div className="bg-violet-400 h-14 flex items-center justify-end px-5 py-2 sticky top-0 z-10 border-b border-neutral-100 "></div>
					<div className="  overflow-y-auto h-full flex flex-col justify-start z-0 flex-grow">
						{messages &&
							messages.map((msg, index) => (
								<div
									className="flex flex-col gap-1"
									key={msg.id + index}
								>
									{msg.senderId !== user.id && (
										<div className="mx-5 text-white font-poppins font-bold">
											{msg.nickName}
										</div>
									)}
									<div
										key={index}
										className={`flex z-[10] mx-5 ml-6 gap-2 ${msg.senderId !== user.id ? 'flex-row' : 'flex-row-reverse'}
			   							items-end`}
									>
										<div
											key={index}
											className={` rounded-lg my-1 p-2 flex flex-col relative text-sm font-normal font-['Acme'] ${
												msg.senderId !== user.id
													? 'rounded-tl-none  bg-[#693DCE]'
													: 'rounded-tr-none  bg-[#ff7e03]'
											} 
                 
                							max-w-[500px] text-white`}
											style={{ wordWrap: 'break-word' }}
										>
											<pre className="whitespace-pre-wrap">
												{msg.message}
											</pre>
										</div>
									</div>
								</div>
								// </div>
							))}
						<div ref={scrollRef}></div>
					</div>
				</div>
				<div className="flex items-center w-full bg-violet-400 h-[8%] gap-2  border-stone-300   py-2 justify-center">
					<input
						type="text"
						value={message}
						onChange={handleInputChange}
						onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
						placeholder="send message or run /help"
						className="h-full bg-white  rounded-full w-full ml-5   justify-start pl-4 items-center inline-flex text-neutral-700  outline-none py-5 text-base font-normal font-['Acme']"
					/>
					<IoSend
						size={38}
						className="text-blue-800 mr-5 cursor-pointer"
						onClick={sendMessage}
					/>
				</div>
			</div>
			<div className="w-[30%] px-2  border h-full gap-10 bg-violet-400 flex flex-col items-center justify-center  py-2">
				<div className="flex flex-col items-center justify-center w-full gap-2">
					<img
						src={picture}
						className="w-20	h-20 bg-white rounded-[150px] border border-white"
					/>
					<span className="font-poppins text-white">{name}</span>
				</div>
				{/* flex-grow  relative w-full max-h-[450px] overflow-y-auto gap-4 flex flex-col items-center justify-start  border border-stone-400 rounded-md bg-slate-100 px-4 py-4 */}
				<div className="h-[60%] overflow-y-auto w-full p-2 bg-violet-300 border z-0">
					{members.map((member, index) => (
						<NavLink
							key={'memeber' + index}
							to={`/profile/${member.id}`}
							className="inline-flex items-center justify-start gap-2 py-2 border-b w-full border-white cursor-pointer "
						>
							<img
								src={member.avatarUrl}
								className="w-12 h-12 bg-black rounded-[150px] border border-white"
							/>
							<span className="font-poppins text-white">
								{member.name}
							</span>
						</NavLink>
					))}
				</div>
			</div>
		</div>
	);
}

export default Rooms;
