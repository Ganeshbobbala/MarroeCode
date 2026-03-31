import React, { useState, useEffect } from 'react';
import { Play, Check, AlertCircle, BookOpen, Lightbulb, Code2, Copy, Sparkles, Terminal, ChevronDown, Bot } from 'lucide-react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const BOILERPLATES = {
  java: `public class Main {
    public static void main(String[] args) {
        // Write your code here
        
        System.out.println("Hello, World!");
    }
}`,
  python: `def main():
    # Write your code here
    print("Hello, World!")

if __name__ == "__main__":
    main()
`,
  javascript: `function main() {
    // Write your code here
    console.log("Hello, World!");
}

main();
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}
`
};

const REFACTOR_BOILERPLATES = {
  java: `public class Main {\n    public static void main(String[] args) {\n        int n = 10;\n        for(int i=0; i<n; i++) {\n            for(int j=0; j<n; j++) {\n                System.out.println(i + " " + j);\n            }\n        }\n    }\n}`,
  python: `def main():\n    var1 = []\n    for i in range(10):\n        for j in range(10):\n            var1.append(i + j)\n    print(var1)\n\nmain()`,
  javascript: `var n = 10;\nfor(var i=0; i<n; i++) {\n    for(var j=0; j<n; j++) {\n        console.log("sum", i+j);\n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    for(int i=0; i<10; i++) {\n        for(int j=0; j<10; j++) cout << i+j;\n    }\n    return 0;\n}`
};

