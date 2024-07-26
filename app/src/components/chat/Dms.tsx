import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { useChatStore } from './store';
import { useUser } from '../../hooks/useUser';
import { socket_game } from '../../utils/client-socket';
import axios from '../../api/axios';
import OnlineMode from '../game/OnlineMode';
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useParams } from 'react-router-dom';

function Dms() {
	const [message, setMessage] = useState<string>('');
	const [isInvitedGame, setisInvitedGame] = useState(false);
	const [isGameStarting, setIsGameStarting] = useState(false);
	const [isGameQuick, setIsGameQuick] = useState(false);
	const { messages, updateState, pushMessage, socket, currentUserId } = useChatStore();
	const scrollRef = useRef<HTMLDivElement>(null);
	const { id } = useParams();
	
	const sendMessage = () => {
		if (message.trim()) {
			socket?.emit('dm', { message, id });
			setMessage('');
		}
	};
	const { user } = useUser();
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.value.length <= 200) setMessage(e.target.value);
	};

  useEffect(() => {
    socket_game?.on("getGameInvite", (sender:string)=>{
      console.log('you got a game invitation from ', sender);
      setisInvitedGame(true);
    });
    socket_game?.on('inviteDeclined', ()=> {
      console.log('inviteDeclined');
      setisInvitedGame(false);
    });
    socket_game?.on('startGame', ()=>{
      console.log('startGame');
      setIsGameStarting(true);
    });
    return () => {
      socket_game?.off("inviteDeclined");
      socket_game?.off("getGameInvite");
      socket_game?.off('startGame');
    }
  },[]);

	useEffect(() => {
		scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await axios.get(`/chat/dm/${id}`);
				// console.log('get dm data', response);

				socket?.emit('atta', id);


				// console.log(response);
				updateState({
					currentUserId: response.data.currentUserId,
					messages: response.data.messages
						? response.data.messages
						: []
				});
			} catch (error) {
				if (isAxiosError(error)) toast.error(error.response?.data?.message);
			}
		};
		fetchMessages();

		if (!socket) return;

		socket.on('dm', pushMessage);

		return () => {
			socket.off('dm', pushMessage);
		};
	}, [updateState, pushMessage, socket, id]);

  const invite = (type:string) => {
    socket_game?.emit('sendGameInvite', {reciever:currentUserId, type:type});
    type === 'Quick' ? setIsGameQuick(true) : setIsGameQuick(false);
    setIsGameStarting(true);
  };
  

	return ((isGameStarting && isInvitedGame) ?
		<div className="bg-[#150142] w-screen h-screen  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 game"><OnlineMode type={''}/></div> :
		(isGameStarting) ?
		<div className="bg-[#150142] w-screen h-screen absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 game"><OnlineMode type={(isGameQuick ? 'quick' : 'classic')}/></div> :
		(
		<div className=" w-full h-full flex flex-col items-center justify-end rounded-md ">
			<div className=" flex-grow w-full  bg-[#2D097F] z-[0]  overflow-y-auto flex flex-col relative justify-end">
				<div className="bg-violet-400  h-12 flex items-center justify-end px-5 z-0">
					<div
						className="bg-[#150142]   rounded-full  py-1 px-2 text-poppins text-white text-bold cursor-pointer"
						onClick={() => {
							!isInvitedGame
								? invite('quick')
								: socket_game?.emit(
										'acceptGameInvite',
										currentUserId
									);
							setIsGameStarting(true);
						}}
					>
						{!isInvitedGame ? 'quick game' : 'acceptGameInvite'}
					</div>
					<div
						className="bg-[#150142]   rounded-full  py-1 px-2 text-poppins text-white text-bold cursor-pointer"
						onClick={() => {
							!isInvitedGame
								? invite('classic')
								: socket_game?.emit(
										'declineGameInvite',
										currentUserId
									);
							setisInvitedGame(false);
						}}
					>
						{!isInvitedGame ? 'classic game' : 'declineGameInvite'}
					</div>
				</div>
				<div className="overflow-y-auto h-full flex flex-col justify-start border-r">
					{messages &&
						messages.map((msg, index) => (
							<div
								key={index}
								className={`flex z-[10] mx-5  gap-2  ${msg.senderId !== user.id ? 'flex-row' : 'flex-row-reverse'}
			   items-end`}
							>
								<div
									key={index}
									className={`rounded-lg my-1 p-2  flex flex-col relative text-sm font-normal font-['Acme']   ${
										msg.senderId !== user.id
											? 'rounded-tl-none  bg-[#693DCE]'
											: 'rounded-tr-none  bg-[#ff7e03]'
									} 
                 
                max-w-[320px] text-white`}
									style={{ wordWrap: 'break-word' }}
								>
									{msg.message}
								</div>
							</div>
						))}
					<div ref={scrollRef}></div>
				</div>
			</div>
			<div
				//  ${isblocked ? 'hidden' : ''}
				className="flex items-center w-full bg-violet-400 h-[8%] gap-2  border-stone-300   py-2 justify-center"
			>
				<input
					type="text"
					value={message}
					onChange={handleInputChange}
					onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
					placeholder="send message"
					className="h-full bg-white  rounded-full w-full ml-5   justify-start pl-4 items-center inline-flex text-neutral-700  outline-none py-5 text-base font-normal font-['Acme']"
				/>
				<IoSend
					size={38}
					className="text-blue-800 mr-5 cursor-pointer"
					onClick={sendMessage}
				/>
			</div>
		</div>)
	);
}

export default Dms;
