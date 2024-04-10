import { useNavigate } from "react-router-dom"
import { checkAuth } from "./util"

export const NotFound = () => {
    const navigate = useNavigate()
    checkAuth(navigate)
    return (
        <div className="flex flex-grow justify-center items-center h-screen">
            <h1 className="text-4xl">404 - Page Not Found</h1>
        </div>

    )
}