import React, { useEffect } from "react"
import { Container, ContainerImageOpt, ContainerImageOptRes, CreateContainer, GetValidImages, NewContainerRes } from "../services/container"
import { useNavigate } from "react-router-dom"
import { capitalize, checkAuth } from "./util"


export function NewContainer() {
    const navigate = useNavigate()
    checkAuth(navigate)
    const [images, setImages] = React.useState<ContainerImageOpt[]>(Array<ContainerImageOpt>())

    const [containerName, setContainerName] = React.useState<string>("")
    const [command, setCommand] = React.useState<string>("/bin/bash")
    const [image, setImage] = React.useState<ContainerImageOpt>(images[0])
    const [networkEnabled, setNetworkEnabled] = React.useState<boolean>(true)
    const [autoremove, setAutoremove] = React.useState<boolean>(false)

    const handleChangeStr = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        e.preventDefault()
        setter(e.target.value)
    }

    const handleChangeBool = (e: React.ChangeEvent<HTMLSelectElement>, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        e.preventDefault()
        setter(e.target.value === "True" ? true : false)
    }

    const handleChangeImage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault()
        const image = images.find((item) => item.image_tag === e.target.value)

        if (image) {
            setCommand(image.commands[0])
            setImage(image)
        }
    }

    useEffect(() => {
        document.title = "Web Terminal | New Container"
        GetValidImages().then(([data, res]) => {
            switch (res) {
                case ContainerImageOptRes.OK:
                    if (data) {
                        setImages(data)
                        setCommand(data[0].commands[0])
                        setImage(data[0])
                    }
                    break;
                default:
                    break
            }
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const image_raw = image?.image_tag.split(":")[0]
        const tag_raw = image?.image_tag.split(":")[1]
        if (!image_raw || !tag_raw || !containerName || !command) {
            alert("Please fill all the fields")
            return
        } else {
            const container: Container = {
                image: image.image_tag.split(":")[0],
                tag: image.image_tag.split(":")[1],
                command: command,
                name: containerName,
                auto_remove: autoremove,
                network_enabled: networkEnabled
            }
            const res = await CreateContainer(container)
            switch (res) {
                case NewContainerRes.CREATED:
                    navigate("/")
                    break;
                case NewContainerRes.BAD_REQUEST:
                    alert("Bad request")
                    break
                case NewContainerRes.UNAUTHORIZED:
                    navigate("/login")
                    break
                case NewContainerRes.FORBIDDEN:
                    // TODO
                    break;
                default:
                    // TODO
                    break;
            }
        }

    }

    return (
        <div className="flex justify-center items-center h-screen">
            <form className="w-full max-w-lg bg-gray-900 rounded-xl p-10" onSubmit={handleSubmit}>
                <h1 className="text-center text-2xl mb-5 font-semibol">Create a new container</h1>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <label className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2" htmlFor="grid-first-name">
                            Container Name
                        </label>
                        <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="grid-first-name" type="text" placeholder="SomeName" required value={containerName} onChange={(e) => handleChangeStr(e, setContainerName)}/>
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2" htmlFor="grid-state">
                        Image:Label
                        </label>
                        <div className="relative">
                            <select className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state" value={command} onChange={(e) => handleChangeStr(e, setCommand)}>
                                {
                                    image?.commands.map((item) => 
                                        <option value={item} key={item}>{capitalize(item)}</option>
                                    )
                                }
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2" htmlFor="grid-state">
                        Image:Label
                        </label>
                        <div className="relative">
                            <select className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state" value={image?.image_tag} onChange={(e) => handleChangeImage(e)}>
                                {
                                    images.map((item) => 
                                        <option value={item.image_tag} key={item.image_tag}>{capitalize(item.image_tag)}</option>
                                    )
                                }
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-2">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <label className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2" htmlFor="grid-state">
                        Network Enabled
                        </label>
                        <div className="relative">
                            <select className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state" value={networkEnabled?"True":"False"} onChange={(e) => handleChangeBool(e, setNetworkEnabled)}>
                                <option value="True">True</option>
                                <option value="False">False</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <label className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2" htmlFor="grid-state">
                        Autoremove
                        </label>
                        <div className="relative">
                            <select className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state" value={autoremove?"True":"False"} onChange={(e) => handleChangeBool(e, setAutoremove)}>
                                <option>True</option>
                                <option>False</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap -mx-3 mb-2">
                    <button className="w-full bg-green-400 hover:bg-green-500 text-white font-bold py-3 rounded focus:outline-none focus:shadow-outline mx-3 mt-10" type="button" onClick={handleSubmit}>
                        Create Container
                    </button>
                </div>
            </form>
        </div>
    )
}