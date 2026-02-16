
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const perms = user.permissions;
  if (!perms) return null;

  const menuItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: '📊', show: perms.viewDashboard },
    { id: 'tasks', label: 'משימות', icon: '✅', show: perms.viewTasks },
    { id: 'attendance', label: 'נוכחות', icon: '⏱️', show: perms.viewAttendance },
    { id: 'schedule', label: 'סידור עבודה', icon: '📅', show: perms.viewSchedule },
    { id: 'reports', label: 'דיווח אחמ"ש', icon: '📝', show: perms.viewReporting },
    { id: 'inventory', label: 'חוסרים', icon: '📦', show: perms.viewInventory },
    { id: 'orders', label: 'הזמנות רכש', icon: '🛒', show: perms.viewOrders },
    { id: 'absences', label: 'בקשות חופש', icon: '🏖️', show: perms.viewAbsences },
    { id: 'users', label: 'ניהול צוות', icon: '👥', show: perms.viewUsers },
    { id: 'security', label: 'אבטחה', icon: '🔒', show: perms.viewSecurity },
  ];

  const filteredItems = menuItems.filter(item => item.show);

  return (
    <aside className="w-20 md:w-72 bg-[#0c0c0c] border-l border-[#222] flex flex-col h-screen sticky top-0 transition-all duration-300 z-30">
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-black brand-border rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-black/50">B.T</div>
        <div className="hidden md:block">
          <h1 className="text-xl font-black text-white tracking-tighter leading-none">מערכת משימות</h1>
          <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em]">וסידורי עבודה</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
              activeTab === item.id
                ? 'bg-white/5 text-white ring-1 ring-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                : 'text-slate-500 hover:bg-[#151515] hover:text-white'
            }`}
          >
            <span className={`text-xl transition-transform group-hover:scale-110 duration-300 ${activeTab === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
            <span className="hidden md:block font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-[#151515] p-4 rounded-3xl border border-[#222] hidden md:block">
           <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase">מצב מערכת</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
           </div>
           <div className="flex gap-1 h-1 bg-[#222] rounded-full overflow-hidden">
              <div className="w-1/3 bg-red-500"></div>
              <div className="w-1/3 bg-yellow-500"></div>
              <div className="w-1/3 bg-green-500"></div>
           </div>
           <div className="mt-3 flex flex-col gap-0.5">
             <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">B.T Enterprise v3.1.0</p>
             <p className="text-[8px] text-slate-700 font-bold">זכויות יוצרים ברהנו טסמה © 2025</p>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
