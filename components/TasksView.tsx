
import React, { useState } from 'react';
import { AppState, Task, ProofType } from '../types';

interface TasksViewProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const TasksView: React.FC<TasksViewProps> = ({ state, setAppState }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'today' | 'future' | 'completed' | 'pending_approval' | 'all'>('today');
  const isManager = state.currentUser?.role === 'MANAGER';
  const isSupervisor = state.currentUser?.role === 'SUPERVISOR';
  const canCreateTasks = isManager || (isSupervisor && state.currentUser?.canAssignTasks);
  const todayStr = new Date().toISOString().split('T')[0];
  
  const baseTasks = isManager 
    ? state.tasks 
    : state.tasks.filter(t => t.assignedTo === state.currentUser?.id || (isSupervisor && t.createdBy === state.currentUser?.id));

  const filteredTasks = baseTasks.filter(t => {
    if (filter === 'today') return t.dueDate === todayStr && t.status !== 'completed' && t.status !== 'pending_manager_approval';
    if (filter === 'future') return t.dueDate > todayStr && t.status !== 'completed' && t.status !== 'pending_manager_approval';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'pending_approval') return t.status === 'pending_manager_approval';
    return true;
  });

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    assignedTo: state.users.find(u => u.role === 'EMPLOYEE')?.id || '',
    priority: 'medium',
    proofRequired: 'none',
    dueDate: todayStr,
    isRecurring: false
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateTasks) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title || 'משימה חדשה',
      description: newTask.description || '',
      assignedTo: newTask.assignedTo || '',
      createdBy: state.currentUser?.id || '',
      status: isManager ? 'pending' : 'pending_manager_approval',
      priority: (newTask.priority as any) || 'medium',
      proofRequired: (newTask.proofRequired as any) || 'none',
      dueDate: newTask.dueDate || todayStr,
      isRecurring: !!newTask.isRecurring
    };
    setAppState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setShowAddModal(false);
    setNewTask({ title: '', description: '', assignedTo: state.users.find(u => u.role === 'EMPLOYEE')?.id, priority: 'medium', proofRequired: 'none', dueDate: todayStr, isRecurring: false });
  };

  const handleStatusUpdate = async (taskId: string, status: Task['status'], proof?: string) => {
    let location = undefined;
    const now = new Date().toLocaleString('he-IL');

    if (status === 'submitted') {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (err) {
        console.error("Location capture failed", err);
      }
    }

    setAppState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { 
        ...t, 
        status, 
        proofUrl: proof || t.proofUrl,
        completionLocation: location || t.completionLocation,
        completionTimestamp: status === 'submitted' ? now : t.completionTimestamp
      } : t)
    }));
  };

  const handleFileUpload = (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleStatusUpdate(taskId, 'submitted', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white">מרכז המשימות</h2>
          <p className="text-slate-500 text-sm font-bold">
            {isManager ? 'ניהול ופיקוח על ביצועי הצוות' : 'המשימות שהוגדרו לך להיום'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto no-print">
          <div className="glass-effect p-1 rounded-2xl flex gap-1">
            <button onClick={() => setFilter('today')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${filter === 'today' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>היום</button>
            <button onClick={() => setFilter('completed')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${filter === 'completed' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>בוצעו</button>
            {isManager && (
              <button onClick={() => setFilter('pending_approval')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${filter === 'pending_approval' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>לאישור מנהל</button>
            )}
          </div>

          {canCreateTasks && (
            <button onClick={() => setShowAddModal(true)} className="pro-gradient hover:scale-105 active:scale-95 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-red-500/20 flex items-center gap-2 border border-white/10 whitespace-nowrap">
              <span>➕</span> פתח משימה
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-32 text-center glass-effect rounded-[48px] border-2 border-dashed border-white/5">
            <span className="text-6xl block mb-6 opacity-10">📋</span>
            <p className="text-lg font-black text-slate-700 uppercase tracking-widest">אין משימות ברשימה</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`glass-effect rounded-[40px] p-8 shadow-2xl flex flex-col transition-all duration-500 group ${task.status === 'completed' ? 'opacity-40 grayscale' : ''}`}>
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                  task.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                }`}>
                  {task.priority === 'high' ? 'דחוף' : 'רגיל'}
                </span>
                <span className="text-[10px] text-slate-500 font-black">{task.dueDate === todayStr ? 'היום' : task.dueDate}</span>
              </div>
              
              <h4 className="font-black text-white text-xl mb-3 group-hover:text-red-400 transition-colors">{task.title}</h4>
              <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed line-clamp-3">{task.description}</p>

              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-3">
                  <img src={state.users.find(u => u.id === task.assignedTo)?.avatar} className="w-8 h-8 rounded-xl border border-white/10" alt="" />
                  <span className="text-xs font-black text-slate-300">{state.users.find(u => u.id === task.assignedTo)?.name}</span>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {state.currentUser?.id === task.assignedTo && task.status === 'pending' && (
                    <>
                      {task.proofRequired !== 'none' ? (
                        <label className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black cursor-pointer transition-all shadow-lg shadow-red-500/20 flex items-center gap-2">
                          <span>📸</span> {task.proofRequired === 'photo' ? 'צילום תמונה' : 'צילום וידאו'}
                          <input 
                            type="file" 
                            accept={task.proofRequired === 'photo' ? "image/*" : "video/*"} 
                            capture="environment" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(task.id, e)} 
                          />
                        </label>
                      ) : (
                        <button onClick={() => handleStatusUpdate(task.id, 'submitted')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all">
                          סיום משימה
                        </button>
                      )}
                    </>
                  )}

                  {isManager && task.status === 'submitted' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleStatusUpdate(task.id, 'completed')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">אשר</button>
                      <button onClick={() => handleStatusUpdate(task.id, 'pending')} className="bg-red-600/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-[10px] font-black">דחה</button>
                    </div>
                  )}

                  {task.status === 'completed' && <span className="text-green-500 text-[10px] font-black uppercase">✅ בוצע</span>}
                </div>
              </div>

              {task.proofUrl && (
                <div className="mt-6 rounded-2xl overflow-hidden border border-white/5 relative group/proof">
                   {task.proofRequired === 'video' ? (
                     <div className="bg-black h-32 flex items-center justify-center text-red-500">▶️ סרטון הוכחה</div>
                   ) : (
                     <img src={task.proofUrl} className="w-full h-32 object-cover opacity-60" alt="הוכחה" />
                   )}
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/proof:opacity-100 transition-opacity bg-black/40">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 px-3 py-1.5 rounded-lg">צפה בהוכחה</span>
                   </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-6">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-[48px] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-500">
            <div className="pro-gradient p-10 text-white flex justify-between items-center relative">
              <h3 className="text-3xl font-black">הגדרת משימה חדשה</h3>
              <button onClick={() => setShowAddModal(false)} className="text-2xl hover:bg-white/10 rounded-2xl w-12 h-12 flex items-center justify-center transition-colors">✕</button>
            </div>
            <form onSubmit={handleAddTask} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 mr-1">כותרת המשימה</label>
                <input required type="text" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold" placeholder="למשל: סגירת קופה" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 mr-1">תיאור והוראות</label>
                <textarea className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none h-28 font-medium" placeholder="מה בדיוק צריך לבצע?" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 mr-1">אחראי ביצוע</label>
                  <select className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none appearance-none font-bold" value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
                    {state.users.filter(u => u.role === 'EMPLOYEE').map(user => (
                      <option key={user.id} value={user.id}>{user.name} {user.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 mr-1">דרישת הוכחה (מצלמה)</label>
                  <select className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none appearance-none font-bold" value={newTask.proofRequired} onChange={e => setNewTask({...newTask, proofRequired: e.target.value as ProofType})}>
                    <option value="none">ללא צילום</option>
                    <option value="photo">צילום תמונה בסיום</option>
                    <option value="video">צילום וידאו בסיום</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 pro-gradient text-white font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-98 transition-all shadow-xl shadow-red-600/20 text-lg border border-white/10">שגר משימה</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 border border-white/10 text-slate-400 font-black py-5 rounded-2xl hover:bg-white/10 transition-all">ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
