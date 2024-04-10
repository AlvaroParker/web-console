import axios from "axios";
import { API_URL } from "./consts";

axios.defaults.withCredentials = true

export interface Container {
    image: string;
    tag: string
}

export interface ContainerRes {
    containerid: string;
    image: string;
    tag: string;
}

enum DeleteRes {
    OK = 200,
    NOT_FOUND = 404,
    ERROR = 500
}


const NewContainer = async (container: Container): Promise<boolean> => {
    try {
        const response = await axios.post(`${API_URL}/container`, container)
        if (response.status === 201 || response.status === 200) {
            return true
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message)
        }
    }
    return false
}



const ListContainers = async (): Promise<ContainerRes[] | null> => {
    try {
        const response = await axios.get(`${API_URL}/container`)
        if (response.status === 200 || response.status === 201) {
            return response.data
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message)
        }
    }
    return null
}

const DeleteContainer = async(containerId: string): Promise<DeleteRes> => {
    try {
        const response = await axios.delete(`${API_URL}/container/${containerId}`)
        if (response.status == 200) {
            return DeleteRes.OK
        } else if (response.status == 404) {
            return DeleteRes.NOT_FOUND
        } 
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message)
        }
    } 
    return DeleteRes.ERROR
}

export {
    NewContainer,
    ListContainers,
    DeleteContainer,
    DeleteRes
}