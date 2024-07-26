import Sidebar from './Sidebar';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import LoadingSpinner from './loading';
import { useEffect, useState } from 'react';
import { UseProfiles } from '../types/useUserType';
import { useSearch } from '../hooks/useSearch';
import { useChatStore } from './chat/store';

const SearchResults: React.FC<{ result: UseProfiles; input: string }> = ({
	result,
	input
}) => {
	if (input === '') return <></>;
	if (result.isLoading) return <LoadingSpinner></LoadingSpinner>;
	if (result.error) return <p>Error </p>;
	return (
		<div className=" relativ absolute  -top-3 flex flex-col gap-2 bg-[#693DCE] rounded-lg p-1 z-10">
			{input && result.users.length === 0 ? (
				<div className="bg-[#693DCE] text-white font-poppins justify-center items-center text-xl rounded-lg h-16 flex gap-3 w-[17vw]">
					No results found
				</div>
			) : (
				result.users.map((user) => (
					<Link to={`/profile/${user.id}`} key={user.id}>
						<div
							className="bg-[#693DCE] flex gap-3 w-[17vw]"
							key={user.id}
						>
							<img
								className="rounded-full"
								width={40}
								height={40}
								src={user.avatarUrl}
								alt=""
							/>
							<div className="text-white font-poppins text-lg">
								{user.name}
							</div>
						</div>
					</Link>
				))
			)}
		</div>
	);
};

const Bars: React.FC = () => {
	const [query, setQuery] = useState('');
	const results = useSearch(query);
	const { user, isLoading } = useUser();
	const navigate = useNavigate();
	const { connect, disconnect } = useChatStore();
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	useEffect(() => {
		connect();
		return () => {
			disconnect();
		};
	}, [connect, disconnect]);

	if (isLoading) {
		return <LoadingSpinner></LoadingSpinner>;
	}

	// if (error) {
	//   return <div>Error:</div>;
	// }

	return (
		<div className="bg-[#2D097F] h-screen  w-screen ">
			{/* search bar */}
			<div className=" md:min-w-0 mr-10 items-center flex flex-col justify-center p-4 h-20 w-[70%]  md:flex">
				<div className=" w-30 items-center flex-col gap-[10%] left-50  bg-[#693DCE] border  relative rounded-full border-[#693DCE] ">
					<input
						id="desktop-search"
						type="search"
						value={query}
						onChange={handleChange}
						placeholder="Search"
						className="block w-30 h-10 relative z-10 rounded-full placeholder:text-white border-none outline-0 placeholder-[gray] bg-[#693DCE] font-poppins text-white text-center outline-none"
					/>
					<div className="absolute -bottom-4 left-1/2 transform -translate-x-[160px]">
						<SearchResults result={results} input={query} />
					</div>
				</div>
			</div>
			{/* connected user bar */}
			<div className="fixed  top-0 right-[1%] flex flex-col gap-y-5 w-[30%] text-white p-4 items-center ">
				<div
					className="flex ms-[5.5rem] gap-x-2 text-xl font-poppins cursor-pointer"
					onClick={() => navigate('/me')}
				>
					<p>{user?.name}</p>
					<img
						className="rounded-full"
						width={40}
						height={40}
						src={user?.avatarUrl}
						alt=""
					/>
				</div>
			</div>
			<div className="  h-[85%] w-[85%] object-cover flex items-center">
				<Sidebar />
				<div className="  h-[100%] w-[5%]"></div>
				<Outlet />
			</div>
		</div>
	);
};

export default Bars;
