import axios from "axios";
import { API_URL } from "./consts";

axios.defaults.withCredentials = true

export interface Container {
    image: string;
    tag: string;
    command: string;
    name: string;
    auto_remove: boolean;
    network_enabled: boolean;
}

export interface ContainerRes {
    containerid: string;
    image: string;
    tag: string;
    name: string;
}

export enum DeleteContainerRes {
    OK = 200,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    UNKNOWN = 0
}

export enum NewContainerRes {
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    INTERNAL_SERVER_ERROR = 500,
    UNKOWN = 0
}

export enum ListContainersRes {
    OK = 200,
    NO_CONTENT = 204,
    UNAUTHORIZED = 401,
    INTERNAL_SERVER_ERROR = 500,
    UNKNOWN = 0
}

export enum InfoContainerRes {
    OK = 200,
    NO_CONTENT = 204,
    UNAUTHORIZED = 401,
    INTERNAL_SERVER_ERROR = 500,
    UNKNOWN = 0
}


const CreateContainer = async (container: Container): Promise<NewContainerRes> => {
    try {
        const response = await axios.post(`${API_URL}/container`, container)
        switch (response.status) {
            case 201 || 200:
                return NewContainerRes.CREATED
            case 400:
                return NewContainerRes.BAD_REQUEST
            case 401:
                return NewContainerRes.UNAUTHORIZED
            case 403:
                return NewContainerRes.FORBIDDEN
            case 500:
                return NewContainerRes.INTERNAL_SERVER_ERROR
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message)
            switch (error.response?.status) {
                case 400:
                    return NewContainerRes.BAD_REQUEST
                case 401:
                    return NewContainerRes.UNAUTHORIZED
                case 403:
                    return NewContainerRes.FORBIDDEN
                case 500:
                    return NewContainerRes.INTERNAL_SERVER_ERROR
            }
        }
    }
    return NewContainerRes.UNKOWN
}



const ListContainers = async (): Promise<[ContainerRes[] | null, ListContainersRes]> => {
    try {
        const response = await axios.get(`${API_URL}/container`)
        switch (response.status) {
            case 200:
                return [response.data, ListContainersRes.OK]
            case 204:
                return [null, ListContainersRes.NO_CONTENT]
            case 401:
                return [null, ListContainersRes.UNAUTHORIZED]
            case 500:
                return [null, ListContainersRes.INTERNAL_SERVER_ERROR]
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            switch (error.response?.status) {
                case 401:
                    return [null, ListContainersRes.UNAUTHORIZED]
                case 500:
                    return [null, ListContainersRes.INTERNAL_SERVER_ERROR]
            }
        }
    }
    return [null, ListContainersRes.UNKNOWN]
}

const DeleteContainer = async(containerId: string): Promise<DeleteContainerRes> => {
    try {
        const response = await axios.delete(`${API_URL}/container/${containerId}`)
        switch (response.status) {
            case 200:
                return DeleteContainerRes.OK
            case 401:
                return DeleteContainerRes.UNAUTHORIZED
            case 404:
                return DeleteContainerRes.NOT_FOUND
            case 500:
                return DeleteContainerRes.INTERNAL_SERVER_ERROR
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            switch (error.status) {
                case 401:
                    return DeleteContainerRes.UNAUTHORIZED
                case 404:
                    return DeleteContainerRes.NOT_FOUND
                case 500:
                    return DeleteContainerRes.INTERNAL_SERVER_ERROR
            }
            console.log(error.message)
        }
    } 
    return DeleteContainerRes.UNKNOWN
}

const GetContainerInfo = async(containerId: string): Promise<[InfoContainerRes, ContainerRes | null]> => {
    try {
        const response = await axios.get(`${API_URL}/container/info?id=${containerId}`)
        switch (response.status) {
            case 200:
                return [InfoContainerRes.OK, response.data]
            case 204:
                return [InfoContainerRes.NO_CONTENT, null]
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            switch (error.response?.status) {
                case 401:
                    return [InfoContainerRes.UNAUTHORIZED, null]
                case 500:
                    return [InfoContainerRes.INTERNAL_SERVER_ERROR, null]
            }
        }
    }
    return [InfoContainerRes.UNKNOWN, null]
}

export {
    CreateContainer,
    ListContainers,
    DeleteContainer,
    GetContainerInfo
}