import { useRef, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import type { Language } from '@/services/types';

interface CodeEditorProps {
  code: string;
  language: Language;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

const LANGUAGE_MAP: Record<Language, string> = {
  javascript: 'javascript',
  python: 'python',
};

export function CodeEditor({ code, language, onChange, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<unknown>(null);

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const handleChange: OnChange = useCallback(
    (value) => {
      if (value !== undefined) {
        onChange(value);
      }
    },
    [onChange]
  );

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-editor-bg">
      <Editor
        height="100%"
        language={LANGUAGE_MAP[language]}
        value={code}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          readOnly,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
      />
    </div>
  );
}
