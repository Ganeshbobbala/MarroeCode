import React from 'react';
import { AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react';
import Editor from '@monaco-editor/react';

const ReviewPanel = ({ result }) => {
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 glass-panel p-8 text-center animate-pulse-slow">
        <Activity size={48} className="mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-gray-300">Ready for Analysis</h3>
        <p className="mt-2 max-w-sm">Paste your code and hit analyze to discover bugs, vulnerabilities, and refactoring suggestions.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 animate-slide-up">
      {/* Suggestions and Feedback */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
          <AlertCircle className="text-warning" />
          AI Review Feedback
        </h3>
        
        {result.feedback.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg text-success">
            <CheckCircle2 />
            <p>Your code looks great! No major issues detected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {result.feedback.map((item, idx) => (
              <div key={idx} className="p-4 bg-surfaceHover border border-white/5 rounded-lg border-l-4 border-l-warning">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-warning bg-warning/10 px-2 py-0.5 rounded">
                    {item.type}
                  </span>
                  {item.line && (
                    <span className="text-xs font-mono text-gray-400">Line: {item.line}</span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-3">{item.message}</p>
                <div className="bg-primary/10 border border-primary/20 rounded-md p-3 flex gap-2">
                  <Lightbulb size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-primary/90">{item.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refactored Code Segment */}
      <div className="glass-panel p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold flex items-center gap-2 text-white mb-4">
          <CheckCircle2 className="text-success" />
          Refactored Code
        </h3>
        <div className="flex-grow rounded-lg overflow-hidden border border-white/10 h-64">
           <Editor
            height="100%"
            language={result.language}
            value={result.refactored_code}
            theme="vs-dark"
            options={{ readOnly: true, minimap: { enabled: false }, fontFamily: 'Fira Code' }}
          />
        </div>
      </div>
    </div>
  );
};

// Activity icon for empty state placeholder
const Activity = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);

export default ReviewPanel;
