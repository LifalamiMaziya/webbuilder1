'use client';

import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  file: {
    path: string;
    content: string;
    language: string;
  } | null;
  onChange: (content: string) => void;
}

export default function CodeEditor({ file, onChange }: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      css: 'css',
      scss: 'scss',
      html: 'html',
      md: 'markdown',
      py: 'python',
      yml: 'yaml',
      yaml: 'yaml',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
        <div className="text-center">
          <p className="text-lg">Select a file to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="bg-gray-800 px-4 py-2 text-gray-200 text-sm border-b border-gray-700">
        {file.path}
      </div>
      <Editor
        height="calc(100% - 40px)"
        language={getLanguageFromPath(file.path)}
        value={file.content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}
