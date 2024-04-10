import React, { useEffect } from "react"
import { ContainerRes, ListContainers } from "../services/container"
import { useNavigate } from "react-router-dom"
import { checkAuth } from "./util"

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


export function ContainersComponent() {
    const [containers, setContainers] = React.useState<ContainerRes[] | null>(null)
    const navigate = useNavigate()
    checkAuth(navigate)

    useEffect(() => {
        ListContainers().then((res) => {
            if (res) {
                setContainers(res)
            }
        })
    }, [])
    const goToMachine = (containerid: string) => {
        navigate(`/terminal/${containerid}`)
    }

    return (
        <>
            <div className="flex-grow mt-5" >
                <h1 className="text-3xl text-gray-100 font-medium text-center">Available Linux containers</h1>
                <p className="text-gray-300 text-center">Click on the button to access the machine</p>
                {
                    containers?.map((item) =>

                        <div className="max-w-7xl mx-auto my-5" key={item.containerid}>
                            <div className="relative group">
                                <div className="absolute from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative px-7 py-6 bg-gray-900 ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
                                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19H21M3 5L11 12L3 19"></path>
                                    </svg>
                                    <div className="space-y-2">
                                        <h3 className="text-gray-400 text-2xl">{capitalize(item.image)}:{item.tag}</h3>
                                        <button className="block text-green-400 group-hover:text-green-800 transition duration-200" onClick={() => goToMachine(item.containerid)}>Access Machine →</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

            </div>
        </>
    )
}