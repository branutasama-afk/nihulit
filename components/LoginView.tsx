
import React, { useState } from 'react';
import { User } from '../types';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User, remember: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  const [view, setView] = useState<'gate' | 'employee_login'>('gate');
  const [loginInput, setLoginInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleManagerLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const manager = users.find(u => u.role === 'MANAGER');
      if (manager) onLogin(manager, true);
      setLoading(false);
    }, 800);
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      const user = users.find(u => (u.phone === loginInput || u.tz === loginInput) && u.role !== 'MANAGER');
      if (user) {
        onLogin(user, rememberMe);
      } else {
        setError('המספר שהזנת לא מזוהה כעובד במערכת.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-600/10 blur-[150px] rounded-full animate-pulse duration-700"></div>
      
      <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="text-center mb-16">
          <div className="w-28 h-28 bg-black brand-border rounded-[40px] flex items-center justify-center text-white text-5xl font-black mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)] mx-auto border border-white/10">B.T</div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">B.T Management</h1>
          <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">ניהול משימות • סידורי עבודה • נוכחות</p>
        </div>

        {view === 'gate' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-12 duration-700">
            <button 
              onClick={handleManagerLogin}
              disabled={loading}
              className="group relative h-72 glass-effect rounded-[48px] border border-white/10 overflow-hidden flex flex-col items-center justify-center gap-6 hover:border-blue-500/50 transition-all duration-500 shadow-2xl hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 opacity-50"></div>
              <div className="text-7xl group-hover:scale-125 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">🔑</div>
              <div className="text-center">
                <span className="block text-2xl font-black text-white">כניסת מנהלים</span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 block opacity-60 group-hover:opacity-100 transition-opacity">כניסה ישירה ללוח הבקרה</span>
              </div>
            </button>

            <button 
              onClick={() => setView('employee_login')}
              className="group relative h-72 glass-effect rounded-[48px] border border-white/10 overflow-hidden flex flex-col items-center justify-center gap-6 hover:border-red-500/50 transition-all duration-500 shadow-2xl hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600 opacity-50"></div>
              <div className="text-7xl group-hover:scale-125 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">👷‍♂️</div>
              <div className="text-center">
                <span className="block text-2xl font-black text-white">כניסת עובדים</span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 block opacity-60 group-hover:opacity-100 transition-opacity">דיווח נוכחות ומשימות</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="glass-effect p-12 rounded-[56px] border border-white/5 relative overflow-hidden shadow-2xl animate-in slide-in-from-left-12 duration-500">
            <button 
              onClick={() => setView('gate')}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors font-black text-sm"
            >
              חזור ←
            </button>
            
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white mb-2">זיהוי עובד</h2>
              <p className="text-slate-500 font-bold text-sm">הזן את מספר הטלפון שלך להתחברות</p>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="space-y-8">
              <div className="space-y-3">
                <input 
                  required
                  autoFocus
                  type="tel" 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-3xl py-6 px-8 focus:ring-4 focus:ring-red-500/20 outline-none transition-all font-black text-3xl text-center placeholder:text-slate-900" 
                  placeholder="05X-XXXXXXX"
                  value={loginInput}
                  onChange={e => setLoginInput(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-red-500 text-xs font-black text-center animate-shake">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full pro-gradient text-white font-black py-7 rounded-[32px] shadow-2xl active:scale-95 transition-all text-xl flex items-center justify-center disabled:opacity-50 border border-white/10"
              >
                {loading ? (
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'התחבר עכשיו'
                )}
              </button>
            </form>
          </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.4em]">זכויות יוצרים ברהנו טסמה © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
