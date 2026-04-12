import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-8 border-t border-white/5 bg-background/50 backdrop-blur-sm z-10">
      <div className="max-w-7xl mx-auto px-8 flex flex-col items-center justify-center gap-2">
        <p className="text-slate-500 text-sm font-medium flex items-center gap-2 tracking-wide uppercase">
          Developed By ❤️ 
          <span className="text-white font-bold hover:text-primary transition-colors cursor-pointer">
            Ganesh Bobbala
          </span>
        </p>
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-black">
          © {new Date().getFullYear()} MarroeCode
        </p>
      </div>
    </footer>
  );
};

export default Footer;
