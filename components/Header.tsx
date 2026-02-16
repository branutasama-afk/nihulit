
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-[#121212] border-b border-[#333] h-20 flex items-center justify-between px-8 sticky top-0 z-20 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col">
          <h2 className="text-xl font-black text-white leading-none">
            שלום, <span className="text-blue-400">{user?.name} {user?.lastName}</span>
          </h2>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={onLogout}
          className="text-[10px] hover:text-red-400 text-slate-400 px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 border border-transparent hover:border-red-500/20 hover:bg-red-500/5 uppercase tracking-widest"
        >
          <span>🚪</span> יציאה מהמערכת
        </button>
        
        <div className="flex items-center gap-4 bg-[#1a1a1a] p-2 pl-5 rounded-3xl border border-[#333] shadow-inner">
          <div className="relative">
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-10 h-10 rounded-2xl border border-[#444] shadow-sm object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-lg bg-green-500 border-2 border-[#1a1a1a]"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white leading-tight">{user?.name} {user?.lastName}</span>
            <span className={`text-[9px] font-black uppercase leading-tight tracking-widest ${user?.role === 'MANAGER' ? 'text-purple-400' : user?.role === 'SUPERVISOR' ? 'text-yellow-400' : 'text-blue-400'}`}>
              {user?.role === 'MANAGER' ? 'מנהל מערכת' : user?.role === 'SUPERVISOR' ? 'אחראי משמרת' : 'חבר צוות'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
