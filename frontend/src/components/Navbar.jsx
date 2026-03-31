import React from 'react';
import { NavLink } from 'react-router-dom';
import { Code2, Sparkles, LayoutDashboard, Plus, History } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="flex justify-between items-center w-full py-4 px-8 border-b border-white/5 bg-background">
      {/* Brand logo left */}
      <div className="flex items-center gap-3 group cursor-pointer select-none">
        <div className="p-1.5 bg-primary/10 text-primary rounded-xl">
          <Code2 size={22} className="stroke-[2.5]" />
        </div>
        <h1 className="text-xl font-bold text-white flex gap-2 items-center tracking-tight">
          AI Code Reviewer
          <Sparkles size={16} className="text-accent opacity-80" />
        </h1>
      </div>

      {/* Navigation center-right */}
      <nav className="flex items-center gap-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/new" 
          className={({ isActive }) => 
            `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Plus size={16} />
          New Review
        </NavLink>

        <NavLink 
          to="/history" 
          className={({ isActive }) => 
            `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <History size={16} />
          History
        </NavLink>
        
        <NavLink 
          to="/practice" 
          className={({ isActive }) => 
            `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Code2 size={16} />
          Practice
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
