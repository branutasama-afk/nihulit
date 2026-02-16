
import React, { useState } from 'react';
import { AppState, AbsenceRequest } from '../types';

interface AbsencesViewProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const AbsencesView: React.FC<AbsencesViewProps> = ({ state, setAppState }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const isManager = state.currentUser?.role === 'MANAGER';
  const today = new Date().toISOString().split('T')[0];

  const [request, setRequest] = useState<Partial<AbsenceRequest>>({
    type: 'vacation',
    startDate: today,
    endDate: today,
    reason: ''
  });

  // Role-based visibility
  const displayAbsences = isManager 
    ? state.absences 
    : state.absences.filter(a => a.userId === state.currentUser?.id);

  // Summary for manager
  const currentlyOnVacation = state.absences.filter(a => 
    a.status === 'approved' && 
    today >= a.startDate && 
    today <= a.endDate
  );

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: AbsenceRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: state.currentUser?.id || '',
      type: (request.type as any) || 'vacation',
      status: 'pending',
      startDate: request.startDate || '',
      endDate: request.endDate || '',
      reason: request.reason || ''
    };
    setAppState(prev => ({ ...prev, absences: [newReq, ...prev.absences] }));
    setShowRequestModal(false);
  };

  const handleUpdateStatus = (id: string, status: AbsenceRequest['status']) => {
    setAppState(prev => ({
      ...prev,
      absences: prev.absences.map(a => a.id === id ? { ...a, status } : a)
    }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">היעדרויות וחופשות</h2>
          <p className="text-slate-500 text-sm font-bold">
            {isManager ? 'ניהול ואישור בקשות חופשה לכל הצוות' : 'הגשת בקשות חופשה ומעקב אחר הסטטוס'}
          </p>
        </div>
        {!isManager && (
          <button 
            onClick={() => setShowRequestModal(true)}
            className="pro-gradient hover:scale-[1.02] text-white px-8 py-4 rounded-[28px] font-black transition-all shadow-xl shadow-red-500/20 flex items-center gap-2 border border-white/10"
          >
            <span>🏝️</span> בקשת חופשה
          </button>
        )}
      </div>

      {isManager && currentlyOnVacation.length > 0 && (
        <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-[48px] animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
             <span className="text-2xl">🏖️</span> עובדים בחופשה כרגע ({currentlyOnVacation.length})
          </h3>
          <div className="flex flex-wrap gap-4">
            {currentlyOnVacation.map(abs => {
              const user = state.users.find(u => u.id === abs.userId);
              return (
                <div key={abs.id} className="bg-black/40 border border-white/5 px-6 py-4 rounded-3xl flex items-center gap-4">
                  <img src={user?.avatar} className="w-10 h-10 rounded-2xl border border-white/10" alt="" />
                  <div>
                    <p className="text-sm font-black text-white">{user?.name} {user?.lastName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">עד {abs.endDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="glass-effect rounded-[48px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
           <h3 className="text-xl font-black text-white">{isManager ? 'כל הבקשות במערכת' : 'הבקשות שלי'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">עובד</th>
                <th className="px-8 py-5">סוג</th>
                <th className="px-8 py-5">תאריכים</th>
                <th className="px-8 py-5">סיבה</th>
                <th className="px-8 py-5">סטטוס</th>
                {isManager && <th className="px-8 py-5">פעולות</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayAbsences.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 6 : 5} className="px-8 py-20 text-center text-slate-700 font-black uppercase tracking-widest italic">
                    אין בקשות להצגה
                  </td>
                </tr>
              ) : (
                displayAbsences.map(abs => (
                  <tr key={abs.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={state.users.find(u => u.id === abs.userId)?.avatar} className="w-10 h-10 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform" alt="" />
                        <span className="font-black text-sm text-white">{state.users.find(u => u.id === abs.userId)?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black bg-white/5 px-3 py-1.5 rounded-xl text-slate-400 uppercase tracking-widest border border-white/5">
                        {abs.type === 'vacation' ? 'חופשה' : abs.type === 'sick' ? 'מחלה' : 'אחר'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-400 font-bold">{abs.startDate} עד {abs.endDate}</td>
                    <td className="px-8 py-5 text-xs text-slate-500 max-w-xs truncate font-medium">{abs.reason}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border ${
                        abs.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        abs.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {abs.status === 'pending' ? 'ממתין' : abs.status === 'approved' ? 'אושר' : 'נדחה'}
                      </span>
                    </td>
                    {isManager && (
                      <td className="px-8 py-5">
                        {abs.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateStatus(abs.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all">אישור</button>
                            <button onClick={() => handleUpdateStatus(abs.id, 'rejected')} className="bg-red-600/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-red-600 hover:text-white transition-all">דחייה</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-6">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-[48px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-500">
            <div className="pro-gradient p-10 text-white flex justify-between items-center relative">
              <h3 className="text-3xl font-black">בקשת היעדרות</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-2xl hover:bg-white/10 rounded-2xl w-12 h-12 flex items-center justify-center transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmitRequest} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">סוג היעדרות</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none font-bold"
                  value={request.type}
                  onChange={e => setRequest({...request, type: e.target.value as any})}
                >
                  <option value="vacation">🏖️ חופשה</option>
                  <option value="sick">🤒 מחלה</option>
                  <option value="other">❓ אחר</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">מתאריך</label>
                  <input 
                    type="date" 
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none font-bold text-sm"
                    value={request.startDate}
                    onChange={e => setRequest({...request, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">עד תאריך</label>
                  <input 
                    type="date" 
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none font-bold text-sm"
                    value={request.endDate}
                    onChange={e => setRequest({...request, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">סיבה / הערות</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none h-32 font-bold"
                  placeholder="פרט כאן את סיבת הבקשה..."
                  value={request.reason}
                  onChange={e => setRequest({...request, reason: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 pro-gradient text-white font-black py-5 rounded-2xl shadow-xl shadow-red-600/20 text-lg border border-white/10">שלח בקשה</button>
                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 bg-white/5 border border-white/10 text-slate-400 font-black py-5 rounded-2xl hover:bg-white/10 transition-all">ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsencesView;
