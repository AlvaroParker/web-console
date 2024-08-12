import axios from "./axios";
import { ContainerInfo } from "./container";
import { Result, ServiceError, fromNumber } from "./error";

const Login = async (
    email: string,
    password: string
): Promise<Result<null, ServiceError>> => {
    try {
        const response = await axios.post(`/login`, {
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
        const response = await axios.post(`/signin`, {
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
        const response = await axios.get(`/auth`);
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
        const response = await axios.post(`/logout`);
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
        const response = await axios.get(`/user/info`);
        if (response.status == 200) {
            return { type: "Ok", value: response.data };
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

export { Login, Signin, AuthCheck, LogOut, UserInfo };