const Practice = () => {
  const [language, setLanguage] = useState('java');
  const [mode, setMode] = useState('standard');
  const [persona, setPersona] = useState('standard');
  const [code, setCode] = useState(BOILERPLATES['java']);
  const [output, setOutput] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complexity, setComplexity] = useState('O(1)');
  const [carbon, setCarbon] = useState('0.01g CO₂ / 10k ops');
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    let baseCode = BOILERPLATES[language];
    if (mode === 'refactor') {
        baseCode = REFACTOR_BOILERPLATES[language];
    } else if (mode === 'speed_run') {
        baseCode = BOILERPLATES[language].replace(";", "").replace(")", "");
        setTimeLeft(30);
    } else {
        setTimeLeft(null);
    }
    setCode(baseCode);
    setOutput(null);
    setEvalResult(null);
  }, [language, mode]);

  useEffect(() => {
    let timer;
    if (timeLeft !== null && timeLeft > 0) {
        timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
        setEvalResult({ status: 'fail', message: 'TIME IS UP! 💥', mistakes: ['You failed to fix the syntax error within 30 seconds!'], fixed_code: 'Try again by switching the mode.', alternative: '' });
        setTimeLeft(null);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const handler = setTimeout(() => {
        axios.post(`${API_BASE}/practice/complexity`, { code, language }).then(res => {
            setComplexity(res.data.complexity);
            if(res.data.carbon) setCarbon(res.data.carbon);
        }).catch(err => setComplexity("?"));
    }, 500);
    return () => clearTimeout(handler);
  }, [code, language]);

  const runCode = async () => {
    setIsSubmitting(true);
    setEvalResult(null);
    try {
      const res = await axios.post(`${API_BASE}/run`, {
        code,
        language
      });
      setOutput(res.data);
      
      const evalRes = await axios.post(`${API_BASE}/practice/evaluate`, {
        code,
        language,
        mode,
        persona
      });
      if (mode === 'speed_run') setTimeLeft(null); // Stop timer on submit
      setEvalResult(evalRes.data);
    } catch (err) {
      setOutput({ stderr: "Error evaluating code. " + (err.response?.data?.detail || "") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] animate-fade-in -mx-6 -my-8 px-6 py-6 pb-0">
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <BookOpen size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">Interactive Practice</h2>
            <p className="text-xs text-slate-400 font-medium">Generic Problem Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wide cursor-default">
            Level: Any
          </span>
          <div className="relative">
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="appearance-none bg-rose-900/40 text-rose-200 border border-rose-500/50 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold uppercase tracking-wide cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 mr-2"
            >
              <option value="standard">AI: Normal Mode</option>
              <option value="linus">AI: Aggressive Linus</option>
              <option value="zen">AI: Zen Master</option>
              <option value="startup">AI: Startup Tech Bro</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="appearance-none bg-indigo-900/50 text-indigo-200 border border-indigo-500/50 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold uppercase tracking-wide cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
            >
              <option value="standard">Standard Practice</option>
              <option value="socratic">Socratic Mentor</option>
              <option value="refactor">Refactoring Arena</option>
              <option value="chaos_monkey">Chaos Monkey (Bug Hunt)</option>
              <option value="speed_run">Syntax Speed-Runner</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-slate-800 text-slate-200 border border-slate-600/50 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold uppercase tracking-wide cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {timeLeft !== null && (
              <div className="flex items-center ml-auto gap-2 text-rose-500 font-bold bg-rose-500/10 px-3 py-1.5 rounded border border-rose-500/20 animate-pulse">
                  <Clock size={16} /> 00:{timeLeft.toString().padStart(2, '0')}
              </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 flex-1 mb-6 min-h-0">
        
        {/* Left Panel: Mentor Feedback */}
        <div className="w-[45%] flex flex-col gap-4">
          <div className="flex-1 overflow-auto bg-surface/80 border border-slate-700/50 rounded-xl p-6 relative">
            {!evalResult ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-4 opacity-70">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2">
                  <Bot size={32} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready for Review</h3>
                  <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                    Select a language, write your problem-solving code on the right, and press <b>Submit Code</b>. I'll provide real-time mentor feedback and execution results here!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 text-sm">
                <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Bot size={20} className="text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Mentor Analysis</h2>
                </div>

                <div className={`p-4 rounded-xl border flex gap-3 shrink-0 ${evalResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                   {evalResult.status === 'success' ? <Check size={24} className="text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle size={24} className="text-rose-400 shrink-0 mt-0.5" />}
                   <div>
                     <h3 className={`font-bold text-lg mb-1 ${evalResult.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {evalResult.status === 'success' ? 'Code Verified!' : 'Issues Detected'}
                     </h3>
                     <p className="text-slate-300 leading-relaxed text-[13px]">{evalResult.message}</p>
                   </div>
                </div>

                
                {evalResult.mistakes && evalResult.mistakes.length > 0 && (
                  <div className="bg-[#0d1117] border border-slate-700/50 p-5 rounded-xl shrink-0">
                    <h4 className="text-rose-400 font-bold mb-3 flex items-center gap-2"><AlertCircle size={16}/> Mistakes Detected</h4>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                      {evalResult.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                )}

                <div className="bg-[#0d1117] border border-slate-700/50 p-5 rounded-xl shrink-0">
                    <h4 className="text-indigo-400 font-bold mb-3 flex items-center gap-2"><Sparkles size={16}/> Corrected / Optimized Code</h4>
                    <pre className="text-slate-300 font-mono text-xs overflow-x-auto p-3 bg-black/40 rounded-lg border border-slate-700/50 whitespace-pre-wrap">
                      {evalResult.fixed_code}
                    </pre>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-xl shrink-0">
                    <h4 className="text-amber-400 font-bold mb-3 flex items-center gap-2"><Lightbulb size={16}/> Alternative Approach</h4>
                    <pre className="text-amber-200/80 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                      {evalResult.alternative}
                    </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor & Terminal */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 bg-[#1e1e1e] border border-slate-700/50 rounded-xl overflow-hidden flex flex-col relative">
            <div className="bg-[#2d2d2d] border-b border-black/40 px-4 py-2 flex items-center justify-between">
               <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-2"><Code2 size={14} className="text-indigo-400" /> {language === 'java' ? 'Main.java' : language === 'python' ? 'main.py' : language === 'javascript' ? 'main.js' : 'main.cpp'}</span>
                {complexity !== '?' && <span className={`px-2 py-0.5 rounded-full border whitespace-nowrap ${complexity === 'O(1)' || complexity === 'O(N)' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>Live Speed: {complexity}</span>}
                {carbon && <span className="px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-300 whitespace-nowrap drop-shadow bg-emerald-900/30 hidden sm:inline-block">Eco: {carbon}</span>}
               </div>
               <button 
                onClick={runCode}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-4 rounded shadow-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-2"
               >
                 {isSubmitting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Play size={12} fill="currentColor" />}
                 Submit Code
               </button>
            </div>
            <div className="flex-1 relative">
              <Editor
                language={(language === 'cpp' || language === 'c++') ? 'cpp' : language}
                theme="vs-dark"
                value={code}
                onChange={setCode}
                options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 16 } }}
              />
            </div>
          </div>

          <div className="h-44 bg-black border border-slate-700/50 rounded-xl overflow-hidden flex flex-col shrink-0">
             <div className="bg-[#2d2d2d] border-b border-black/40 px-4 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-2"><Terminal size={14} /> Execution Output</span>
                {output && output.exit_code != null && (
                   <span className={`px-2 rounded ${output.exit_code === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                     Exit {output.exit_code}
                   </span>
                )}
             </div>
             <div className="flex-1 p-3 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-slate-300">
                {!output && !isSubmitting && <span className="text-slate-600">Submit your code to see output here.</span>}
                {isSubmitting && <span className="text-emerald-400 animate-pulse">Running compilation...</span>}
                {output && output.stdout && <span className="text-slate-200">{output.stdout}</span>}
                {output && output.stderr && <span className="text-rose-400 block mt-2">{output.stderr}</span>}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Practice;
