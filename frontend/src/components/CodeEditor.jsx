import React from 'react';
import Editor from '@monaco-editor/react';

const CodeInputEditor = ({ code, setCode, language }) => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/5 relative group">
      <div className="absolute top-2 right-4 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
        <span className="text-xs bg-surface px-2 py-1 rounded-md border border-white/10 uppercase font-mono tracking-widest text-primary">
          {language}
        </span>
      </div>
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={(value) => setCode(value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Fira Code',
          padding: { top: 16, bottom: 16 },
          roundedSelection: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on"
        }}
      />
    </div>
  );
};

export default CodeInputEditor;
