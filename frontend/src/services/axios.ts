import axios from "axios";

export const API_ADDRESS = "127.0.0.1:8080";
export const API_URL = `http://${API_ADDRESS}`;

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export default axios;
