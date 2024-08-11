import { FitAddon } from "@xterm/addon-fit";
import { ITerminalOptions, ITheme, Terminal } from "@xterm/xterm";
import FontFaceObserver from "fontfaceobserver";
import { NavigateFunction } from "react-router-dom";

import { AuthCheck } from "../services/users";

export const checkAuth = async (navigate: NavigateFunction) => {
    // Check for the cookie sesssion
    const res = await AuthCheck();
    if (!res) {
        navigate("/login");
    }
};

export function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Revert capitalization of strings
export function decapitalize(word: string): string {
    return word.charAt(0).toLowerCase() + word.slice(1);
}

export async function LoadTerminal(id: string): Promise<[Terminal, FitAddon]> {
    const theme: ITheme = {
        background: "#111827",
    };
    await new FontFaceObserver("JetBrains Mono").load();
    await new FontFaceObserver("JetBrains Mono", { weight: "bold" }).load();

    const terminalOptons: ITerminalOptions = {
        theme,
        fontFamily: "JetBrains Mono",
    };
    const term = new Terminal(terminalOptons);
    const fitAddon = new FitAddon();

    term.loadAddon(fitAddon);
    term.open(document.getElementById(id) as HTMLElement);

    fitAddon.fit();
    return [term, fitAddon];
}
