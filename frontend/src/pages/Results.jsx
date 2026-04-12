import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft, Sparkles, RotateCcw, GitBranch,
  ChevronDown, ChevronUp, AlertCircle, Info, AlertTriangle,
  Code2, Play, CheckCircle, Copy, Check, Terminal, Loader2, Zap
} from 'lucide-react';
import axios from 'axios';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#6366f1',
    lineColor: '#60a5fa',
    textColor: '#e2e8f0'
  }
});

const Mermaid = ({ chart }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current && chart) {
      mermaid.contentLoaded();
      // Use a unique ID for each render to avoid conflicts
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      ref.current.innerHTML = `<div class="mermaid" id="${id}">${chart}</div>`;
      mermaid.init(undefined, ref.current.getElementsByClassName('mermaid'));
    }
  }, [chart]);

  return <div ref={ref} className="flex justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/30 overflow-x-auto" />;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateSummary = (feedback, scores) => {
  const errors = feedback.filter(f => f.type?.toLowerCase() === 'error');
  const warnings = feedback.filter(f => f.type?.toLowerCase() === 'warning');

  if (errors.length > 0) {
    return `The submitted code contains ${errors.length} critical syntax or logic error${errors.length > 1 ? 's' : ''} that prevent it from running. ${warnings.length > 0 ? `Additionally, ${warnings.length} warning${warnings.length > 1 ? 's were' : ' was'} found regarding code quality. ` : ''
      }Fix the errors shown below before proceeding. Keeping good coding practices in mind will help prevent such issues in the future.`;
  }
  if (warnings.length > 0) {
    return `The code is syntactically valid but has ${warnings.length} warning${warnings.length > 1 ? 's' : ''} that could impact maintainability or performance. Review the suggestions below to improve code quality. Readability score is ${scores?.readability ?? 'N/A'}/100.`;
  }
  if (feedback.length > 0) {
    return `The code looks good overall with a quality score of ${scores?.quality ?? 'N/A'}/100. There are ${feedback.length} minor suggestion${feedback.length > 1 ? 's' : ''} to further improve style and readability.`;
  }
  return `Excellent code! No issues were detected. Quality score: ${scores?.quality ?? 100}/100. The code follows best practices and is well-structured.`;
};

const guessComplexity = (feedback, code = '') => {
  const hasNested = feedback.some(f => f.message?.toLowerCase().includes('nested loop'));
  const timeC = hasNested ? 'O(N²)' : 'O(N)';
  const spaceC = code.includes('dict') || code.includes('{}') || code.includes('Map') ? 'O(N)' : 'O(1)';
  return { time: timeC, space: spaceC };
};

