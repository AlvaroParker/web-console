import axios, { isAxiosError } from "axios";

import { API_URL } from "./consts";
import { Result, ServiceError, fromNumber } from "./error";

axios.defaults.withCredentials = true;

export interface ContainerImageOpt {
    image_tag: string;
    commands: string[];
}

export interface Container {
    image: string;
    tag: string;
    command: string;
    name: string;
    auto_remove: boolean;
    network_enabled: boolean;
}

export interface ContainerInfo {
    containerid: string;
    image: string;
    tag: string;
    name: string;
}

const CreateContainer = async (
    container: Container
): Promise<Result<null, ServiceError>> => {
    try {
        const response = await axios.post(`${API_URL}/container`, container);
        switch (response.status) {
            case 201 || 200:
                return { type: "Ok", value: null };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
            return {
                type: "Err",
                error: fromNumber(error.response?.status || 0),
            };
        }
    }
    return { type: "Err", error: ServiceError.Unknown };
};

const ListContainers = async (): Promise<
    Result<ContainerInfo[], ServiceError>
> => {
    try {
        const response = await axios.get(`${API_URL}/container`);
        switch (response.status) {
            case 200:
                return { type: "Ok", value: response.data };
            case 204:
                return { type: "Err", error: ServiceError.NoContent };
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

const DeleteContainer = async (
    containerId: string
): Promise<Result<null, ServiceError>> => {
    try {
        const response = await axios.delete(
            `${API_URL}/container/${containerId}`
        );
        if (response.status === 200) return { type: "Ok", value: null };
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

const GetContainerInfo = async (
    containerId: string
): Promise<Result<ContainerInfo, ServiceError>> => {
    try {
        const response = await axios.get(
            `${API_URL}/container/info?id=${containerId}`
        );
        switch (response.status) {
            case 200:
                return { type: "Ok", value: response.data };
            case 204:
                return { type: "Err", error: ServiceError.NoContent };
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

const GetValidImages = async (): Promise<
    Result<ContainerImageOpt[], ServiceError>
> => {
    try {
        const response = await axios.get(`${API_URL}/images`);
        switch (response.status) {
            case 200:
                return { type: "Ok", value: response.data };
            case 204:
                return { type: "Err", error: ServiceError.NoContent };
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

const FullStop = async (): Promise<Result<null, ServiceError>> => {
    try {
        const response = await axios.post(`${API_URL}/containers/fullstop`);
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

const ResizeContainer = async (
    width: number,
    height: number,
    id: string
): Promise<Result<null, ServiceError>> => {
    try {
        const response = await axios.get(
            `${API_URL}/container/resize?id=${id}&width=${width}&height=${height}`
        );
        switch (response.status) {
            case 200:
                return { type: "Ok", value: null };
            case 204:
                return { type: "Err", error: ServiceError.NoContent };
        }
    } catch (err) {
        if (isAxiosError(err)) {
            return {
                type: "Err",
                error: fromNumber(err.response?.status || 0),
            };
        }
    }
    return { type: "Err", error: ServiceError.Unknown };
};

export {
    CreateContainer,
    ListContainers,
    DeleteContainer,
    GetContainerInfo,
    GetValidImages,
    FullStop,
    ResizeContainer,
};
