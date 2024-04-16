import { useEffect, useRef, useState } from "react"
import { UserInfoPayload, UserInfo, UserInfoRes, LogoutRes, LogOut } from "../services/users"
import { useNavigate } from "react-router-dom"

export function UserComponent() {
    const [userInfo, setUserInfo] = useState<UserInfoPayload | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const logout = async () => {
        const res = await LogOut()
        switch (res) {
            case LogoutRes.OK:
                navigate("/login")
                // TODO
                break
            case LogoutRes.INTERNAL_SERVER_ERROR:
                navigate("/login")
                // TODO
                break
            case LogoutRes.UNAUTHORIZED:
                // TODO
                break
            case LogoutRes.UNKNOWN:
                navigate("/login")
                // TODO
                break
        }
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === "password") {
            setPassword(e.target.value)
        }
    }

    const didRequest = useRef(false)
    useEffect(() => {
        if (!didRequest.current) {
            didRequest.current = true
            UserInfo().then(([userInfo, res]) => {
                if (res === UserInfoRes.OK) {
                    setUserInfo(userInfo)
                }

            })
        }
    })
    return (
        <>
            <section className="w-[34rem] mx-auto bg-gray-900 rounded-2xl px-8 py-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Regular user</span>
                    <span className="text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" onClick={() => setShowModal(true)}>
                            <circle cx="12" cy="11.9999" r="9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <rect x="12" y="8" width="0.01" height="0.01" stroke-width="3" stroke-linejoin="round" />
                            <path d="M12 12V16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                </div>
                <div className="mt-6 w-fit mx-auto">
                    <img src="/profile.svg" style={{ filter: 'invert(1)' }} className="rounded-full w-28 " alt="profile picture" srcSet="" />
                </div>

                <div className="mt-8 ">
                    <h2 className="text-white font-bold text-2xl tracking-wide">{userInfo?.name}<br /> {userInfo?.lastname}</h2>
                </div>
                <p className="text-emerald-400 font-semibold mt-2.5" >
                    Active
                </p>

                <div className="mt-3 text-white text-sm">
                    <span className="text-gray-400 font-semibold">{userInfo?.email}</span>
                </div>

                <button className="w-full mt-6 bg-emerald-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-500 transition duration-200" onClick={() => {}}>Change password</button>

            </section>

            <div className={showModal ? "" : "hidden" + ` relative z-10`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div className="bg-gray-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <h3 className="text-base font-semibold leading-6 text-gray-100" id="modal-title">Change password</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-300">This will permanently change your password and log you out of all devices. Are you sure you want to continue?</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center justify-center">

                                <button type="button" className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto" onClick={() => { }}>Delete</button>
                                <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900 hover:bg-gray-300 sm:mt-0 sm:w-auto" onClick={() => { setShowModal(false) }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}