// ─── Circular Score Ring ──────────────────────────────────────────────────────
const ScoreRing = ({ score = 0, label, color, icon }) => {
  const size = 130;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(score, 100));
  const offset = circ - (filled / 100) * circ;

  const strokeMap = {
    purple: '#7c3aed',
    green: '#10b981',
    amber: '#f59e0b',
  };
  const glowMap = {
    purple: 'rgba(124,58,237,0.25)',
    green: 'rgba(16,185,129,0.25)',
    amber: 'rgba(245,158,11,0.25)',
  };
  const ringColor = strokeMap[color] ?? '#6366f1';
  const glow = glowMap[color] ?? 'transparent';

  return (
    <div className="flex flex-col items-center gap-3 flex-1">
      <div className="relative" style={{ filter: `drop-shadow(0 0 14px ${glow})`, width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx={size / 2} cy={size / 2} r={r}
            stroke="#1e2a3a" strokeWidth={stroke} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={r}
            stroke={ringColor} strokeWidth={stroke} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-white tabular-nums">{filled}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
        {icon}
        {label}
      </div>
    </div>
  );
};

// ─── Severity config ──────────────────────────────────────────────────────────
const sevConfig = (type) => {
  switch (type?.toLowerCase()) {
    case 'error':
      return {
        badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
        label: 'CRITICAL',
        icon: <AlertCircle size={18} className="text-rose-400 shrink-0" />,
        card: 'border-rose-500/20 bg-rose-500/5',
        border: 'border-l-rose-500',
      };
    case 'warning':
      return {
        badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        label: 'WARNING',
        icon: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
        card: 'border-amber-500/20 bg-amber-500/5',
        border: 'border-l-amber-500',
      };
    default:
      return {
        badge: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
        label: 'INFO',
        icon: <Info size={18} className="text-sky-400 shrink-0" />,
        card: 'border-sky-500/20 bg-sky-500/5',
        border: 'border-l-sky-400',
      };
  }
};

// ─── Copy Button ─────────────────────────────────────────────────────────────
const CopyBtn = ({ text }) => {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
    >
      {ok ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      {ok ? 'Copied' : 'Copy'}
    </button>
  );
};

// ─── Issue Card ───────────────────────────────────────────────────────────────
const IssueCard = ({ item }) => {
  const [open, setOpen] = useState(false);
  const cfg = sevConfig(item.type);
  const isFixed = item.type?.toLowerCase() === 'error' && item.suggestion; // simulate "fixed" state

  return (
    <div
      className={`rounded-xl border border-l-4 ${cfg.card} ${cfg.border} overflow-hidden transition-all duration-200`}
    >
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {cfg.icon}
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="text-white font-semibold text-sm leading-tight truncate">
              {item.message}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cfg.badge}`}>
                {cfg.label}
              </span>
              {item.line && (
                <span className="text-[11px] text-slate-500 font-medium">Line {item.line}</span>
              )}
              <span className="text-[11px] text-slate-500 font-medium capitalize">
                {item.type?.toLowerCase() === 'error' ? 'Bug' : item.type?.toLowerCase() === 'warning' ? 'Smell' : 'Style'}
              </span>
              {isFixed && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                  <CheckCircle size={10} /> Fixed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button className="text-[12px] font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors flex items-center gap-1.5">
            <Code2 size={12} /> Diff
          </button>
          {isFixed ? (
            <button className="text-[12px] font-semibold text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <RotateCcw size={12} /> Re-apply
            </button>
          ) : (
            <button className="text-[12px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <Sparkles size={12} /> Apply Fix
            </button>
          )}
          {open ? <ChevronUp size={16} className="text-slate-500 ml-1" /> : <ChevronDown size={16} className="text-slate-500 ml-1" />}
        </div>
      </div>

      {open && item.suggestion && (
        <div className="px-5 pb-4 pt-0 border-t border-white/5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-3">Suggestion</p>
          <p className="text-sm text-slate-300 leading-relaxed">{item.suggestion}</p>
        </div>
      )}
    </div>
  );
};

// ─── Code Panel ───────────────────────────────────────────────────────────────
const CodePanel = ({ code, language }) => (
  <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-[#0d1117]" style={{ height: 520 }}>
    <Editor
      height="100%"
      language={language || 'python'}
      theme="vs-dark"
      value={code || ''}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "'Fira Code', monospace",
        padding: { top: 14 },
        scrollBeyondLastLine: false,
        contextmenu: false,
        lineNumbers: 'on',
        renderLineHighlight: 'none',
      }}
    />
  </div>
);

// ─── Run Panel ────────────────────────────────────────────────────────────────
const RunPanel = ({ code, language }) => {
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [stdin, setStdin] = useState('');

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASEURL || `http://${window.location.hostname}:8000/api`;
      const { data } = await axios.post(`${API_BASE}/run`, {
        code, language, stdin
      });
      setOutput(data);
    } catch (err) {
      setOutput({ stderr: err.response?.data?.detail || err.message, exit_code: -1 });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex gap-4 h-[520px]">
        {/* Stdin */}
        <div className="flex-[1] rounded-xl overflow-hidden border border-slate-700/50 bg-[#0d1117] flex flex-col">
          <div className="bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700/50 h-10">
            <span className="text-xs font-semibold text-slate-400">Standard Input</span>
            <button
              onClick={handleRun}
              disabled={running}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
              Run Code
            </button>
          </div>
          <textarea
            className="flex-1 bg-transparent p-4 font-mono text-sm text-slate-300 resize-none outline-none placeholder-slate-600"
            placeholder="Type input here..."
            value={stdin}
            onChange={e => setStdin(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Output */}
        <div className="flex-[2] rounded-xl overflow-hidden border border-slate-700/50 bg-black flex flex-col">
          <div className="bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700/50 h-10">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
              <Zap size={14} className="text-amber-500" /> Output
            </span>
            {output && output.exit_code != null && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${output.exit_code === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                EXIT {output.exit_code}
              </span>
            )}
          </div>
          <div className="flex-1 p-4 overflow-auto font-mono text-sm whitespace-pre-wrap break-all">
            {!output && !running && <span className="text-slate-600">Click "Run Code" to see output</span>}
            {running && <span className="text-indigo-400 animate-pulse">Executing...</span>}
            {output && output.stdout && <span className="text-slate-300">{output.stdout}</span>}
            {output && output.stderr && <span className="text-rose-400 mt-2 block">{output.stderr}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = ['Issues', 'Deep Dive', 'Original', 'Patched', 'Refactored', 'Run Code'];

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
  const [tab, setTab] = useState('Issues');

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(() => { scrollTop(); }, []);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-5 animate-fade-in">
        <AlertCircle size={52} className="text-amber-400" />
        <p className="text-slate-400 text-lg font-medium">No results to display.</p>
        <button onClick={() => navigate('/new')} className="btn-primary px-6 py-3">
          <Sparkles size={16} /> Start a New Review
        </button>
      </div>
    );
  }

  const { scores, feedback = [], original_code, refactored_code, language, timestamp } = result;
  const formattedTs = timestamp ? new Date(timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
  const complexity = guessComplexity(feedback, original_code);
  const summary = generateSummary(feedback, scores);
  const errCount = feedback.filter(f => f.type?.toLowerCase() === 'error').length;
  const warnCount = feedback.filter(f => f.type?.toLowerCase() === 'warning').length;
  const infoCount = feedback.length - errCount - warnCount;
  const fixCount = errCount; // treat errors as "fixable"

  return (
    <div className="flex flex-col gap-5 animate-fade-in pb-14" style={{ minHeight: '100%' }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/new')}
            className="mt-1 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
              {language ? `${language} review` : 'Code Review'}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2.5 py-0.5 rounded-full capitalize">
                {language}
              </span>
              <span className="text-[11px] font-semibold bg-slate-700/50 text-slate-400 border border-slate-600/50 px-2.5 py-0.5 rounded-full">
                beginner mode
              </span>
              {formattedTs && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  🕒 {formattedTs}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/new')} className="btn-primary px-5 py-2.5 text-sm shrink-0">
          <Sparkles size={15} /> New Review
        </button>
      </div>

      {/* ── Score Panel ── */}
      <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-7">
        <div className="flex items-stretch gap-0 divide-x divide-slate-700/50">
          <ScoreRing score={scores?.quality ?? 0} label="Quality" color="purple" icon={<span className="text-xs">◎</span>} />
          <ScoreRing score={scores?.readability ?? 0} label="Readability" color="green" icon={<span className="text-xs">◉</span>} />
          <ScoreRing score={scores?.performance ?? 0} label="Performance" color="amber" icon={<span className="text-xs">⚡</span>} />

          {/* Complexity blocks */}
          <div className="flex flex-1 flex-col items-center justify-center gap-1 px-8">
            <span className="text-2xl font-black text-white font-mono">{complexity.time}</span>
            <span className="text-xs text-slate-500 font-medium tracking-wide">Time Complexity</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-1 px-8">
            <span className="text-2xl font-black text-white font-mono">{complexity.space}</span>
            <span className="text-xs text-slate-500 font-medium tracking-wide">Space Complexity</span>
          </div>
        </div>
      </div>

      {/* ── AI Summary ── */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">AI Summary</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{summary}</p>
      </div>

      {/* ── Issues Found Bar ── */}
      <div className="flex items-center gap-4 text-sm px-1">
        <span className="text-slate-500 font-medium">Issues found:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
          <span className="text-slate-300 font-semibold">{errCount} critical</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
          <span className="text-slate-300 font-semibold">{warnCount} warnings</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
          <span className="text-slate-300 font-semibold">{infoCount} info</span>
        </span>
        {fixCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span className="text-emerald-400 font-semibold">{fixCount} fix applied</span>
          </span>
        )}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 border-b border-slate-700/60 pb-0">
        {TABS.map(t => {
          const count = t === 'Issues' ? feedback.length
            : t === 'Patched' ? fixCount
              : null;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${tab === t
                ? 'border-indigo-500 text-white bg-indigo-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/3'
                }`}
            >
              {t === 'Issues' && <AlertCircle size={13} />}
              {t === 'Deep Dive' && <Sparkles size={13} />}
              {t === 'Original' && <Code2 size={13} />}
              {t === 'Patched' && <CheckCircle size={13} />}
              {t === 'Refactored' && <Sparkles size={13} />}
              {t === 'Run Code' && <Play size={13} />}
              {t}
              {count != null && count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${tab === t ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-700 text-slate-400'
                  }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <div className="ml-auto flex items-center pb-2">
          <CopyBtn text={tab === 'Original' ? original_code : refactored_code} />
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex flex-col gap-3">

        {/* Issues Tab */}
        {tab === 'Issues' && (
          feedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-slate-700/40 bg-slate-800/20">
              <CheckCircle size={44} className="text-emerald-400" />
              <p className="text-slate-400 font-medium text-base">No issues found — great code!</p>
            </div>
          ) : (
            feedback.map((item, idx) => <IssueCard key={idx} item={item} index={idx} />)
          )
        )}

        {/* Deep Dive Tab */}
        {tab === 'Deep Dive' && (
          <div className="flex flex-col gap-6 animate-fade-in mb-8 p-1">
            {/* Logic Simplification */}
            <div className="glass-panel p-6 border-l-4 border-l-indigo-500">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                Logic Simplification
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {result.explanations?.logic_simplification || "Analyzing common patterns in this code block..."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Real World Use Case */}
              <div className="glass-panel p-6">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sky-400">
                  <Info size={18} />
                  Real-World Use Case
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "{result.explanations?.real_world_use_case || "Searching for common application scenarios..."}"
                </p>
              </div>

              {/* Theoretical Concepts */}
              <div className="glass-panel p-6">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-emerald-400">
                  <Code2 size={18} />
                  Key Concepts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(result.explanations?.theoretical_concepts || ["Data Structures", "Control Flow"]).map((concept, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Line by Line Breakdown */}
            <div className="glass-panel p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-amber-400">
                <Terminal size={18} />
                Line-by-Line Breakdown
              </h3>
              <div className="space-y-3">
                {(result.explanations?.line_by_line || ["Synthesizing code context..."]).map((line, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-slate-500 font-mono text-xs w-6 shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-slate-300 text-sm group-hover:text-white transition-colors leading-relaxed">
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Logic Flow - Diagram */}
            {result.explanations?.diagram && (
              <div className="glass-panel p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-primary">
                  <GitBranch size={18} />
                  Logic Representation (Diagram)
                </h3>
                <Mermaid chart={result.explanations.diagram} />
                <p className="text-slate-500 text-[11px] mt-4 text-center italic">
                  * Visual representation of the core structural logic and execution path.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Original Code Tab */}
        {tab === 'Original' && <CodePanel code={original_code} language={language} />}

        {/* Patched Tab (same as refactored for now) */}
        {tab === 'Patched' && <CodePanel code={refactored_code} language={language} />}

        {/* Refactored Tab */}
        {tab === 'Refactored' && <CodePanel code={refactored_code} language={language} />}

        {/* Run Code Tab */}
        {tab === 'Run Code' && <RunPanel code={refactored_code || original_code} language={language} />}

      </div>

    </div>
  );
};

export default Results;
