
import React, { useState } from 'react';
import { AppState } from '../types';

interface SecurityViewProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const SecurityView: React.FC<SecurityViewProps> = ({ state, setAppState }) => {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleUpdateCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentCode !== state.currentUser?.password) {
      setMessage({ text: 'הקוד הנוכחי אינו תקין', type: 'error' });
      return;
    }
    
    if (newCode.length < 4) {
      setMessage({ text: 'הקוד חייב להכיל לפחות 4 ספרות', type: 'error' });
      return;
    }

    if (newCode !== confirmCode) {
      setMessage({ text: 'הקוד החדש ואישור הקוד אינם תואמים', type: 'error' });
      return;
    }

    const updatedUser = { ...state.currentUser!, password: newCode };
    setAppState(prev => ({
      ...prev,
      currentUser: updatedUser,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));

    setMessage({ text: 'הקוד עודכן בהצלחה!', type: 'success' });
    setCurrentCode('');
    setNewCode('');
    setConfirmCode('');
  };

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-white">אבטחת חשבון</h2>
        <p className="text-slate-400 font-bold text-sm">ניהול קוד הגישה האישי שלך</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 flex gap-1">
          <div className="flex-1 bg-yellow-500"></div>
          <div className="flex-1 bg-green-500"></div>
          <div className="flex-1 bg-red-500"></div>
        </div>

        <form onSubmit={handleUpdateCode} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">קוד נוכחי</label>
              <input 
                required
                type="password" 
                className="w-full bg-[#222] border border-[#333] text-white rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-[0.5em] transition-all" 
                value={currentCode}
                onChange={e => setCurrentCode(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-[#333]">
              <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">קוד חדש</label>
              <input 
                required
                type="password" 
                className="w-full bg-[#222] border border-[#333] text-white rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-[0.5em] transition-all" 
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">אישור קוד חדש</label>
              <input 
                required
                type="password" 
                className="w-full bg-[#222] border border-[#333] text-white rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-[0.5em] transition-all" 
                value={confirmCode}
                onChange={e => setConfirmCode(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-black text-center animate-in slide-in-from-top-2 duration-300 ${
              message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all text-lg"
          >
            עדכן קוד גישה
          </button>
        </form>
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-3xl text-center space-y-2">
         <span className="text-2xl">🔒</span>
         <p className="text-[11px] text-blue-400 font-bold leading-relaxed">הקוד משמש לכניסה למערכת, דיווח נוכחות ואישור משימות. אל תשתף את הקוד שלך עם אף אחד.</p>
      </div>
    </div>
  );
};

export default SecurityView;
