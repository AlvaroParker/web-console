import { NavigateFunction } from "react-router-dom";
import { AuthCheck } from "../services/users";

export const checkAuth = async (navigate: NavigateFunction) => {
    // Check for the cookie sesssion
    const res = await AuthCheck();
    if (!res) {
        navigate("/login");
    }
}