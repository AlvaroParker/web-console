import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ContainerInfo,
  GetContainerInfo,
  ResizeContainer,
} from "../services/container";
import "./Terminal.css";
import { LoadTerminal, capitalize, checkAuth } from "./util";

export function TerminalComponent({ wsURL }: { wsURL: string }) {
  const params = useParams();
  const [endTerminal] = useState(false);
  const initialized = useRef(false);
  const navigate = useNavigate();
  const [terminalInfo, setTerminalInfo] = React.useState<ContainerInfo | null>(
    null
  );
  const didAuth = useRef(false);
  const fitAddon: React.MutableRefObject<FitAddon | null> = useRef(null);
  const termRef: React.MutableRefObject<Terminal | null> = useRef(null);

  useEffect(() => {
    if (params.containerId !== undefined) {
      GetContainerInfo(params.containerId).then((response) => {
        if (response.type === "Ok") {
          setTerminalInfo(response.value)
        }
      });
    }
  }, []);
  function resizeTerminal(width: number, height: number) {
    // Haven't resized in 100ms!
    if (!params.containerId) {
      return;
    }
    ResizeContainer(width, height, params.containerId).then((response) => {
      if (response.type === "Err") {
        console.log("Error resizing terminal: ", response.error);
        return;
      }
    });
  }

  let doit = 0;
  window.onresize = () => {
    if (fitAddon.current) {
      fitAddon.current.fit();
      if (termRef.current) {
        clearTimeout(doit);
        const { rows, cols } = termRef.current;
        doit = setTimeout(() => resizeTerminal(cols, rows), 1000);
      }
    }
  };

  useEffect(() => {
    if (!didAuth.current) {
      didAuth.current = true;
      checkAuth(navigate);
    }

    document.title = "Web Terminal | Console";
    if (!initialized.current) {
      initialized.current = true;

      LoadTerminal("terminal").then(([term, fit]) => {
        fit.fit();
        const { rows, cols } = term;

        const ws = new WebSocket(
          `ws://${wsURL}/console/ws?hash=${params.containerId}&width=${cols}&height=${rows}&logs=false`
        );
        ws.addEventListener("open", () => {
          ws.send("\n");
        });
        ws.addEventListener("message", (event) => {
          const data = window.atob(event.data);
          term.write(data);
        });
        ws.addEventListener("error", (error) => {
          console.error("WebSocket Error: ", error);
        });
        ws.addEventListener("close", () => {
          // setEndTerminal(true)
          // term.dispose()
          navigate("/");
          // try reconnect
        });
        term.onData((data) => {
          ws.send(data);
        });
        termRef.current = term;
        fitAddon.current = fit;
      });
    }
  }, []);

  return (
    <>
      {!endTerminal && terminalInfo !== null && (
        <div className="text-3xl font-bold mb-5 mt-5">
          {terminalInfo.name} (
          {capitalize(terminalInfo.image) + ":" + terminalInfo.tag})
        </div>
      )}
      {!endTerminal && <div id="terminal" className="h-[75%] mx-5"></div>}
      {endTerminal && (
        <div>
          Terminal sessions has ended. Reload the website to spawn new linux
          instance
        </div>
      )}
    </>
  );
}
