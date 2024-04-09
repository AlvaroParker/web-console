export function Sidebar() {
    return (
        <>
            <div className="flex flex-col items-center w-16 h-full overflow-hidden text-gray-400 bg-gray-900">
                <a className="flex items-center justify-center mt-3" href="#">
                    <svg className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" fill="currentColor">
                        <path d="M30.34,24.73a.77.77,0,0,1-.19-.79A2.75,2.75,0,0,0,27,20.38a16,16,0,0,0-3.48-8.62c-1.12-1.61-1.8-2.63-1.53-3.44A6.55,6.55,0,0,0,21,2.53,6,6,0,0,0,16,0a6,6,0,0,0-5,2.53,6.55,6.55,0,0,0-.94,5.79c.27.81-.4,1.83-1.53,3.44A16,16,0,0,0,5,20.38a2.75,2.75,0,0,0-3.19,3.56.77.77,0,0,1-.19.79l-.35.35a2.75,2.75,0,0,0-.76,2.45,2.79,2.79,0,0,0,1.57,2l4.63,2.1a4.79,4.79,0,0,0,2,.43A5,5,0,0,0,9.66,32a4.82,4.82,0,0,0,1.71-.72A14.11,14.11,0,0,0,16,32a14.06,14.06,0,0,0,4.63-.72,4.82,4.82,0,0,0,1.71.72,5,5,0,0,0,.94.09,4.79,4.79,0,0,0,2-.43l4.63-2.1a2.82,2.82,0,0,0,1.58-2,2.78,2.78,0,0,0-.77-2.45ZM12.61,3.7A4.06,4.06,0,0,1,16,2a4,4,0,0,1,3.39,1.7,4.53,4.53,0,0,1,.66,4,3.4,3.4,0,0,0-.15.92,1.23,1.23,0,0,0-.19-.31A5.32,5.32,0,0,0,16,7a5.35,5.35,0,0,0-3.71,1.29,1.23,1.23,0,0,0-.19.31A3.4,3.4,0,0,0,12,7.68,4.56,4.56,0,0,1,12.61,3.7ZM17,9.11,16,9.8l-1-.68A5.24,5.24,0,0,1,17,9.11ZM9.27,30a2.73,2.73,0,0,1-1.69-.19L3,27.74a.77.77,0,0,1-.22-1.25l.35-.35a2.77,2.77,0,0,0,.67-2.83.75.75,0,0,1,.18-.79.78.78,0,0,1,.54-.23.81.81,0,0,1,.25,0,2.78,2.78,0,0,0,1.28.1h.06l.31-.07.07,0a2.63,2.63,0,0,0,1.11-.66l.35-.35a.77.77,0,0,1,.69-.21.78.78,0,0,1,.56.44l2.1,4.62a2.84,2.84,0,0,1,.2,1.7A2.77,2.77,0,0,1,9.27,30Zm3.62-.38a4.81,4.81,0,0,0,.52-1.4,4.69,4.69,0,0,0-.34-2.91L11,20.71a2.74,2.74,0,0,0-3.84-1.27,15.07,15.07,0,0,1,3-6.53,9.8,9.8,0,0,0,1.9-3.65.92.92,0,0,0,.39.57l3,2A1,1,0,0,0,16,12a1,1,0,0,0,.56-.17l3-2a.94.94,0,0,0,.38-.57,9.8,9.8,0,0,0,1.9,3.65,15.07,15.07,0,0,1,3,6.53,2.76,2.76,0,0,0-1.81-.31,2.81,2.81,0,0,0-2,1.58l-2.1,4.63a4.74,4.74,0,0,0,.18,4.31,14,14,0,0,1-6.22,0Zm16.16-1.91-4.63,2.1a2.72,2.72,0,0,1-1.69.19,2.77,2.77,0,0,1-2.18-2.17,2.84,2.84,0,0,1,.2-1.7l2.1-4.62a.78.78,0,0,1,.56-.44h.15a.79.79,0,0,1,.54.22l.35.35a2.69,2.69,0,0,0,1.11.66l.07,0,.31.07h0a2.58,2.58,0,0,0,1.29-.09.78.78,0,0,1,1,1,2.75,2.75,0,0,0,.66,2.83l.35.35a.75.75,0,0,1,.22.68A.78.78,0,0,1,29.05,27.74Z" />
                    </svg>
                </a>
                <div className="flex flex-col items-center mt-3 border-t border-gray-700">
                    <a className="flex items-center justify-center w-12 h-12 mt-2 text-gray-200 bg-gray-700 rounded" href="#">
                        <svg className="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 19H21M3 5L11 12L3 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <a className="flex items-center justify-center w-12 h-12 mt-2 rounded hover:bg-gray-700 hover:text-gray-300" href="#">
                        <svg className="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </a>
                    <a className="flex items-center justify-center w-12 h-12 mt-2 rounded hover:bg-gray-700 hover:text-gray-300" href="#">
                        <svg className="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </a>
                    <a className="flex items-center justify-center w-12 h-12 mt-2 rounded hover:bg-gray-700 hover:text-gray-300" href="#">
                        <svg className="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                    </a>
                </div>
                <div className="flex flex-col items-center mt-2 border-t border-gray-700">
                    <a className="flex items-center justify-center w-12 h-12 mt-2 rounded hover:bg-gray-700 hover:text-gray-300" href="#">
                        <svg className="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </a>
                    <a className="flex items-center justify-center w-12 h-12 mt-2 rounded hover:bg-gray-700 hover:text-gray-300" href="#">
                        <svg className="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </a>
                    <a className="relative flex items-center justify-center w-12 h-12 mt-2 rounded hover:bg-gray-700 hover:text-gray-300" href="#">
                        <svg className="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span className="absolute top-0 left-0 w-2 h-2 mt-2 ml-2 bg-indigo-500 rounded-full"></span>
                    </a>
                </div>
                <a className="flex items-center justify-center w-16 h-16 mt-auto bg-gray-900 hover:bg-gray-700 hover:text-gray-300" href="#">
                    <svg className="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </a>
            </div>
        </>
    )
}