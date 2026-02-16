
import React, { useState } from 'react';

interface PasswordChangeOverlayProps {
  onComplete: (newPassword: string) => void;
}

const PasswordChangeOverlay: React.FC<PasswordChangeOverlayProps> = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 4) {
      setError('הסיסמא חייבת להכיל לפחות 4 תווים');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    onComplete(newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[300] flex items-center justify-center p-6 text-white" dir="rtl">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-12 duration-700">
        <div className="text-center mb-10">
          <span className="text-6xl mb-6 block">🔐</span>
          <h2 className="text-3xl font-black mb-2">החלפת סיסמא ראשונית</h2>
          <p className="text-slate-400 font-bold text-sm">למען אבטחת חשבונך, עליך לבחור סיסמא חדשה ואישית.</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">סיסמא חדשה</label>
              <input 
                required
                type="password" 
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 px-6 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-lg text-center tracking-widest" 
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">אישור סיסמא חדשה</label>
              <input 
                required
                type="password" 
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 px-6 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-lg text-center tracking-widest" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-black text-center animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full pro-gradient text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-lg border border-white/10 uppercase tracking-widest"
            >
              שמור סיסמא חדשה
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeOverlay;
