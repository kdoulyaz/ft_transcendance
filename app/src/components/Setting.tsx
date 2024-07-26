import React, { Dispatch, FormEvent, useEffect, useRef, useState } from 'react';
import { useUser } from '../hooks/useUser';
import {
	useDisclosure,
	Button,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Modal
} from '@chakra-ui/react';
import {
	requestUpdateUserName,
	requestUploadAvatar
} from '../requests/requestUser';
import LoadingSpinner from './loading';
import axios from 'axios';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';

const apiUrl = 'http://localhost:3080';

interface ToggleProps {
	toggleValue: boolean;
	setShowModal: Dispatch<React.SetStateAction<boolean>>;
	setToggleValue: Dispatch<React.SetStateAction<boolean>>;
	setQRCode: Dispatch<React.SetStateAction<string>>;
}

interface TwoFaModalProps {
	showModal: boolean;
	setShowModal: Dispatch<React.SetStateAction<boolean>>;
	setToggleValue: Dispatch<React.SetStateAction<boolean>>;
	qrCode: string;
	setQRCode: Dispatch<React.SetStateAction<string>>;
}

function TwoFaModal({
	showModal,
	setShowModal,
	setToggleValue,
	qrCode,
	setQRCode
}: TwoFaModalProps) {
	const verficationCodeRef = useRef<HTMLInputElement>(null);
	const [validCode, setValidCode] = useState<boolean>(true);

	function closeModal() {
		void axios
			.delete(`${apiUrl}/2fa/disable`, {
				withCredentials: true
			})
			.then((res) => res);
		setQRCode('');
		setShowModal(false);
		setToggleValue(false);
	}

	function onSubmitHandler(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const input = verficationCodeRef.current
			? verficationCodeRef.current.value
			: '';
		axios
			.post<string>(
				`${apiUrl}/2fa/validate`,
				{ twoFactorAuthenticationCode: input },
				{ withCredentials: true }
			)
			.then((res) => {
				if (
					res.data?.msg === 'invalidCode' ||
					res.data?.msg === 'invalidSecret'
				)
					setValidCode(false);
				else {
					setValidCode(true);
					setShowModal(false);
				}
			});
	}

	return (
		<>
			{showModal && (
				<div className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal h-full  bg-opacity-50">
					<div className="relative p-4 w-full max-w-xl h-full md:h-auto left-1/2 -translate-x-1/2">
						<div className="relative bg-[#150142] border rounded-lg shadow text-white font-poppins p-6">
							<h3 className="xl:text-xl lg:text-lg md:text-base sm:text-base text-base font-semibold text-gray-900 p-4 border-b">
								Two-Factor Authentication (2FA)
							</h3>
							{/* <h4 className="xl:text-base lg:text-base md:text-sm sm:text-xs text-xs text-purple-light font-medium border-b sm:my-2 md:my-2 mt-6 mb-4">
                Configuring Google Authenticator or Authy
              </h4>
              <div className="space-y-1 lg:text-sm md:text-sm sm:text-xs text-xs">
                <li>
                  Install Google Authenticator (IOS - Android) or Authy (IOS -
                  Android).
                </li>
                <li>In the authenticator app, select "+" icon.</li>
                <li>
                  Select "Scan a barcode (or QR code)" and use the phone's
                  camera to scan this barcode.
                </li>
              </div> */}
							<h4 className="xl:text-base lg:text-base md:text-sm sm:text-xs text-xs text-purple-light font-medium border-b sm:my-2 md:my-2 mb-2 mt-4">
								Scan QR Code
							</h4>
							<div className="flex justify-center">
								{qrCode ? (
									<img
										className="block lg:w-64 md:w-40 sm:w-32 w-24 lg:h-64 md:h-40 sm:h-32 h-24 object-contain"
										src={qrCode}
									/>
								) : (
									<LoadingSpinner />
								)}
							</div>
							<div>
								<h4 className="xl:text-base lg:text-base md:text-sm sm:text-xs text-xs text-purple-light font-medium border-b my-2">
									Verify Code
								</h4>
								<h5 className=" lg:text-sm md:text-xs sm:text-xs text-xs py-2">
									For changing the setting, please verify the
									authentication code:
								</h5>
							</div>
							<form onSubmit={onSubmitHandler}>
								<input
									className={`bg-[#693DCE] placeholder:text-white border md:text-xs sm:text-xs text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/4 p-2 my-4 sm:my-2 md:my-2
                  ${
						validCode
							? 'border-gray-300 text-white-900'
							: ' border-red-500 text-red-500'
					}`}
									type="text"
									name="code"
									placeholder="Authentication Code"
									ref={verficationCodeRef}
									onInput={() => setValidCode(true)}
								/>
								<div className=" items-center py-2 space-x-2">
									<button
										type="button"
										onClick={closeModal}
										className="text-white bg-blue-600  rounded-lg border  text-sm font-medium px-5 py-2.5"
									>
										Close
									</button>
									<button
										type="submit"
										className="text-white bg-[#FF8200]  hover:bg-purple-medium font-medium rounded-lg text-sm px-5 py-2.5 text-center"
									>
										Verify & Activate
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

function Generate2fa({
	toggleValue,
	setShowModal,
	setToggleValue,
	setQRCode
}: ToggleProps) {
	const { mutate } = useUser();
	function on2faActivation() {
		void axios
			.post<string>(
				`${apiUrl}/2fa/generate`,
				{},
				{
					withCredentials: true
				}
			)
			.then((response) => setQRCode(response.data));
		setToggleValue(true);
		setShowModal(true);
		mutate;
	}

	return (
		<div>
			<div
				onClick={on2faActivation}
				className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full
        peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300
        after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
			>
				{toggleValue ? (
					<span className="ml-1 font-bold text-[9px]">ON</span>
				) : (
					<span className="ml-6 font-bold text-[9px] text-black">
						OFF
					</span>
				)}
			</div>
		</div>
	);
}

function Disable2fa({
	toggleValue,
	setShowModal,
	setToggleValue,
	setQRCode
}: ToggleProps) {
	function on2faDelete() {
		void axios
			.delete(`${apiUrl}/2fa/disable`, {
				withCredentials: true
			})
			.then((res) => res);
		setQRCode('');
		setToggleValue(false);
		setShowModal(false);
	}

	return (
		<>
			<div
				onClick={on2faDelete}
				className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-green-300  peer-checked:after:translate-x-full
          peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300
          after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
			>
				{toggleValue ? (
					<span className="ml-1 font-bold text-[9px]">ON</span>
				) : (
					<span className="ml-6 font-bold text-[9px] text-black">
						OFF
					</span>
				)}
			</div>
		</>
	);
}

function Toggle({
	toggleValue,
	setShowModal,
	setToggleValue,
	setQRCode
}: ToggleProps) {
	return (
		<div className="flex flex-col items-center justify-center overflow-hidden w-20">
			<label className="relative cursor-pointer">
				<input
					type="checkbox"
					className="sr-only peer"
					checked={toggleValue}
					readOnly
				/>
				{toggleValue ? (
					<Disable2fa
						toggleValue={toggleValue}
						setShowModal={setShowModal}
						setToggleValue={setToggleValue}
						setQRCode={setQRCode}
					/>
				) : (
					<Generate2fa
						toggleValue={toggleValue}
						setShowModal={setShowModal}
						setToggleValue={setToggleValue}
						setQRCode={setQRCode}
					/>
				)}
			</label>
		</div>
	);
}

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const Setting: React.FC<ModalProps> = ({ isOpen, onClose }) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [error, setError] = useState<string>('');
	const { onOpen } = useDisclosure();
	const [username, setUsername] = useState<string>('');
	const { user, mutate } = useUser();
	const [preview, setPreview] = useState<string | null>(null);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [qrCode, setQRCode] = useState<string>('');
	const [toggleValue, setToggleValue] = useState<boolean>(
		user.twoFactorEnabled
	);

	useEffect(() => {
		onOpen();
	}, []);

	const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files ? event.target.files[0] : null;
		validateFile(file);
		if (file === null) {
			setPreview(null);
		} else {
			setPreview(file?.name as string);
		}
	};

	const handleSubmit = async () => {
		if (selectedFile) {
			await requestUploadAvatar(selectedFile);
			await mutate;
			onClose();
		} else if (user?.name !== username && username !== '') {
			try {
				await requestUpdateUserName({ username });
				await mutate;
				onClose();
			} catch (error) {
				if (
					isAxiosError(error) &&
					(error as any)?.response?.status === 400
				)
					toast.error(error.response?.data?.message);
				if (
					isAxiosError(error) &&
					(error as any)?.response?.status === 409
				) {
					toast.error('this user name is already taken');
				}
			}
		}
	};
	const validateFile = (file: File | null) => {
		if (file) {
			if (!file.type.startsWith('image/')) {
				setError('Please select an image file');
			} else if (file.size > 1000000) {
				setError('File size is too large');
			} else {
				setSelectedFile(file);
				setError('');
			}
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} isCentered>
			<ModalOverlay className="fixed inset-0  bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center" />
			<ModalContent
				bg={'violet-950'}
				width={'80vh'}
				height={'70dvh'}
				className=" bg-[#150142]  flex items-center justify-center"
			>
				<ModalHeader textColor={'white'}>Edit Profile</ModalHeader>
				<ModalCloseButton />
				<ModalBody className="flex flex-col text-white text-1xl gap-3 font-poppins">
					<div className="flex items-center justify-center">
						<div className="mb-4">
							<label
								htmlFor="imageInput"
								className="cursor-pointer "
							>
								{preview ? (
									<img
										src={preview}
										alt="Preview"
										className="overflow-hidden w-24 ring ring-primary ring-offset-base-100 ring-offset-2 h-24 rounded-full"
									/>
								) : (
									<img
										src={user.avatarUrl}
										alt="Preview"
										className="overflow-hidden w-24 ring ring-primary ring-offset-base-100 ring-offset-2 h-24 rounded-full"
									/>
								)}
							</label>
							<form>
								<input
									type="file"
									accept="image/*"
									onChange={handleFileInput}
									className="hidden"
									id="imageInput"
								/>
							</form>
						</div>
					</div>
					<form>
						<label htmlFor="username">username</label>
						<input
							type="text"
							id="username"
							name="username"
							placeholder="Type here"
							className="input bg-[#2D097F] font-poppins text-white input-bordered w-full max-w-xs"
							value={username}
							onChange={(e) => {
								setUsername(e.target.value);
								setError('');
							}}
						/>
					</form>
					<div className="flex flex-row gap-4">
						<p>Two factor identification</p>
						<Toggle
							toggleValue={toggleValue}
							setShowModal={setShowModal}
							setToggleValue={setToggleValue}
							setQRCode={setQRCode}
						/>
						{showModal && (
							<TwoFaModal
								showModal={showModal}
								setShowModal={setShowModal}
								setToggleValue={setToggleValue}
								qrCode={qrCode}
								setQRCode={setQRCode}
							/>
						)}
					</div>
					<span>{error}</span>
				</ModalBody>
				<ModalFooter>
					<Button colorScheme="blue" mr={3} onClick={onClose}>
						Close
					</Button>
					{/* Change button type to submit */}
					<Button
						colorScheme="orange"
						variant="solid"
						type="submit"
						onClick={handleSubmit}
					>
						Save Changes
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default Setting;
