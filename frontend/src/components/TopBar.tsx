import React, { useRef } from "react"
import { capitalize } from "./util"

interface Lang {
    name: string
    link: string
    prettyName: string
}

export function TopBar(
    props: {
        setLanguage: (lang: string) => void,
        setContent: (content: string) => void
        handleDownload: () => void,
        handleRunCode: () => void,
        clearScreen: () => void
    }
) {
    const [menuState, setMenuState] = React.useState(" hidden ")
    const languages: Lang[] = [
        { name: 'rust', link: 'https://cdn.svgporn.com/logos/rust.svg', prettyName: 'Rust' },
        { name: 'python', link: 'https://cdn.svgporn.com/logos/python.svg', prettyName: 'Python' },
        { name: 'typescript', link: 'https://cdn.svgporn.com/logos/typescript-icon.svg', prettyName: 'TypeScript' },
        { name: 'c', link: 'https://cdn.svgporn.com/logos/c.svg', prettyName: 'C' },
        { name: 'cpp', link: 'https://cdn.svgporn.com/logos/c-plusplus.svg', prettyName: 'C++' },
        { name: 'go', link: 'https://cdn.svgporn.com/logos/go.svg', prettyName: 'Go' },
    ]
    const [lang, setLangBar] = React.useState(languages[0].name)
    const [langLink, setLangLink] = React.useState(languages[0].link)

    // Handle loose focus on menu
    React.useEffect(() => {
        props.setLanguage(languages[0].name)
        const handleClick = (e: MouseEvent) => {
            const menu = document.getElementById("menu")
            const button = document.getElementById("user-menu-button")
            if ((menu && !menu.contains(e.target as Node)) && (button && !button.contains(e.target as Node))) {
                // Check if we didn't click the button with id user-menu-button
                setMenuState(" hidden ")
            }
        }
        document.addEventListener("click", handleClick)
        return () => {
            document.removeEventListener("click", handleClick)
        }
    }, [])

    const handleClickMenu = () => {
        if (menuState === " hidden ") {
            setMenuState("")
        } else {
            setMenuState(" hidden ")
        }
    }
    const handleLang = (lang: Lang) => {
        props.setLanguage(lang.name)
        setLangBar(lang.prettyName)
        setLangLink(lang.link)
        setMenuState(" hidden ")
    }
    const fileInputRef = useRef(null);

    const handleFileInputClick = () => {
        if (!fileInputRef.current) return;
        const f = fileInputRef.current as HTMLInputElement; // Assert the type of the ref
        f.click()
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTarget = event.target as HTMLInputElement;
        if (!eventTarget.files) return;
        const file = eventTarget.files[0]
        // Get file extension
        const extension = file.name.split('.').pop()
        switch (extension) {
            case 'rs':
                props.setLanguage('rust')
                const lang = languages.find(lang => lang.name === 'rust')
                setLangBar(lang?.prettyName ?? 'Rust')
                setLangLink(lang?.link ?? 'https://cdn.svgporn.com/logos/rust.svg')
                break
            case 'py':
                props.setLanguage('python')
                const lang1 = languages.find(lang => lang.name === 'python')
                setLangBar(lang1?.prettyName ?? 'Python')
                setLangLink(lang1?.link ?? 'https://cdn.svgporn.com/logos/python.svg')
                break
            case 'ts':
                props.setLanguage('typescript')
                const lang2 = languages.find(lang => lang.name === 'typescript')
                setLangBar(lang2?.prettyName ?? 'TypeScript')
                setLangLink(lang2?.link ?? 'https://cdn.svgporn.com/logos/typescript-icon.svg')
                break
            case 'c':
                props.setLanguage('c')
                const lang3 = languages.find(lang => lang.name === 'c')
                setLangBar(lang3?.prettyName ?? 'C')
                setLangLink(lang3?.link ?? 'https://cdn.svgporn.com/logos/c.svg')
                break
            case 'cpp':
                props.setLanguage('cpp')
                const lang4 = languages.find(lang => lang.name === 'cpp')
                setLangBar(lang4?.prettyName ?? 'C++')
                setLangLink(lang4?.link ?? 'https://cdn.svgporn.com/logos/c-plusplus.svg')
                break
            case 'go':
                props.setLanguage('go')
                const lang5 = languages.find(lang => lang.name === 'go')
                setLangBar(lang5?.prettyName ?? 'Go')
                setLangLink(lang5?.link ?? 'https://cdn.svgporn.com/logos/go.svg')
                break
            case 'sh':
                props.setLanguage('bash')
                const lang6 = languages.find(lang => lang.name === 'bash')
                setLangBar(lang6?.prettyName ?? 'Bash')
                setLangLink(lang6?.link ?? 'https://cdn.svgporn.com/logos/bash-icon.svg')
                break

        }
        eventTarget.files[0].text().then((text) => {
            props.setContent(text)
        })
    }


    return (
        <nav className="bg-gray-900 rounded-md mt-2 mb-2 mx-2">
            <div className="mx-auto max-w-[100%] px-5">
                <div className="relative flex h-12 items-center justify-between">
                    <div className="flex flex-1 items-center justify-start sm:items-stretch sm:justify-start">
                        <div className="flex flex-shrink-0 items-center">
                            <img className="h-8 w-auto" src="/icon.svg" alt="Your Company" />
                        </div>
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                <div className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium items-center justify-center" aria-current="page">
                                    <button onClick={() => handleClickMenu()} id="user-menu-button" className="flex items-center">
                                        <img src={langLink} alt="" className="mr-2 h-4 w-4" />
                                        <div>{capitalize(lang)}</div>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-9">
                                            <circle cx="12" cy="12" r="9" stroke="#e5e7eb" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9 11L12 14L15 11" stroke="#e5e7eb" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>

                                    <div id="menu" className={menuState + `absolute left-13 z-10 mt-5 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`} role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}>
                                        {
                                            languages.map((lang, index) => {
                                                return (
                                                    <button key={index} className="flex items-center px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id={`user-menu-item-${index}`} onClick={() => handleLang(lang)}>
                                                        <img src={lang.link} alt="" className="mr-2 h-4 w-4" />
                                                        {lang.prettyName}
                                                    </button>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                <div>
                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    {/* Button that looks like the original <a> tag but triggers file input */}
                                    <button
                                        className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                                        onClick={handleFileInputClick}
                                    >
                                        Upload file
                                    </button>
                                </div>
                                <button onClick={props.handleDownload} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">Download file</button>
                                <button onClick={props.clearScreen} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">Clear screen</button>
                            </div>


                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0" onClick={() => props.handleRunCode()}>
                        <p className="mr-2">Run code</p>
                        <button type="button" className="relative rounded-full bg-gray-800 p-1 text-green-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                <path d="M19 10.2679C20.3333 11.0377 20.3333 12.9623 19 13.7321L10 18.9282C8.66667 19.698 7 18.7358 7 17.1962L7 6.80385C7 5.26425 8.66667 4.302 10 5.0718L19 10.2679Z" strokeWidth="2" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* <div className="sm:hidden" id="mobile-menu"> */}
            {/* <div className="space-y-1 px-2 pb-3 pt-2"> */}
            {/* <a href="#" className="bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium" aria-current="page">Dashboard</a> */}
            {/* <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Team</a> */}
            {/* <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Projects</a> */}
            {/* <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Calendar</a> */}
            {/* </div> */}
            {/* </div> */}
        </nav>
    )
}