import axios, { isAxiosError } from "axios";

import { API_URL } from "./consts";
import { ContainerRes } from "./container";

// axios allow CORS by default
axios.defaults.withCredentials = true;

const Login = async (
    email: string,
    password: string
): Promise<Boolean | Error> => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });

        if (response.status === 200) {
            return true;
        }
        return false;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
        }
    }
    return false;
};

const Signin = async (
    email: string,
    password: string,
    name: string,
    lastname: string
): Promise<Boolean> => {
    try {
        const response = await axios.post(`${API_URL}/signin`, {
            email,
            password,
            name,
            lastname,
        });

        if (response.status === 201 || response.status === 200) {
            return true;
        }
        return false;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
        }
    }
    return false;
};

const AuthCheck = async (): Promise<Boolean> => {
    try {
        const response = await axios.get(`${API_URL}/auth`);
        if (response.status === 200) {
            return true;
        }
        return false;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
        }
    }
    return false;
};

export enum LogoutRes {
    OK = 200,
    INTERNAL_SERVER_ERROR = 500,
    UNAUTHORIZED = 401,
    UNKNOWN = 0,
}

const LogOut = async (): Promise<LogoutRes> => {
    try {
        const response = await axios.post(`${API_URL}/logout`);
        switch (response.status) {
            case 200:
                return LogoutRes.OK;
            case 500:
                return LogoutRes.INTERNAL_SERVER_ERROR;
            case 401:
                return LogoutRes.UNAUTHORIZED;
            default:
                return LogoutRes.UNKNOWN;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            switch (error.response?.status) {
                case 500:
                    return LogoutRes.INTERNAL_SERVER_ERROR;
                case 401:
                    return LogoutRes.UNAUTHORIZED;
                default:
                    return LogoutRes.UNKNOWN;
            }
        }
    }
    return LogoutRes.UNKNOWN;
};

export interface UserInfoPayload {
    name: string;
    lastname: string;
    email: string;
    active_containers: number;
    running_containers: Array<ContainerRes>;
}

export enum UserInfoRes {
    OK = 200,
    INTERNAL_SERVER_ERROR = 500,
    UNAUTHORIZED = 401,
    UNKNOWN = 0,
}

const UserInfo = async (): Promise<[UserInfoPayload | null, UserInfoRes]> => {
    try {
        const response = await axios.get(`${API_URL}/user/info`);
        switch (response.status) {
            case 200:
                return [response.data, UserInfoRes.OK];
            case 500:
                return [null, UserInfoRes.INTERNAL_SERVER_ERROR];
            case 401:
                return [null, UserInfoRes.UNAUTHORIZED];
            default:
                return [null, UserInfoRes.UNKNOWN];
        }
    } catch (error) {
        if (isAxiosError(error)) {
            console.log(error.message);
            switch (error.response?.status) {
                case 500:
                    return [null, UserInfoRes.INTERNAL_SERVER_ERROR];
                case 401:
                    return [null, UserInfoRes.UNAUTHORIZED];
                default:
                    return [null, UserInfoRes.UNKNOWN];
            }
        }
    }
    return [null, UserInfoRes.UNKNOWN];
};

export { Login, Signin, AuthCheck, LogOut, UserInfo };
