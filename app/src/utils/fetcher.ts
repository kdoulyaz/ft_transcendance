import axios from "axios";

const BACKEND_URL = "http://localhost:3080/";
const fetcher = (url: string) =>
  axios
    .get(BACKEND_URL + url, { withCredentials: true })
    .then((res) => res.data);

export default fetcher;
