
import React, { useState } from 'react';
import { AppState, IssueReport } from '../types';

interface ReportingViewProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const ReportingView: React.FC<ReportingViewProps> = ({ state, setAppState }) => {
  const [showModal, setShowModal] = useState(false);
  const isManager = state.currentUser?.role === 'MANAGER';
  const isSupervisor = state.currentUser?.role === 'SUPERVISOR';

  const [newReport, setNewReport] = useState<Partial<IssueReport>>({
    type: 'shortage',
    description: '',
    severity: 'medium',
    targetUserId: ''
  });

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    const report: IssueReport = {
      id: Math.random().toString(36).substr(2, 9),
      reportedBy: state.currentUser?.id || '',
      type: newReport.type as any,
      description: newReport.description || '',
      date: new Date().toLocaleString('he-IL'),
      severity: newReport.severity as any,
      targetUserId: newReport.targetUserId
    };

    setAppState(prev => ({ ...prev, reports: [report, ...prev.reports] }));
    setShowModal(false);
    setNewReport({ type: 'shortage', description: '', severity: 'medium', targetUserId: '' });
  };

  const getTargetName = (targetId: string | undefined) => {
    if (!targetId) return '';
    // Since we now use manual text input, the "id" field actually holds the name string.
    return targetId;
  };

  const getReportTypeLabel = (type: string) => {
    switch(type) {
      case 'shortage': return '🚨 חוסר בציוד';
      case 'staffing_shortage': return '👥 חוסר בכוח אדם';
      case 'employee_issue': return '👤 בעיית משמעת';
      case 'monthly_summary': return '📊 סיכום חודשי';
      case 'technical': return '🛠️ תקלה טכנית';
      default: return '📝 דיווח כללי';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">דוחות ודיווחים</h2>
          <p className="text-slate-400 text-sm font-bold">מעקב אחר חוסרים, בעיות משמעת וסיכומים חודשיים</p>
        </div>
        
        <div className="flex items-center gap-3 no-print">
          {(isSupervisor || isManager) && (
            <button onClick={() => setShowModal(true)} className="pro-gradient hover:scale-105 text-white px-8 py-4 rounded-3xl font-black transition-all shadow-2xl flex items-center gap-2 border border-white/10">
              <span>✍️</span> צור דיווח חדש
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {state.reports.length === 0 ? (
          <div className="py-32 text-center glass-effect rounded-[48px] border-2 border-dashed border-white/5">
            <span className="text-6xl block mb-6 opacity-20">📋</span>
            <p className="text-xl font-black text-slate-700 uppercase tracking-widest">אין דיווחים מתועדים</p>
          </div>
        ) : (
          state.reports.map(report => (
            <div key={report.id} className={`glass-effect rounded-[40px] p-8 border transition-all duration-500 hover:scale-[1.01] ${
              report.type === 'monthly_summary' ? 'border-blue-500/30 bg-blue-500/5' :
              report.severity === 'high' ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'
            }`}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${
                      report.type === 'monthly_summary' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      report.type === 'staffing_shortage' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      report.type === 'shortage' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-slate-500/10 text-slate-400 border-white/5'
                    }`}>
                      {getReportTypeLabel(report.type)}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">{report.date}</span>
                  </div>
                  
                  <h4 className="text-2xl font-black text-white mb-4">
                    {report.type === 'monthly_summary' ? `סיכום ביצועים: ${report.targetUserId}` : 
                     report.type === 'employee_issue' ? `דיווח משמעת: ${report.targetUserId}` :
                     report.type === 'staffing_shortage' ? `חוסר בכ"א: ${report.targetUserId || 'כללי'}` :
                     'דיווח מערכת כללי'}
                  </h4>
                  
                  <p className="text-slate-300 text-lg leading-relaxed font-medium whitespace-pre-wrap">{report.description}</p>
                  
                  {report.targetUserId && (
                    <div className="mt-6 flex items-center gap-3 bg-black/30 w-fit px-5 py-2.5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">עובד/ת רלוונטי:</span>
                      <span className="text-sm text-white font-black">{report.targetUserId}</span>
                    </div>
                  )}
                </div>

                <div className="md:w-64 flex flex-col justify-center items-center md:items-end gap-3 md:border-r border-white/5 md:pr-8">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">דווח על ידי</p>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-white leading-none">{state.users.find(u => u.id === report.reportedBy)?.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">אחראי משמרת</p>
                    </div>
                    <img src={state.users.find(u => u.id === report.reportedBy)?.avatar} className="w-12 h-12 rounded-2xl border border-white/10" alt="" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-50 p-6">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-[56px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-500">
            <div className="pro-gradient p-12 text-white flex justify-between items-center relative">
              <div>
                <h3 className="text-4xl font-black">דיווח חדש</h3>
                <p className="text-slate-300 font-bold mt-2">הזן פרטים מלאים לידיעת המנהל</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-2xl hover:bg-white/10 rounded-3xl w-14 h-14 flex items-center justify-center transition-all">✕</button>
            </div>
            <form onSubmit={handleAddReport} className="p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 mr-2">סוג הדיווח</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-5 focus:ring-4 focus:ring-blue-500/20 outline-none appearance-none font-black text-lg cursor-pointer" 
                    value={newReport.type} 
                    onChange={e => setNewReport({...newReport, type: e.target.value as any})}
                  >
                    <option value="shortage" className="bg-[#121212]">🚨 חוסר בציוד (מלאי שנגמר)</option>
                    <option value="staffing_shortage" className="bg-[#121212]">👥 חוסר בכוח אדם</option>
                    <option value="employee_issue" className="bg-[#121212]">👤 בעיית משמעת עובד</option>
                    <option value="monthly_summary" className="bg-[#121212]">📊 סיכום חודשי לעובד</option>
                    <option value="technical" className="bg-[#121212]">🛠️ תקלה טכנית</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 mr-2">רמת דחיפות</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-5 focus:ring-4 focus:ring-blue-500/20 outline-none appearance-none font-black text-lg cursor-pointer" 
                    value={newReport.severity} 
                    onChange={e => setNewReport({...newReport, severity: e.target.value as any})}
                  >
                    <option value="low" className="bg-[#121212]">רגיל / לידיעה</option>
                    <option value="medium" className="bg-[#121212]">חשוב</option>
                    <option value="high" className="bg-[#121212]">דחוף מאוד 🚨</option>
                  </select>
                </div>
              </div>

              {(newReport.type === 'employee_issue' || newReport.type === 'monthly_summary' || newReport.type === 'staffing_shortage') && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 mr-2">שם העובד/ת (הקלדה ידנית)</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-5 focus:ring-4 focus:ring-blue-500/20 outline-none font-black text-xl placeholder:text-slate-800" 
                    placeholder="הזן שם מלא..." 
                    value={newReport.targetUserId} 
                    onChange={e => setNewReport({...newReport, targetUserId: e.target.value})} 
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 mr-2">תוכן הדיווח / פירוט</label>
                <textarea 
                  required 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-[32px] p-6 focus:ring-4 focus:ring-blue-500/20 outline-none h-48 custom-scrollbar font-bold text-lg placeholder:text-slate-800" 
                  placeholder="פרט כאן את כל המידע הרלוונטי..." 
                  value={newReport.description} 
                  onChange={e => setNewReport({...newReport, description: e.target.value})} 
                />
              </div>

              <div className="flex gap-6 pt-4">
                <button type="submit" className="flex-1 pro-gradient text-white font-black py-6 rounded-3xl hover:scale-[1.02] active:scale-98 transition-all shadow-2xl text-xl border border-white/10">שדר דיווח למנהל</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 border border-white/10 text-slate-400 font-black py-6 rounded-3xl hover:bg-white/10 transition-all text-xl">ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingView;
