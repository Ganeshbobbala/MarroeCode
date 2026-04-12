import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Check, AlertCircle, BookOpen, Lightbulb, Code2,
  Sparkles, Terminal, ChevronDown, Bot, GitBranch,
  Trophy, Zap, ShieldCheck, HelpCircle, Layers, Clock, Loader2, Target, Briefcase
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif'
});

const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && chart) {
      const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      ref.current.innerHTML = `<div class="mermaid" id="${uniqueId}">${chart}</div>`;
      try {
        mermaid.contentLoaded();
        mermaid.init(undefined, ref.current.getElementsByClassName('mermaid'));
      } catch (e) {
        console.error("Mermaid error:", e);
      }
    }
  }, [chart]);

  return <div ref={ref} className="flex justify-center p-4 bg-slate-900/80 rounded-xl border border-indigo-500/20 overflow-x-auto my-4 transition-all hover:border-indigo-500/40" />;
};

const API_BASE = import.meta.env.VITE_API_BASEURL || 'http://localhost:8000/api';

const BOILERPLATES = {
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Practice!");\n    }\n}`,
  python: `def main():\n    print("Hello, Practice!")\n\nif __name__ == "__main__":\n    main()`,
  javascript: `console.log("Hello, Practice!");`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, Practice!" << endl;\n    return 0;\n}`,
  c: `#include <stdio.h>\nint main() {\n    printf("Hello, Practice!\\n");\n    return 0;\n}`
};

