import { FieldValues, useForm } from 'react-hook-form';
import axios from '../../api/axios';
import { useState } from 'react';
import { useChatStore } from './store';
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";

const VISIBILTYOPTIONS = ['public', 'private', 'protected'];

const RoomPrivacy: { [key: string]: number } = {
	PUBLIC: 0,
	PRIVATE: 1,
	PROTECTED: 2
};

const CreateGroup = ({ closeEvent }: { closeEvent: () => void }) => {
	const { pushRoom } = useChatStore();
	const [selectedVisibility, setSelectedVisibility] =
		useState<string>('public');
	const {
		register,
		handleSubmit,
		formState: { isSubmitting }
	} = useForm({
		defaultValues: {
			groupName: '',
			password: '',
			privacy: ''
		}
	});
	const onSubmit = async (data: FieldValues) => {
		try {
			// console.log('form submit data : 	', data);
			const privacyInt = RoomPrivacy[data['privacy'].toUpperCase()];
			const res = await axios.post(
				'/chat/createRoom',
				JSON.stringify({
					roomTitle: data['groupName'],
					isConversation: false,
					privacy: privacyInt,
					avatar: 'https://www.shareicon.net/data/128x128/2016/01/09/700702_network_512x512.png',
					password: data['password']
				}),
				{
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			const room = res.data;
			pushRoom({ name: room.roomTitle, picture: room.avatar, ...room });
			closeEvent();
			// console.log(res);
		}catch (error) {
			if (isAxiosError(error)) toast.error(error.response?.data?.message);
		}
	};
	return (
		<form
			className="bg-violet-400 px-2 pt-10 pb-2 flex-col items-center justify-between  rounded-md space-y-3 "
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="mb-4">
				<label
					className="block text-gray-700 text-sm font-bold mb-2"
					htmlFor="channelName"
				>
					Channel Name:
				</label>
				<input
					className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					id="channelName"
					type="text"
					placeholder="Enter channel name"
					{...register('groupName', {
						required: 'groupName is required!',
						minLength: {
							value: 1,
							message:
								'password name must be at least 1 characters'
						}
					})}
				/>
			</div>
			<div className="mb-4">
				<label
					className="block text-gray-700 text-sm font-bold mb-2"
					htmlFor="channelName" // formState: { errors, isSubmitting },
				>
					Privacy:
				</label>
				<div className=" inline-flex gap-2 w-full  items-center justify-center ">
					{VISIBILTYOPTIONS.map((visibility, index) => (
						<div
							className="flex items-center  justify-center"
							key={'visiblty' + index}
						>
							<div className="flex items-center justify-center">
								<input
									id={`default-radio-${visibility}`}
									type="radio"
									{...register('privacy', {
										required:
											'A visibility option is required!'
									})}
									value={visibility}
									checked={selectedVisibility === visibility}
									onChange={(e) =>
										setSelectedVisibility(e.target.value)
									}
									className="w-4 h-4  bg-gray-100 border-gray-300 rounded focus:ring-blue focus:ring-1"
								/>
								<label
									htmlFor={`default-radio-${visibility}`}
									className="ms-2  font-['poppins'] 0  text-gray-700 text-sm font-bold "
								>
									{visibility.toLowerCase()}
								</label>
							</div>
						</div>
					))}
				</div>
			</div>
			{selectedVisibility === 'protected' && (
				<div className="mb-4">
					<label
						className="block text-gray-700 text-sm font-bold mb-2"
						htmlFor="channelPassword"
					>
						Channel Password:
					</label>
					<input
						className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						id="channelPassword"
						type="password"
						autoComplete="new-password"
						placeholder="Enter channel password"
						{...register('password', {
							required: 'password is required!',
							minLength: {
								value: 1,
								message:
									'password name must be at least 1 characters'
							}
						})}
					/>
				</div>
			)}
			<div className="flex flex-col">
				<button
					className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'bg-gray-500 hover:bg-gray-700' : ''}`}
					type="submit"
					disabled={isSubmitting}
				>
					Create Channel
				</button>
				<button
					className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 focus:outline-none focus:shadow-outline"
					onClick={closeEvent}
				>
					Cancel
				</button>
			</div>
		</form>
	);
};

export default CreateGroup;
