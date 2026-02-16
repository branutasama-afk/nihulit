
import React, { useState } from 'react';
import { AppState, Shift } from '../types';

interface ScheduleViewProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ state, setAppState }) => {
  const [showShiftForm, setShowShiftForm] = useState(false);
  const isManager = state.currentUser?.role === 'MANAGER';
  
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    userId: state.users[1]?.id,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    position: 'שירות לקוחות'
  });

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    const shift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      userId: newShift.userId || '',
      date: newShift.date || '',
      startTime: newShift.startTime || '',
      endTime: newShift.endTime || '',
      position: newShift.position || ''
    };
    setAppState(prev => ({ ...prev, shifts: [...prev.shifts, shift] }));
    setShowShiftForm(false);
    alert('המשמרת שובצה בהצלחה');
  };

  const days = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">סידור עבודה</h2>
          <p className="text-slate-500 text-sm font-bold">ניהול משמרות ושעות פעילות שבועי</p>
        </div>
        {isManager && !showShiftForm && (
          <button 
            onClick={() => setShowShiftForm(true)}
            className="bg-white text-black hover:bg-slate-200 px-6 py-3 rounded-2xl font-black transition-all shadow-xl flex items-center gap-2"
          >
            <span>➕</span> שיבוץ משמרת ידני
          </button>
        )}
      </div>

      {/* Inline Shift Assignment Form - NO POPUPS */}
      {isManager && showShiftForm && (
        <div className="glass-effect p-8 rounded-[40px] border border-white/10 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <span className="text-red-500">📅</span> שיבוץ משמרת חדשה
            </h3>
            <button onClick={() => setShowShiftForm(false)} className="text-slate-500 hover:text-white transition-colors">ביטול X</button>
          </div>
          
          <form onSubmit={handleAddShift} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">בחר עובד</label>
              <select 
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer font-bold transition-all"
                value={newShift.userId}
                onChange={e => setNewShift({...newShift, userId: e.target.value})}
              >
                {state.users.filter(u => u.role !== 'MANAGER').map(user => (
                  <option key={user.id} value={user.id} className="bg-[#121212]">{user.name} {user.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">תאריך</label>
              <input 
                type="date" 
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none font-bold"
                value={newShift.date}
                onChange={e => setNewShift({...newShift, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">תפקיד/מיקום</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none font-bold"
                placeholder="למשל: עמדת קפה"
                value={newShift.position}
                onChange={e => setNewShift({...newShift, position: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">התחלה</label>
                <input 
                  type="time" 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none font-bold text-center"
                  value={newShift.startTime}
                  onChange={e => setNewShift({...newShift, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">סיום</label>
                <input 
                  type="time" 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none font-bold text-center"
                  value={newShift.endTime}
                  onChange={e => setNewShift({...newShift, endTime: e.target.value})}
                />
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-end gap-4 mt-2">
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest">אישור שיבוץ</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-effect rounded-[48px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
          {days.map(day => (
            <div key={day} className="p-6 text-center font-black text-slate-400 text-xs border-l border-white/5 last:border-l-0 uppercase tracking-widest">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-[500px]">
          {days.map((day, idx) => {
            const dateStr = `2025-05-${(idx + 1).toString().padStart(2, '0')}`;
            const dayShifts = state.shifts.filter(s => s.date === dateStr);
            
            return (
              <div key={idx} className="p-4 border-l border-white/5 last:border-l-0 hover:bg-white/[0.02] transition-colors relative">
                <div className="text-[10px] text-slate-600 font-black mb-4 flex justify-between items-center">
                  <span>{idx + 1}.05</span>
                </div>
                {dayShifts.map(shift => {
                  const user = state.users.find(u => u.id === shift.userId);
                  return (
                    <div key={shift.id} className="mb-3 p-4 bg-white/5 border-r-4 border-red-500 rounded-2xl group cursor-pointer hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-2 mb-2">
                         <img src={user?.avatar} className="w-5 h-5 rounded-full grayscale group-hover:grayscale-0 transition-all" alt="" />
                         <p className="text-xs font-black text-white">{user?.name}</p>
                       </div>
                       <p className="text-[10px] text-slate-400 font-bold mb-1">{shift.startTime} - {shift.endTime}</p>
                       <p className="text-[9px] uppercase text-red-500 font-black tracking-widest">{shift.position}</p>
                    </div>
                  );
                })}
                {dayShifts.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-5">
                    <span className="text-xs font-black -rotate-45 whitespace-nowrap">אין שיבוץ</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
