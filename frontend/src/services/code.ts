import axios from "axios";

import { API_URL } from "./consts";

export enum RunCodeRes {
    OK = 200,
    NO_CONTENT = 204,
    UNAUTHORIZED = 401,
    INTERNAL_SERVER_ERROR = 500,
    UNKNOWN = 0,
}

const RunCode = async (
    payload: string,
    language: string
): Promise<[string, RunCodeRes]> => {
    try {
        const response = await axios.post(`${API_URL}/code`, {
            code: payload,
            language,
        });
        switch (response.status) {
            case 200:
                return [response.data, RunCodeRes.OK];
            case 204:
                return ["", RunCodeRes.NO_CONTENT];
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            switch (error.response?.status) {
                case 401:
                    return ["", RunCodeRes.UNAUTHORIZED];
                case 500:
                    return ["", RunCodeRes.INTERNAL_SERVER_ERROR];
            }
        }
    }
    return ["", RunCodeRes.UNKNOWN];
};

export { RunCode };
