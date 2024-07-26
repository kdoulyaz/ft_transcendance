import { create } from 'zustand';
import io, { Socket } from 'socket.io-client';
import { User } from '../../../types/user';

export interface Channel {
	id: string;

	picture: string;

	name: string;

	isRoom: boolean;

	privacy?: string;

	password?: string;
}

export interface Message {
	id: string;
	picture?: string;
	nickName?: string;
	message: string;
	senderId: string;
}

type ChatStates = {
	currentUserId: string;
	socket: Socket | null;
	channels: Channel[];
	messages: Message[];
	name: string;
	picture: string;
	privacy: string;
	admins: User[];
	members: User[];
	ownerId: string;
};

type ChatActions = {
	connect: () => void;
	pushRoom: (channel: Channel) => void;
	updateState: (newState: Partial<ChatStates>) => void;
	pushMessage: (msg: Message) => void;
	disconnect: () => void;
};

export const useChatStore = create<ChatStates & ChatActions>((set, get) => ({
	currentUserId: '',
	socket: null,
	channels: [],
	messages: [],
	name: '',
	picture: '',
	admins: [],
	members: [],
	privacy: '',
	ownerId: '',
	connect: () => {
		const { socket } = get();
		if (!socket) {
			const newSocket = io(`${import.meta.env.VITE_BASE_URL}/chat`, {
				withCredentials: true,
				transports: ['websocket', 'polling']
			});
			set({ socket: newSocket });
		}
	},
	pushMessage: (msg) => {
		const { messages } = get();

		const newMessages = [...messages, msg];
		set({ messages: newMessages });
	},
	updateState: (newState) => {
		set((state) => ({ ...state, ...newState }));
	},
	pushRoom: (channel) => {
		const { channels } = get();

		if (
			!channels.some(
				(room) =>
					room.id === channel.id && room.isRoom === channel.isRoom
			)
		) {
			const newMessages = [...channels, channel];
			set({ channels: newMessages });
		}
	},
	disconnect: () => {
		const { socket } = get();
		if (socket) {
			socket.disconnect();
			set({ socket: null });
		}
	}
}));
