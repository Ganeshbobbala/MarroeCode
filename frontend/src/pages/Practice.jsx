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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const BOILERPLATES = {
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Practice!");\n    }\n}`,
  python: `def main():\n    print("Hello, Practice!")\n\nif __name__ == "__main__":\n    main()`,
  javascript: `console.log("Hello, Practice!");`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, Practice!" << endl;\n    return 0;\n}`
};

const Practice = () => {
  const [language, setLanguage] = useState('python');
  const [mode, setMode] = useState('standard');
  const [persona, setPersona] = useState('standard');
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complexity, setComplexity] = useState('O(1)');
  const [carbon, setCarbon] = useState('0.01g CO₂');
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [stdin, setStdin] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/practice/concepts`)
      .then(res => {
        setConcepts(res.data);
        if (res.data.length > 0 && !selectedConcept) {
          setSelectedConcept(res.data[0]);
        }
      })
      .catch(err => console.error("Concepts fetch failed", err));
  }, []);

  useEffect(() => {
    if (!selectedConcept && concepts.length> 0) {
      setSelectedConcept(concepts[0]);
    }
  }, [concepts]); // Removed language from dependencies to prevent accidental logic resets

  const runCode = async () => {
    setIsSubmitting(true);
    setEvalResult(null);
    try {
      const res = await axios.post(`${API_BASE}/run`, { code, language, stdin });
      setOutput(res.data);

      const evalRes = await axios.post(`${API_BASE}/practice/evaluate`, {
        code, language, mode, persona, stdin,
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
    <div className="flex flex-row gap-4 h-[calc(100vh-140px)] min-h-[600px] animate-in fade-in duration-700">
      {/* 2. MIDDLE: Editor & Code Control */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

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
        <div className="flex-1 bg-[#1e1e1e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative group">
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <span className="bg-indigo-600/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black border border-white/20 uppercase tracking-widest text-white flex items-center gap-1 shadow-lg">
              <Zap size={10} fill="currentColor" /> {language.toUpperCase()} ENGINE ACTIVE
            </span>
          </div>
          <Editor
            language={language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={setCode}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 20 },
              fontFamily: 'JetBrains Mono, monospace',
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Console / Stdin */}
        <div className="h-48 grid grid-cols-2 gap-4">
          <div className="bg-black/40 border border-white/5 rounded-2xl flex flex-col backdrop-blur-sm">
            <div className="p-3 border-b border-white/5 flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <Terminal size={14} /> Input Stream
            </div>
            <textarea
              className="flex-1 bg-transparent p-4 text-xs font-mono text-amber-200 outline-none resize-none placeholder-slate-700"
              placeholder="Feed data to stdin..."
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isSubmitting) runCode();
                }
              }}
            />
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

      {/* 3. RIGHT: Mentor & Analysis */}
      <div className="w-[30%] flex flex-col gap-4 min-w-[320px]">
        {/* Active Goal */}
        {!code.trim() ? (
          <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center opacity-60">
            <Code2 size={40} className="text-slate-700 mb-4" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Sandbox Active<br/>
              <span className="text-[10px] font-normal lowercase tracking-normal">Write any logic. The AI will identify your mission and provide deep insights.</span>
            </p>
          </div>
        ) : (
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Lightbulb size={60} />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-indigo-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Universal Logic Mission
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-bold">
              {code.toLowerCase().includes('even') || code.toLowerCase().includes('% 2') 
                ? "Goal: Mastering Even/Odd Logic & Numerical Parity."
                : code.toLowerCase().includes('age')
                ? "Goal: Mastering Age-Based Eligibility & Conditionals."
                : "Goal: Perfecting Custom Logic Architecture."
              }
            </p>
            <p className="text-[11px] text-slate-400 mt-2 leading-tight">
              The AI is currently analyzing your specific snippet for theoretical depth and real-world application.
            </p>
          </div>
        )}

        {/* Mentor Results */}
        <div className="flex-1 bg-surface/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span className="text-sm font-bold text-white tracking-tight">AI Insights</span>
            </div>
            {evalResult && (
              <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${evalResult.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {evalResult.status}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-[13px]">
            {!evalResult && !isSubmitting && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-4 opacity-40">
                <HelpCircle size={40} className="text-indigo-500" />
                <p className="text-slate-400 font-medium">Complete the challenge and hit <b>Submit</b> to unlock AI mentor analytics.</p>
              </div>
            )}

            {evalResult && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Status Message */}
                <div className={`p-4 rounded-xl border mb-6 ${evalResult.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100' : 'bg-rose-500/5 border-rose-500/20 text-rose-100'}`}>
                  <p className="leading-relaxed">{evalResult.message}</p>
                </div>

                {/* Diagram */}
                {evalResult.explanations?.diagram && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      <GitBranch size={14} /> Logic flow-chart
                    </div>
                    <Mermaid chart={evalResult.explanations.diagram} />
                  </div>
                )}

                {/* Theory & Real World - Explained after submission */}
                <div className="space-y-6 pt-4 border-t border-white/5">
                  {selectedConcept?.theory && (
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold uppercase text-[10px] tracking-widest">
                        <BookOpen size={14} /> Core Theory
                      </div>
                      <p className="text-slate-300 leading-relaxed text-xs">
                        {selectedConcept.theory}
                      </p>
                    </div>
                  )}

                  {selectedConcept?.real_world && (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold uppercase text-[10px] tracking-widest">
                        <Briefcase size={14} /> Real-World Application
                      </div>
                      <p className="text-slate-300 leading-relaxed text-xs">
                        {selectedConcept.real_world}
                      </p>
                    </div>
                  )}
                </div>

                {/* Alternative */}
                {evalResult.alternative && (
                  <div className="mt-8 mb-8 bg-black/30 border border-indigo-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold uppercase text-[10px] tracking-widest">
                      <Lightbulb size={14} /> Alternative Methodology
                    </div>
                    <p className="text-slate-400 leading-relaxed italic">{evalResult.alternative}</p>
                  </div>
                )}

                {/* Line by Line */}
                {evalResult.explanations?.line_by_line && (
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      <Layers size={14} /> Trace Analysis
                    </div>
                    <div className="space-y-3">
                      {evalResult.explanations.line_by_line.map((line, i) => (
                        <div key={i} className="flex gap-4 group">
                          <span className="text-slate-600 font-mono text-[10px] pt-1">{i + 1}</span>
                          <p className="text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">{line}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.2); }
      `}</style>
    </div>
  );
};

export default Practice;
