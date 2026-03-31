import React from 'react';
import { ShieldCheck, Activity, Eye, Zap } from 'lucide-react';

const ScoreDashboard = ({ scores }) => {
  if (!scores) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (score >= 70) return 'text-warning drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    return 'text-error drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]';
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in">
      <div className="metric-card border-t-2 border-t-primary">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <ShieldCheck size={18} />
          <span className="text-sm font-medium uppercase tracking-wider">Quality</span>
        </div>
        <div className={`text-4xl font-bold font-mono ${getScoreColor(scores.quality)}`}>
          {scores.quality}
        </div>
      </div>

      <div className="metric-card border-t-2 border-t-accent">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <Eye size={18} />
          <span className="text-sm font-medium uppercase tracking-wider">Readability</span>
        </div>
        <div className={`text-4xl font-bold font-mono ${getScoreColor(scores.readability)}`}>
          {scores.readability}
        </div>
      </div>

      <div className="metric-card border-t-2 border-t-warning">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <Zap size={18} />
          <span className="text-sm font-medium uppercase tracking-wider">Performance</span>
        </div>
        <div className={`text-4xl font-bold font-mono ${getScoreColor(scores.performance)}`}>
          {scores.performance}
        </div>
      </div>
    </div>
  );
};

export default ScoreDashboard;
