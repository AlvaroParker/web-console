import { Editor } from "@monaco-editor/react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { RunCode } from "../services/code";
import { TopBar } from "./TopBar";
import { LoadTerminal, checkAuth } from "./util";
import { ServiceError } from "../services/error";

export function CodeEditor() {
  const didAuth = useRef(false);
  const navigate = useNavigate();

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const initialized = useRef(false);
  const [lang, setLang] = useState("rust" as string);
  const [content, setContent] = useState("" as string);
  const terminal: React.MutableRefObject<Terminal | null> = useRef(null);
  const fitAddon: React.MutableRefObject<FitAddon | null> = useRef(null);

  function handleEditorDidMount(
    editor: monaco.editor.IStandaloneCodeEditor,
  ) {
    editorRef.current = editor;
  }

  window.onresize = () => {
    if (editorRef.current) {
      editorRef.current.layout({} as monaco.editor.IDimension);
    }
    if (fitAddon.current) {
      fitAddon.current.fit();
    }
  };

  useEffect(() => {
    if (!didAuth.current) {
      didAuth.current = true;
      checkAuth(navigate);
    }
    document.title = "Web Terminal | Code Editor";
    if (!initialized.current) {
      initialized.current = true;
      LoadTerminal("terminal").then(([term, fit]) => {
        terminal.current = term;
        fitAddon.current = fit;
      });
    }
  }, [navigate]);

  const clearScreen = () => {
    terminal.current?.clear();
  };

  const handleRunCode = async () => {
    const RED = "\x1b[31m";
    const RESET = "\x1b[0m";
    const result = await RunCode(content, lang);
    if (result.type === "Ok") {
      // There's data in result
      if (terminal.current) {
        terminal.current.write("\r\n");
        terminal.current.write(result.value);
        terminal.current.write("\r\n");
      }
    } else {
      switch (result.error) {
        case ServiceError.Unauthorized:
          navigate("/login");
          break;
        default:
          if (terminal.current) {
            terminal.current.write("\r\n");
            terminal.current.write(
              `${RED}   Error while running code. Try again later   ${RESET}`
            );
            terminal.current.write("\r\n");
          }
          console.log("Error running code");
          break;

      }
    }
  };

  const handleDownload = () => {
    const file = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    switch (lang) {
      case "rust":
        a.download = "code.rs";
        break;
      case "python":
        a.download = "code.py";
        break;
      case "c":
        a.download = "code.c";
        break;
      case "cpp":
        a.download = "code.cpp";
        break;
      case "go":
        a.download = "code.go";
        break;
      case "bash":
        a.download = "code.sh";
        break;
      case "typescript":
        a.download = "code.ts";
        break;
    }
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <TopBar
          setLanguage={setLang}
          setContent={setContent}
          handleDownload={handleDownload}
          handleRunCode={handleRunCode}
          clearScreen={clearScreen}
        />
        <div className="flex-1 flex h-full mb-10">
          {" "}
          {/* Changed flex-col to flex to make it a row */}
          <div className="flex-1 mx-2 h-full" id="editor-wrapper">
            {" "}
            {/* This div is for the Editor, using flex-1 to take half space */}
            <Editor
              options={{ automaticLayout: true, fontFamily: "JetBrains Mono" }}
              defaultLanguage="rust"
              language={lang}
              height="100%" // Set height to 100% to fill parent vertically
              defaultValue="// Add some code here!"
              theme="vs-dark"
              onMount={(editor) => handleEditorDidMount(editor)}
              onChange={(value) => setContent(value ?? "")}
              value={content}
            />
          </div>
          <div className="flex-1 mx-2 h-full overflow-auto" id="terminal">
            {" "}
            {/* Another flex-1 div for terminal, with some styling */}
            {/* Terminal content here */}
          </div>
        </div>
      </div>
    </>
  );
}