const Practice = () => {
  const [language, setLanguage] = useState('python');
  const [mode] = useState('standard');
  const [persona, setPersona] = useState('standard');
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complexity] = useState('O(1)');
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [stdin, setStdin] = useState('');

  const [files, setFiles] = useState([
    { id: 1, name: 'Main.py', content: BOILERPLATES.python, language: 'python' }
  ]);
  const [activeFileId, setActiveFileId] = useState(1);
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  useEffect(() => {
    axios.get(`${API_BASE}/practice/concepts`)
      .then(res => {
        setConcepts(res.data);
        if (res.data.length > 0 && !selectedConcept) {
          setSelectedConcept(res.data[0]);
        }
      })
      .catch(err => console.error("Concepts fetch failed", err));
  }, [selectedConcept]);

  useEffect(() => {
    if (!selectedConcept && concepts.length > 0) {
      setSelectedConcept(concepts[0]);
    }
  }, [concepts, selectedConcept]);

  useEffect(() => {
    // Sync language state when active file changes
    if (activeFile) {
      setLanguage(activeFile.language);
      setCode(activeFile.content);
    }
  }, [activeFileId, activeFile]);

  // Update file content when code changes in editor
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newCode } : f));
  };

  const [editingFileId, setEditingFileId] = useState(null);
  const [tempFileName, setTempFileName] = useState("");

  const startRenaming = (file) => {
    setEditingFileId(file.id);
    setTempFileName(file.name);
  };

  const finishRenaming = () => {
    if (tempFileName.trim()) {
      setFiles(prev => prev.map(f => f.id === editingFileId ? { ...f, name: tempFileName.trim() } : f));
    }
    setEditingFileId(null);
  };

  const addFile = () => {
    const newId = Math.max(...files.map(f => f.id), 0) + 1;
    const extensions = { python: 'py', java: 'java', javascript: 'js', cpp: 'cpp', c: 'c' };
    const ext = extensions[language] || 'txt';
    const newFile = {
      id: newId,
      name: `Untitled_${newId}.${ext}`,
      content: BOILERPLATES[language] || "",
      language: language
    };
    setFiles([...files, newFile]);
    setActiveFileId(newId);
    // Auto-start renaming for new files
    setTimeout(() => startRenaming(newFile), 100);
  };

  const deleteFile = (id) => {
    if (files.length <= 1) return;
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) setActiveFileId(newFiles[0].id);
  };

  const runCode = async () => {
    setIsSubmitting(true);
    setEvalResult(null);
    try {
      const res = await axios.post(`${API_BASE}/run`, {
        code: activeFile.content,
        language: activeFile.language.toLowerCase(),
        stdin
      });
      setOutput(res.data);

      const evalRes = await axios.post(`${API_BASE}/practice/evaluate`, {
        code: activeFile.content,
        language: activeFile.language.toLowerCase(),
        mode, persona, stdin,
        concept_id: selectedConcept?.id
      });
      setEvalResult(evalRes.data);
    } catch (err) {
      setOutput({ stderr: "Execution Error: " + (err.response?.data?.detail || "Network Failure") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-120px)] animate-in fade-in duration-700 pb-10 lg:pb-0 overflow-visible lg:overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: Explorer + Mentor */}
      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0 h-auto lg:h-full">
        
        {/* Explorer */}
        <div className="h-[280px] bg-surface/30 border border-white/5 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md border-r border-indigo-500/10">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Layers size={14} className="text-primary" /> Explorer
            </div>
            <button
              onClick={addFile}
              className="p-1.5 hover:bg-white/10 rounded-lg text-primary transition-all hover:scale-110 active:scale-95"
              title="Create New File"
            >
              <Zap size={14} fill="currentColor" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {files.map(file => (
              <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all border ${activeFileId === file.id
                    ? 'bg-primary/20 border-primary/30 text-white shadow-lg'
                    : 'hover:bg-white/5 text-slate-400 border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${file.language === 'python' ? 'bg-amber-400 shadow-amber-400/20' :
                      file.language === 'java' ? 'bg-rose-400 shadow-rose-400/20' :
                        'bg-blue-400 shadow-blue-400/20'
                    }`} />

                  {editingFileId === file.id ? (
                    <input
                      autoFocus
                      value={tempFileName}
                      onChange={e => setTempFileName(e.target.value)}
                      onBlur={finishRenaming}
                      onKeyDown={e => e.key === 'Enter' && finishRenaming()}
                      className="bg-slate-900 border border-primary/30 outline-none text-[11px] font-bold text-white px-2 py-0.5 rounded w-full shadow-inner"
                    />
                  ) : (
                    <span className="text-[11px] font-medium truncate">{file.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); startRenaming(file); }}
                    className="hover:text-primary transition-colors p-1"
                    title="Rename"
                  >
                    <Lightbulb size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                    className="hover:text-rose-400 transition-colors p-1"
                    title="Delete"
                  >
                    <AlertCircle size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Mentor Results */}
          <div className="flex-1 bg-surface/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm min-h-0">
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-white tracking-tight">AI Insights</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar text-[12px] scroll-smooth">
              {/* Mission Header */}
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-3 backdrop-blur-sm relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles size={32} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-indigo-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-white">
                    Universal Logic Mission
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-bold">
                  Goal: {code.toLowerCase().includes('even') ? "Mastering Even/Odd Logic." : 
                        code.toLowerCase().includes('age') ? "Mastering Eligibility Gates." : 
                        "Perfecting Custom Logic Architecture."}
                </p>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  The AI is currently analyzing your specific snippet for theoretical depth and real-world application.
                </p>
              </div>

              {!evalResult && !isSubmitting && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 gap-3 opacity-30">
                  <HelpCircle size={30} className="text-indigo-500" />
                  <p className="text-slate-500 text-[10px]">Submit code to unlock mentor analytics.</p>
                </div>
              )}

              {evalResult && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                  {/* Status Banner */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${evalResult.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100' : 'bg-rose-500/5 border-rose-500/20 text-rose-100'}`}>
                    <p className="leading-relaxed font-semibold text-[11px]">{evalResult.message}</p>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${evalResult.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {evalResult.status}
                    </span>
                  </div>

                  {/* Real-World Application */}
                  {evalResult.explanations?.real_world_use_case && (
                    <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl relative overflow-hidden group">
                      <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold uppercase text-[9px] tracking-widest">
                        <Briefcase size={12} /> Real-World Application
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed italic">{evalResult.explanations.real_world_use_case}</p>
                    </div>
                  )}

                  {/* Alternative Methodology */}
                  {evalResult.alternative && (
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-2xl relative overflow-hidden group">
                      <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold uppercase text-[9px] tracking-widest">
                        <Lightbulb size={12} /> Alternative Methodology
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{evalResult.alternative}</p>
                    </div>
                  )}

                  {/* Mistakes/Issues */}
                  {evalResult.mistakes && evalResult.mistakes.length > 0 && (
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-rose-400 font-bold uppercase text-[9px] tracking-widest px-1">
                        <AlertCircle size={12} /> Detected Issues
                      </div>
                      <div className="space-y-1.5">
                        {evalResult.mistakes.map((mistake, i) => (
                          <div key={i} className="flex gap-2 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 opacity-50" />
                            <p className="text-slate-400 text-[11px] leading-tight">{mistake}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trace Analysis */}
                  {evalResult.explanations?.line_by_line && evalResult.explanations.line_by_line.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[9px] tracking-widest px-1">
                        <Layers size={12} /> Trace Analysis
                      </div>
                      <div className="space-y-1.5 px-0.5">
                        {evalResult.explanations.line_by_line.map((step, i) => (
                          <div key={i} className="flex gap-3 items-center bg-slate-950/40 p-2 rounded-xl border border-white/5 group hover:bg-slate-900/60 transition-colors">
                            <span className="text-[10px] font-mono text-slate-700 font-black min-w-[12px] text-center select-none group-hover:text-primary transition-colors">
                              {i + 1}
                            </span>
                            <p className="text-slate-300 text-[11px] font-medium leading-none tracking-tight">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagram */}
                  {evalResult.explanations?.diagram && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold uppercase text-[9px] tracking-widest px-1">
                        <GitBranch size={12} /> Logic Flow-Chart
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <Mermaid chart={evalResult.explanations.diagram} />
                      </div>
                    </div>
                  )}

                  {/* Theory */}
                  {evalResult.explanations?.theoretical_concepts && evalResult.explanations.theoretical_concepts.length > 0 && (
                    <div className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2 text-slate-100 font-bold uppercase text-[9px] tracking-widest">
                        <Target size={12} /> Core Theory
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {evalResult.explanations.theoretical_concepts.map((concept, i) => (
                          <span key={i} className="bg-slate-800/80 border border-white/10 px-2 py-0.5 rounded text-[10px] text-slate-300">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* 2. MAIN: Editor & Console */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-auto lg:h-full">
        
        {/* Top bar for Editor */}
        <div className="bg-surface/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between backdrop-blur-sm px-5">
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-lg px-3 py-1.5 focus-within:ring-1 ring-primary transition-all">
              <Code2 size={16} className="text-primary" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-slate-200 outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="python" className="bg-slate-900 text-white">Python</option>
                <option value="java" className="bg-slate-900 text-white">Java</option>
                <option value="javascript" className="bg-slate-900 text-white">JS</option>
                <option value="cpp" className="bg-slate-900 text-white">C++</option>
                <option value="c" className="bg-slate-900 text-white">C</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-lg px-3 py-1.5 focus-within:ring-1 ring-primary transition-all">
              <Bot size={16} className="text-rose-400" />
              <select
                value={persona}
                onChange={e => setPersona(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-slate-200 outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="standard" className="bg-slate-900 text-white">Standard AI</option>
                <option value="linus" className="bg-slate-900 text-white">Linus Mode</option>
                <option value="zen" className="bg-slate-900 text-white">Zen Master</option>
                <option value="startup" className="bg-slate-900 text-white">Startup Bro</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">Est. Efficiency</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{complexity}</span>
            </div>
            <button
              onClick={runCode}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primaryHover disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
              Submit
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-[#1e1e1e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative group min-h-[450px] lg:min-h-0">
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <span className="bg-indigo-600/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black border border-white/20 uppercase tracking-widest text-white flex items-center gap-1 shadow-lg">
              <Zap size={10} fill="currentColor" /> {language.toUpperCase()} ENGINE ACTIVE
            </span>
          </div>
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            loading={<div className="flex items-center justify-center h-full text-indigo-400 animate-pulse font-bold tracking-widest text-xs">INITIALIZING ENGINE...</div>}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 20 },
              fontFamily: 'JetBrains Mono, monospace',
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible'
              }
            }}
          />
        </div>

        {/* Console / Stdin */}
        <div className="h-auto lg:h-72 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 mb-4 lg:mb-0">
          <div className="bg-black/40 border border-white/5 rounded-2xl flex flex-col backdrop-blur-sm group/stdin">
            <div className="p-3 border-b border-white/5 flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2 text-slate-500"><Terminal size={14} /> Input Stream</div>

              {/* Dynamic Prompt Detector */}
              {(() => {
                const promptMatch = code.match(/input\s*\(\s*["'](.*?)["']\s*\)/);
                if (promptMatch && promptMatch[1]) {
                  return (
                    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 animate-in zoom-in duration-300">
                      <Target size={12} className="animate-pulse" />
                      <span className="truncate max-w-[200px]">{promptMatch[1]}</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            {(() => {
              const promptMatch = code.match(/input\s*\(\s*["'](.*?)["']\s*\)/);
              const placeholderText = (promptMatch && promptMatch[1]) || "Feed data to stdin...";

              return (
                <textarea
                  className="flex-1 bg-transparent p-4 text-xs font-mono text-amber-200 outline-none resize-none placeholder-slate-700"
                  placeholder={placeholderText}
                  value={stdin}
                  onChange={e => setStdin(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isSubmitting) runCode();
                    }
                  }}
                />
              );
            })()}
          </div>
          <div className="bg-black/60 border border-white/5 rounded-2xl flex flex-col backdrop-blur-sm">
            <div className="p-3 border-b border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-2">< Zap size={14} className="text-amber-500" /> Output</div>
              {output && (
                <span className={`px-2 py-0.5 rounded ${output.exit_code === 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                  EXIT {output.exit_code}
                </span>
              )}
            </div>
            <div className="flex-1 p-4 text-xs font-mono overflow-y-auto whitespace-pre-wrap">
              {isSubmitting && <div className="text-indigo-400 animate-pulse">Processing submission...</div>}
              {output?.stdout && <div className="text-slate-300">{output.stdout}</div>}
              {output?.stderr && <div className="text-rose-400/90">{output.stderr}</div>}
              {!output && !isSubmitting && <div className="text-slate-700 font-italic text-[11px]">System idle. Awaiting compilation.</div>}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.3); }
        .custom-scrollbar { scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
        * { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default Practice;
