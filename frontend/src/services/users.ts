import axios, { isAxiosError } from "axios";

import { API_URL } from "./consts";
import { ContainerInfo } from "./container";
import { Result, ServiceError, fromNumber } from "./error";

// axios allow CORS by default
axios.defaults.withCredentials = true;

const Login = async (
    email: string,
    password: string
): Promise<Result<null, ServiceError>> => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });

        if (response.status === 200) {
            return { type: "Ok", value: null };
        }
        return { type: "Err", error: ServiceError.Unknown };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                type: "Err",
                error: fromNumber(error.response?.status || 0),
            };
        }
    }
    return { type: "Err", error: ServiceError.Unknown };
};

const Signin = async (
    email: string,
    password: string,
    name: string,
    lastname: string
): Promise<Result<null, ServiceError>> => {
    try {
        const response = await axios.post(`${API_URL}/signin`, {
            email,
            password,
            name,
            lastname,
        });
        if (response.status === 201 || response.status === 200) {
            return { type: "Ok", value: null };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                type: "Err",
                error: fromNumber(error.response?.status || 0),
            };
        }
    }
    return { type: "Err", error: ServiceError.Unknown };
};

const AuthCheck = async (): Promise<Result<null, ServiceError>> => {
    try {
        const response = await axios.get(`${API_URL}/auth`);
        if (response.status === 200) {
            return { type: "Ok", value: null };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                type: "Err",
                error: fromNumber(error.response?.status || 0),
            };
        }
    }
    return { type: "Err", error: ServiceError.Unknown };
};

const LogOut = async (): Promise<Result<null, ServiceError>> => {
    try {
        const response = await axios.post(`${API_URL}/logout`);
        if (response.status == 200) {
            return { type: "Ok", value: null };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                type: "Err",
                error: fromNumber(error.response?.status || 0),
            };
        }
    }
    return { type: "Err", error: ServiceError.Unknown };
};

export interface UserInfoPayload {
    name: string;
    lastname: string;
    email: string;
    active_containers: number;
    running_containers: Array<ContainerInfo>;
}

const UserInfo = async (): Promise<Result<UserInfoPayload, ServiceError>> => {
    try {
        const response = await axios.get(`${API_URL}/user/info`);
        if (response.status == 200) {
            return { type: "Ok", value: response.data };
        }
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                type: "Err",
                error: fromNumber(error.response?.status || 0),
            };
        }
    }
    return { type: "Err", error: ServiceError.Unknown };
};

export { Login, Signin, AuthCheck, LogOut, UserInfo };
