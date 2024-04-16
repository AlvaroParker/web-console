import './Terminal.css'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadTerminal, capitalize, checkAuth } from './util'
import { ContainerRes, GetContainerInfo, InfoContainerRes } from '../services/container'

export function TerminalComponent({ wsURL }: { wsURL: string }) {
    const params = useParams()
    const [endTerminal, _] = useState(false)
    const initialized = useRef(false)
    const navigate = useNavigate()
    const [terminalInfo, setTerminalInfo] = React.useState<ContainerRes | null>(null)

    useEffect(() => {
        if (params.containerId !== undefined) {
            GetContainerInfo(params.containerId).then(([response, container]) => {
                if (response === InfoContainerRes.OK) {
                    setTerminalInfo(container)
                }
            })
        }
    }, [])


    checkAuth(navigate)
    useEffect(() => {

        document.title = "Web Terminal | Console"
        if (!initialized.current) {
            initialized.current = true


            LoadTerminal("terminal").then(([term, fit]) => {
                fit.fit()
                const { rows, cols } = term

                const ws = new WebSocket(`ws://${wsURL}/console/ws?hash=${params.containerId}&width=${cols}&height=${rows}`)

                ws.addEventListener('open', () => {
                    ws.send('\n')
                })
                ws.addEventListener('message', event => {
                    let data = window.atob(event.data)
                    term.write(data)
                })
                ws.addEventListener('error', (error) => {
                    console.error("WebSocket Error: ", error);
                });
                ws.addEventListener('close', (event) => {
                    // setEndTerminal(true)
                    // term.dispose()
                    console.log("WebSocket closed: ", event);
                    navigate('/')
                    // try reconnect
                });
                term.onData((data, _) => {
                    ws.send(data)
                })
            })

        }
    }, [])

    return (
        <>
            {
                !endTerminal && terminalInfo !== null &&
                <div className="text-3xl font-bold mb-5 mt-5">{terminalInfo.name} ({capitalize(terminalInfo.image) + ":" + terminalInfo.tag})</div>
            }
            {
                !endTerminal &&
                <div id="terminal" className="h-[75%]"></div>
            }
            {
                endTerminal &&
                <div>Terminal sessions has ended. Reload the website to spawn new linux instance</div>
            }
        </>
    )
}