import { ITerminalOptions, ITheme, Terminal } from '@xterm/xterm'
import './Terminal.css'
import { FitAddon } from '@xterm/addon-fit'
import { useEffect, useRef, useState } from 'react'

export function TerminalComponent({ wsURL }: { wsURL: string }) {
    const [endTerminal, setEndTerminal] = useState(false)
    const initialized = useRef(false)
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true

        console.log("Terminal component mounted")

        const theme: ITheme = {
            background: '#111827'
        }
        const terminalOptons: ITerminalOptions = {
            theme
        }
        const term = new Terminal(terminalOptons)
        const fitAddon = new FitAddon()

        term.loadAddon(fitAddon)
        term.open(document.getElementById("terminal") as HTMLElement)

        fitAddon.fit()
        const { rows, cols } = term
        const ws = new WebSocket("ws://xdd")

        ws.addEventListener('open', () => {
            console.log("Web-console socket opened")
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
            // try reconnect
        });

        term.onData((data, _) => {
            ws.send(data)
        })
        console.log(rows, cols)
        }
    }, [])

    return (
        <>
            {
                !endTerminal &&
                <>
                    <div className="text-3xl font-bold mb-5 mt-5">Ubuntu 22.04</div>
                    <div id="terminal" className="h-[75%]"></div>
                </>
            }
            {
                endTerminal &&
                <div>Terminal sessions has ended. Reload the website to spawn new linux instance</div>
            }
        </>
    )
}