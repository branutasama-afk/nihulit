
import React, { useState } from 'react';
import { AppState, TimeEntry } from '../types';

interface AttendanceViewProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ state, setAppState }) => {
  const isManager = state.currentUser?.role === 'MANAGER';
  const today = new Date().toISOString().split('T')[0];
  const [loading, setLoading] = useState(false);
  
  const currentEntry = state.attendance.find(a => a.userId === state.currentUser?.id && a.date === today);

  const getPosition = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const handleClockIn = async () => {
    setLoading(true);
    const pos = await getPosition();
    const location = pos ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : undefined;

    const entry: TimeEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: state.currentUser?.id || '',
      date: today,
      clockIn: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      clockInLocation: location
    };
    setAppState(prev => ({ ...prev, attendance: [entry, ...prev.attendance] }));
    setLoading(false);
  };

  const handleClockOut = async () => {
    if (!currentEntry) return;
    setLoading(true);
    const pos = await getPosition();
    const location = pos ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : undefined;

    const now = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    setAppState(prev => ({
      ...prev,
      attendance: prev.attendance.map(a => a.id === currentEntry.id ? { ...a, clockOut: now, clockOutLocation: location } : a)
    }));
    setLoading(false);
  };

  const filteredLogs = isManager 
    ? state.attendance 
    : []; // Empty for non-managers as requested

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const subject = `דוח נוכחות - WorkFlow - ${new Date().toLocaleDateString('he-IL')}`;
    let body = "דוח נוכחות עובדים:\n\n";
    filteredLogs.forEach(log => {
      const user = state.users.find(u => u.id === log.userId);
      body += `עובד: ${user?.name} ${user?.lastName} | תאריך: ${log.date} | כניסה: ${log.clockIn} | יציאה: ${log.clockOut || '--'}\n`;
    });
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">דיווח נוכחות</h2>
          <p className="text-slate-400 text-sm font-bold">נהל את שעות העבודה שלך ועקוב אחר דיווחי הצוות</p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <div className="bg-[#1a1a1a] p-2 rounded-2xl border border-[#333] flex gap-2">
            {!currentEntry ? (
              <button 
                onClick={handleClockIn}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>⏺️ כניסה</span>}
              </button>
            ) : !currentEntry.clockOut ? (
              <button 
                onClick={handleClockOut}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>⏹️ יציאה</span>}
              </button>
            ) : (
              <div className="bg-[#222] text-slate-500 px-6 py-3 rounded-xl font-black text-sm">
                המשמרת הסתיימה
              </div>
            )}
          </div>
          
          {isManager && (
            <div className="flex gap-2">
              <button onClick={handlePrint} className="bg-[#222] hover:bg-[#333] text-slate-200 p-2.5 rounded-xl border border-[#444] transition-all" title="הדפס דוח">
                🖨️
              </button>
              <button onClick={handleEmail} className="bg-[#222] hover:bg-[#333] text-slate-200 p-2.5 rounded-xl border border-[#444] transition-all" title="שלח במייל">
                📧
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-[32px] shadow-2xl border border-[#333] overflow-hidden">
        <div className="p-6 border-b border-[#333] bg-[#222]/30 flex justify-between items-center">
          <h3 className="text-lg font-black text-white">{isManager ? 'דוח שעות עובדים' : 'דוח שעות אישי'}</h3>
        </div>
        {!isManager ? (
           <div className="p-20 text-center flex flex-col items-center gap-4">
              <span className="text-6xl opacity-20 grayscale">🔒</span>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">נתוני הנוכחות הכלליים חסויים. גש למנהל לקבלת דוח אישי.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#222]/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">עובד</th>
                  <th className="px-6 py-4">תאריך</th>
                  <th className="px-6 py-4">כניסה / מיקום</th>
                  <th className="px-6 py-4">יציאה / מיקום</th>
                  <th className="px-6 py-4">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold italic">
                      אין דיווחים להצגה במערכת
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={state.users.find(u => u.id === log.userId)?.avatar} className="w-8 h-8 rounded-full border border-[#444]" alt="" />
                          <span className="font-bold text-sm text-white">{state.users.find(u => u.id === log.userId)?.name} {state.users.find(u => u.id === log.userId)?.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-200">{log.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-400 font-bold">{log.clockIn}</span>
                          {log.clockInLocation && (
                            <a 
                              href={`https://www.google.com/maps?q=${log.clockInLocation.lat},${log.clockInLocation.lng}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[9px] text-blue-400 font-bold hover:underline"
                            >
                              📍 צפה במיקום כניסה
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                          <span className="text-sm text-slate-400 font-bold">{log.clockOut || '--:--'}</span>
                          {log.clockOutLocation && (
                            <a 
                              href={`https://www.google.com/maps?q=${log.clockOutLocation.lat},${log.clockOutLocation.lng}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[9px] text-blue-400 font-bold hover:underline"
                            >
                              📍 צפה במיקום יציאה
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                          log.clockOut ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {log.clockOut ? 'הושלם' : 'במשמרת'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceView;
