
import React, { useState } from 'react';
import { AppState, TimeEntry, ConnectionEvent } from '../types';

interface DashboardProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setNotification: (msg: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setAppState, setNotification }) => {
  const isManager = state.currentUser?.role === 'MANAGER';
  const isSupervisor = state.currentUser?.role === 'SUPERVISOR';
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [clockActionLoading, setClockActionLoading] = useState(false);

  const pendingTasks = state.tasks.filter(t => t.status !== 'completed').length;
  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const waitingApproval = state.tasks.filter(t => t.status === 'submitted').length;
  
  // High-priority alerts including staffing gaps
  const shortages = state.inventory.filter(i => i.status === 'out_of_stock');
  const criticalReports = state.reports.filter(r => 
    r.severity === 'high' || 
    r.type === 'staffing_shortage' || 
    r.type === 'shortage' || 
    r.type === 'employee_issue' || 
    r.type === 'monthly_summary'
  );

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

  const handleClockAction = async (type: 'in' | 'out') => {
    if (!selectedEmployeeId) return;
    setClockActionLoading(true);
    
    const pos = await getPosition();
    const location = pos ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : undefined;
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    const employee = state.users.find(u => u.id === selectedEmployeeId);

    if (type === 'in') {
      const entry: TimeEntry = {
        id: Math.random().toString(36).substr(2, 9),
        userId: selectedEmployeeId,
        date: today,
        clockIn: now,
        clockInLocation: location
      };
      const event: ConnectionEvent = {
        id: Math.random().toString(36).substr(2, 9),
        userId: selectedEmployeeId,
        userName: `${employee?.name} ${employee?.lastName}`,
        type: 'clock_in',
        timestamp: now,
        location: location
      };
      setAppState(prev => ({ 
        ...prev, 
        attendance: [entry, ...prev.attendance],
        connectionEvents: [event, ...prev.connectionEvents].slice(0, 15)
      }));
      setNotification(`העובד/ת ${employee?.name} נכנס/ה למשמרת ב-${now}${location ? ' (מיקום תועד)' : ''}`);
    } else {
      const event: ConnectionEvent = {
        id: Math.random().toString(36).substr(2, 9),
        userId: selectedEmployeeId,
        userName: `${employee?.name} ${employee?.lastName}`,
        type: 'clock_out',
        timestamp: now,
        location: location
      };
      setAppState(prev => ({
        ...prev,
        attendance: prev.attendance.map(a => 
          (a.userId === selectedEmployeeId && a.date === today && !a.clockOut) 
          ? { ...a, clockOut: now, clockOutLocation: location } 
          : a
        ),
        connectionEvents: [event, ...prev.connectionEvents].slice(0, 15)
      }));
      setNotification(`העובד/ת ${employee?.name} יצא/ה מהמשמרת ב-${now}${location ? ' (מיקום תועד)' : ''}`);
    }
    
    setClockActionLoading(false);
    setSelectedEmployeeId('');
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">לוח בקרה</h2>
          <p className="text-slate-500 text-sm font-bold">ניהול מנהלים • חוסרים • סיכומי עובדים</p>
        </div>
        <div className="flex gap-3 no-print">
            <button onClick={() => window.print()} className="glass-effect px-8 py-4 rounded-2xl hover:text-red-400 transition-all border border-white/5 font-black text-xs uppercase tracking-widest">🖨️ הדפסת דוח מצב</button>
        </div>
      </div>

      {isManager && (shortages.length > 0 || criticalReports.length > 0) && (
        <div className="animate-in slide-in-from-top-4 duration-700">
          <div className="bg-red-500/10 border border-red-500/30 rounded-[48px] p-10 mb-4 relative overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.1)]">
            <div className="absolute top-[-20%] right-[-10%] p-4 opacity-5 pointer-events-none">
              <span className="text-[200px]">🚨</span>
            </div>
            <h3 className="text-red-500 text-2xl font-black mb-8 flex items-center gap-4">
              <span className="animate-pulse text-3xl">🔔</span> התראות וחוסרים דחופים
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shortages.map(item => (
                <div key={item.id} className="bg-red-600 border border-red-400 p-6 rounded-[32px] shadow-2xl shadow-red-900/40 transform hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/20 px-3 py-1.5 rounded-lg">חוסר במלאי</span>
                  </div>
                  <p className="text-white font-black text-xl mb-1">{item.name}</p>
                  <p className="text-red-100 text-[10px] font-bold uppercase opacity-70">דווח ע"י: {item.lastReportedBy || 'מערכת'}</p>
                </div>
              ))}
              {criticalReports.map(report => (
                <div key={report.id} className={`p-6 rounded-[32px] backdrop-blur-md border shadow-xl transition-all ${
                  report.type === 'monthly_summary' ? 'bg-blue-600/20 border-blue-500/30' : 
                  report.type === 'staffing_shortage' ? 'bg-red-600 border-red-400 shadow-red-900/40' :
                  'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                      report.type === 'monthly_summary' ? 'bg-blue-500/20 text-blue-400' : 
                      report.type === 'staffing_shortage' ? 'bg-black/20 text-white' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {report.type === 'monthly_summary' ? 'סיכום חודשי' : 
                       report.type === 'staffing_shortage' ? 'חוסר בכ"א 👥' : 
                       report.type === 'shortage' ? 'חוסר בציוד' : 'בעיית משמעת'}
                    </span>
                    <span className={`text-[10px] font-bold ${report.type === 'staffing_shortage' ? 'text-red-100' : 'text-slate-500'}`}>{report.date.split(',')[0]}</span>
                  </div>
                  <p className={`${report.type === 'staffing_shortage' ? 'text-white' : 'text-white'} font-bold text-base mb-2 line-clamp-2`}>{report.description}</p>
                  {report.targetUserId && (
                    <p className={`text-[11px] font-black mb-4 ${report.type === 'monthly_summary' ? 'text-blue-400' : report.type === 'staffing_shortage' ? 'text-red-100 opacity-90' : 'text-red-400'}`}>
                       {report.type === 'monthly_summary' ? 'סיכום עבור: ' : 'רלוונטי ל: '} {report.targetUserId}
                    </p>
                  )}
                  <div className={`flex items-center gap-3 mt-auto pt-4 border-t ${report.type === 'staffing_shortage' ? 'border-red-400/30' : 'border-white/5'}`}>
                    <img src={state.users.find(u => u.id === report.reportedBy)?.avatar} className="w-8 h-8 rounded-xl border border-white/10" alt="" />
                    <span className={`text-[10px] font-black ${report.type === 'staffing_shortage' ? 'text-red-100' : 'text-slate-400'}`}>דווח ע"י: {state.users.find(u => u.id === report.reportedBy)?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-effect p-10 rounded-[48px] border border-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 pro-gradient"></div>
          <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
            <span className="text-3xl">⏱️</span> עמדת נוכחות
          </h3>
          
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 mr-2">בחר עובד לדיווח</label>
              <select 
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-3xl p-5 focus:ring-4 focus:ring-red-500/20 outline-none appearance-none cursor-pointer font-black transition-all text-xl"
              >
                <option value="" className="bg-[#121212]">-- בחר עובד --</option>
                {state.users.map(u => (
                  <option key={u.id} value={u.id} className="bg-[#121212]">{u.name} {u.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={() => handleClockAction('in')}
                disabled={!selectedEmployeeId || clockActionLoading}
                className="pro-gradient text-white font-black py-6 rounded-3xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 border border-white/10 text-xl"
              >
                {clockActionLoading ? <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>⏺️ כניסה</span>}
              </button>
              <button 
                onClick={() => handleClockAction('out')}
                disabled={!selectedEmployeeId || clockActionLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-3xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 border border-white/10 text-xl"
              >
                {clockActionLoading ? <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>⏹️ יציאה</span>}
              </button>
            </div>
          </div>
          <p className="mt-8 text-[10px] text-slate-600 font-bold text-center italic tracking-widest">תיעוד גיאוגרפי מתבצע אוטומטית</p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <StatCard 
            title={isManager ? "משימות פעילות" : "משימות שלי"} 
            value={pendingTasks.toString()} 
            icon="📋" 
            color="red" 
          />
          <StatCard 
            title="ביצועים שהושלמו" 
            value={completedTasks.toString()} 
            icon="🏁" 
            color="green" 
          />
          <StatCard 
            title={isManager ? "ממתין לבדיקה" : "בבדיקה"} 
            value={waitingApproval.toString()} 
            icon="⏳" 
            color="orange" 
          />
          {(isManager || isSupervisor) && (
            <StatCard 
              title='דוחות וסיכומים' 
              value={state.reports.length.toString()} 
              icon="📝" 
              color="red" 
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-effect p-12 rounded-[56px] shadow-2xl border border-white/5 transition-all duration-500 group">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black flex items-center gap-5">
              <span className="text-red-500 text-4xl">🚀</span>
              <span>משימות בביצוע</span>
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] text-red-400 font-black uppercase tracking-[0.3em]">Live Feed</span>
            </div>
          </div>
          <div className="space-y-6">
            {state.tasks.slice(0, 6).map(task => (
              <div key={task.id} className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/5 hover:bg-white/10 transition-all group/item cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {task.proofRequired !== 'none' ? '📸' : '📄'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xl text-white group-hover/item:text-red-400 transition-colors">{task.title}</span>
                    <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-1">
                      {isManager ? `מבצע: ${state.users.find(u => u.id === task.assignedTo)?.name}` : 'משימה אישית'}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <span className={`text-[10px] px-5 py-2.5 rounded-xl font-black uppercase tracking-widest border ${
                    task.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    task.status === 'submitted' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {task.status === 'completed' ? 'בוצע' : 
                     task.status === 'submitted' ? 'בבדיקה' : 'בביצוע'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect p-12 rounded-[56px] shadow-2xl border border-white/5">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black flex items-center gap-5">
              <span className="text-red-500 text-4xl">📡</span>
              <span>פעילות אחרונה</span>
            </h3>
          </div>
          {!isManager ? (
             <div className="flex flex-col items-center justify-center py-32 text-slate-700 bg-white/5 rounded-[48px] border border-dashed border-white/10">
                <span className="text-6xl mb-8 grayscale opacity-20">🔒</span>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-center px-8">הגישה לנתוני פעילות מוגבלת</p>
             </div>
          ) : (
            <div className="space-y-6">
              {state.connectionEvents.map(event => (
                <div key={event.id} className={`flex items-center gap-6 p-6 rounded-[32px] border transition-all hover:bg-white/5 ${
                  (event.type === 'login' || event.type === 'clock_in') ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10 opacity-80'
                }`}>
                   <div className={`w-3 h-3 rounded-full ${(event.type === 'login' || event.type === 'clock_in') ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}></div>
                   <div className="flex flex-col flex-1">
                    <span className="font-black text-white text-base">{event.userName}</span>
                    <span className="text-[11px] text-slate-500 font-black uppercase mt-0.5 tracking-tight">
                      {event.type === 'login' ? 'התחבר/ה למערכת' : 
                       event.type === 'clock_in' ? 'נכנס/ה למשמרת' :
                       event.type === 'clock_out' ? 'יצא/ה מהמשמרת' : 'התנתק/ה'}
                    </span>
                    {event.location && (
                      <a 
                        href={`https://www.google.com/maps?q=${event.location.lat},${event.location.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-blue-400 font-bold hover:underline flex items-center gap-1 mt-2 w-fit"
                      >
                        📍 צפה במיקום
                      </a>
                    )}
                   </div>
                   <span className="text-[10px] text-slate-600 font-black">{event.timestamp}</span>
                </div>
              ))}
              {state.connectionEvents.length === 0 && (
                 <p className="text-center text-slate-600 font-bold text-sm py-16">אין פעילות מתועדת</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => {
  const colorMap: any = {
    red: 'text-red-400 bg-red-600/10 shadow-red-500/5',
    green: 'text-green-400 bg-green-600/10 shadow-green-500/5',
    orange: 'text-orange-400 bg-orange-600/10 shadow-orange-500/5',
  };

  return (
    <div className={`glass-effect p-10 rounded-[48px] border border-white/5 flex items-center gap-10 group hover:scale-[1.05] transition-all duration-500 shadow-2xl`}>
      <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center text-4xl shadow-2xl ${colorMap[color] || colorMap.red} transition-all group-hover:rotate-6 group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">{title}</p>
        <p className="text-5xl font-black text-white tracking-tighter leading-none">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
