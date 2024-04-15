import { NavigateFunction } from "react-router-dom";
import { AuthCheck } from "../services/users";
import { ITerminalOptions, ITheme, Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

export const checkAuth = async (navigate: NavigateFunction) => {
    // Check for the cookie sesssion
    const res = await AuthCheck();
    if (!res) {
        navigate("/login");
    }
}

export function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Revert capitalization of strings
export function decapitalize(word: string): string {
    return word.charAt(0).toLowerCase() + word.slice(1);
}

export function LoadTerminal(id : string): Terminal {
    const theme: ITheme = {
        background: '#111827',
    }
    const terminalOptons: ITerminalOptions = {
        theme,
    }
    const term = new Terminal(terminalOptons)
    const fitAddon = new FitAddon()

    fitAddon.activate(term)
    term.loadAddon(fitAddon)
    term.open(document.getElementById(id) as HTMLElement)

    fitAddon.fit()
    return term
}