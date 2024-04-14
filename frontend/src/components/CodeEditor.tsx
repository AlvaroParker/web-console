import { Editor, Monaco } from '@monaco-editor/react';
import monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { LoadTerminal } from './util';
import { TopBar } from './TopBar';

export function CodeEditor() {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const initialized = useRef(false);
    const [lang, setLang] = useState('rust' as string)

    function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, _: Monaco) {
        editorRef.current = editor;
    }

    window.onresize = () => {
        if (editorRef.current) {
            editorRef.current.layout({} as monaco.editor.IDimension);
        }
    };

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            const term = LoadTerminal('terminal')
            const { rows, cols } = term
            console.log(rows, cols)
        }
    }, [])

    return (
        <>
        <TopBar setLanguage={setLang}/>
        <div className="flex flex-row h-screen"> {/* Changed flex-col to flex-row */}
            <Editor
                className="flex-1 mb-5 mx-2"  // Adjust margins as needed
                options={{ automaticLayout: true }}
                defaultLanguage="rust"
                language={lang}
                height="100%"  // Set height to 100% to fill parent vertically
                defaultValue="// Add some code here!"
                theme="vs-dark"
                onMount={handleEditorDidMount}
            />
            <div className="flex-1 mb-5 mx-2 " id='terminal'>
            </div>
        </div>
        </>
    );
}
