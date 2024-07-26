import axios from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { apiUrl } from '../interfaces';
import { User } from '../../types/user';
import { isAxiosError } from 'axios';
import { toast } from 'react-hot-toast';

const fetchUser = () => {
	return axios
		.get<User>(`${apiUrl}auth/islogged`, {
			withCredentials: true
		})
		.then((response) => response.data)
		.catch((error) => {
			if (isAxiosError(error)) toast.error(error.response?.data?.message);
		});
};

function useCheckIsLoggedIn(): UseQueryResult<User> {
	return useQuery('checkIsLoggedIn', fetchUser);
}

export default useCheckIsLoggedIn;
