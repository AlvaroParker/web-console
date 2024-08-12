import axios from "axios";

import { API_URL } from "./consts";
import { fromNumber, Result, ServiceError } from "./error";

const RunCode = async (
    payload: string,
    language: string
): Promise<Result<string, ServiceError>> => {
    try {
        const response = await axios.post(`${API_URL}/code`, {
            code: payload,
            language,
        });
        switch (response.status) {
            case 200:
                return { type: "Ok", value: response.data }
            case 204:
                return { type: "Err", error: ServiceError.NoContent }
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return { type: "Err", error: fromNumber(error.response?.status || 0) }
        }
    }
    return { type: "Err", error: ServiceError.Unknown }
};

export { RunCode };
