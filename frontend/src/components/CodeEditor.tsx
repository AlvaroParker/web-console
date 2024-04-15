import { Editor, Monaco } from '@monaco-editor/react';
import monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { LoadTerminal, checkAuth } from './util';
import { TopBar } from './TopBar';
import { RunCode, RunCodeRes } from '../services/code';
import { useNavigate } from 'react-router-dom';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

export function CodeEditor() {
    const didAuth = useRef(false)
    const navigate = useNavigate()

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const initialized = useRef(false);
    const [lang, setLang] = useState('rust' as string)
    const [content, setContent] = useState('' as string)
    const terminal: React.MutableRefObject<Terminal |null>= useRef(null)


    function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, _: Monaco) {
        editorRef.current = editor;
    }

    window.onresize = () => {
        if (editorRef.current) {
            editorRef.current.layout({} as monaco.editor.IDimension);
        }
        FitAddon.bind(terminal.current as Terminal)
    };

    useEffect(() => {
        if (!didAuth.current) {
            didAuth.current = true
            checkAuth(navigate)
        }
        document.title = 'Web Terminal | Code Editor';
        if (!initialized.current) {
            initialized.current = true;
            const term = LoadTerminal('terminal')
            terminal.current = term
            const { rows, cols } = term
            console.log(rows, cols)
        }
    }, [])

    const clearScreen = () => {
        terminal.current?.clear()
    }

    const handleRunCode = async () => {
        console.log('Running code...');
        const [data, response] = await RunCode(content, lang)
        switch (response) {
            case RunCodeRes.UNAUTHORIZED:
                navigate('/login')
                break;
            case RunCodeRes.OK:
                terminal.current?.write('\r\n')
                terminal.current?.write(data)
                break
            default:
                console.log('Error running code');
                break
        }
    }

    const handleDownload = () => {
        const file = new Blob([content], {type: 'text/plain'});
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        switch (lang) {
            case 'rust':
                a.download = 'code.rs';
                break;
            case 'python':
                a.download = 'code.py';
                break;
            case 'c':
                a.download = 'code.c';
                break;
            case 'cpp':
                a.download = 'code.cpp';
                break;
            case 'go':
                a.download = 'code.go';
                break;
            case 'bash':
                a.download = 'code.sh';
                break;
            case 'typescript':
                a.download = 'code.ts';
                break;
        }
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
        <TopBar setLanguage={setLang} setContent={setContent} handleDownload={handleDownload} handleRunCode={handleRunCode} clearScreen={clearScreen}/>
        <div className="flex flex-row h-screen"> {/* Changed flex-col to flex-row */}
            <Editor
                className="flex-1 mx-2"  // Adjust margins as needed
                options={{ automaticLayout: true }}
                defaultLanguage="rust"
                language={lang}
                height="90%"  // Set height to 100% to fill parent vertically
                defaultValue="// Add some code here!"
                theme="vs-dark"
                onMount={handleEditorDidMount}
                onChange={(value, _) => setContent(value ?? '')}
                value={content}
            />
            <div className="flex-1 mx-2 h-[90%]" id='terminal'>
            </div>
        </div>
        </>
    );
}
