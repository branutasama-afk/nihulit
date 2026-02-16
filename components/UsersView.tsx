
import React, { useState } from 'react';
import { AppState, User, Role, UserPermissions } from '../types';

interface UsersViewProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const DEFAULT_PERMS: Record<Role, UserPermissions> = {
  MANAGER: {
    viewDashboard: true, viewTasks: true, viewAttendance: true, viewSchedule: true,
    viewReporting: true, viewInventory: true, viewOrders: true, viewAbsences: true,
    viewUsers: true, viewSecurity: true
  },
  SUPERVISOR: {
    viewDashboard: true, viewTasks: true, viewAttendance: true, viewSchedule: true,
    viewReporting: true, viewInventory: true, viewOrders: false, viewAbsences: true,
    viewUsers: false, viewSecurity: true
  },
  EMPLOYEE: {
    viewDashboard: false, viewTasks: true, viewAttendance: true, viewSchedule: true,
    viewReporting: false, viewInventory: false, viewOrders: false, viewAbsences: true,
    viewUsers: false, viewSecurity: true
  }
};

const UsersView: React.FC<UsersViewProps> = ({ state, setAppState }) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const isManager = state.currentUser?.role === 'MANAGER';
  
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    lastName: '',
    tz: '',
    phone: '',
    email: '',
    role: 'EMPLOYEE'
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const firstCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name || '',
      lastName: newUser.lastName || '',
      tz: newUser.tz || '',
      phone: newUser.phone || '',
      email: newUser.email || `user_${Date.now()}@bt.local`, // Auto-generating internal email for now
      role: (newUser.role as Role) || 'EMPLOYEE',
      avatar: `https://picsum.photos/seed/${Math.random()}/100`,
      onboarded: false,
      password: firstCode,
      firstTimePassword: firstCode,
      passwordChanged: false, // Mandatory for new users
      canAssignTasks: newUser.role === 'SUPERVISOR',
      permissions: DEFAULT_PERMS[newUser.role as Role] || DEFAULT_PERMS.EMPLOYEE
    };
    
    setAppState(prev => ({ ...prev, users: [...prev.users, user] }));
    setShowAddUserModal(false);
    setNewUser({ name: '', lastName: '', tz: '', phone: '', email: '', role: 'EMPLOYEE' });
    
    alert(`עובד נוסף בהצלחה!\nשם משתמש לכניסה: ${user.phone}\nסיסמא ראשונית: ${firstCode}`);
  };

  const togglePermission = (userId: string, key: keyof UserPermissions) => {
    if (!isManager) return;
    setAppState(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === userId) {
          const newPerms = { ...u.permissions!, [key]: !u.permissions![key] };
          return { ...u, permissions: newPerms };
        }
        return u;
      })
    }));
  };

  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <span className="text-8xl mb-8 grayscale opacity-20">🔒</span>
        <h2 className="text-3xl font-black text-white">גישת מנהל בלבד</h2>
        <p className="text-slate-500 font-bold mt-2">אין לך הרשאות לצפות או לנהל את צוות העובדים</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">ניהול צוות עובדים</h2>
          <p className="text-slate-400 text-sm font-bold">הוספת עובדים חדשים, הגדרת תפקידים והרשאות צפייה</p>
        </div>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="pro-gradient hover:scale-[1.02] text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-red-500/20 flex items-center gap-2 border border-white/10"
        >
          <span className="text-lg">👤</span> קליטת עובד חדש
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.users.map(user => (
          <div key={user.id} className="bg-[#1a1a1a] p-8 rounded-[40px] shadow-lg border border-[#333] flex flex-col hover:border-red-500/50 transition-all duration-300 group">
            <div className="relative mb-6 mx-auto">
              <img src={user.avatar} className="w-24 h-24 rounded-[32px] border-4 border-[#222] shadow-xl group-hover:scale-110 transition-transform" alt={user.name} />
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 border-4 border-[#1a1a1a] rounded-2xl flex items-center justify-center text-xs font-black text-white ${user.role === 'MANAGER' ? 'bg-red-600' : user.role === 'SUPERVISOR' ? 'bg-yellow-600' : 'bg-green-600'}`}>
                {user.role === 'MANAGER' ? 'M' : user.role === 'SUPERVISOR' ? 'S' : 'E'}
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="font-black text-2xl text-white">{user.name} {user.lastName}</h4>
              <p className="text-xs text-red-400 font-black uppercase tracking-widest mt-1">
                {user.role === 'MANAGER' ? 'מנהל מערכת' : user.role === 'SUPERVISOR' ? 'אחראי משמרת' : 'חבר צוות'}
              </p>
              <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">פרטי כניסה</p>
                <p className="text-xs text-slate-300 font-bold">נייד: {user.phone}</p>
                <p className="text-xs text-slate-300 font-bold">ת.ז: {user.tz}</p>
              </div>
            </div>

            {/* Granular Permission Toggles */}
            <div className="mt-6 pt-6 border-t border-[#333]">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">הרשאות צפייה בתפריט</p>
              <div className="grid grid-cols-2 gap-2">
                {user.permissions && Object.keys(user.permissions).map((key) => (
                  <button 
                    key={key}
                    onClick={() => togglePermission(user.id, key as keyof UserPermissions)}
                    className={`text-[9px] font-black px-2 py-1.5 rounded-xl border transition-all ${user.permissions![key as keyof UserPermissions] ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 opacity-50'}`}
                  >
                    {key.replace('view', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-[48px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="pro-gradient p-10 text-white flex justify-between items-center relative overflow-hidden">
              <div>
                <h3 className="text-3xl font-black">קליטת עובד חדש</h3>
                <p className="text-red-100 text-xs font-bold mt-1 uppercase tracking-widest">הגדרת זהות ופרטי כניסה לנייד</p>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="text-2xl hover:bg-white/10 rounded-2xl w-12 h-12 flex items-center justify-center transition-colors">✕</button>
            </div>
            <form onSubmit={handleAddUser} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">שם פרטי</label>
                  <input required type="text" className="w-full bg-[#222] border border-[#333] text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold" placeholder="ישראל" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">שם משפחה</label>
                  <input required type="text" className="w-full bg-[#222] border border-[#333] text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold" placeholder="ישראלי" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">מספר נייד (לכניסה)</label>
                  <input required type="tel" className="w-full bg-[#222] border border-[#333] text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold" placeholder="050-0000000" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">תעודת זהות</label>
                  <input required type="text" className="w-full bg-[#222] border border-[#333] text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold" placeholder="מזהה פנימי" value={newUser.tz} onChange={e => setNewUser({...newUser, tz: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mr-1">תפקיד והרשאות בסיס</label>
                <select className="w-full bg-[#222] border border-[#333] text-white rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer font-bold" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                  <option value="EMPLOYEE">עובד רגיל (משימות, נוכחות, חופש)</option>
                  <option value="SUPERVISOR">אחראי משמרת (דיווח, חוסרים, ניהול משימות)</option>
                  <option value="MANAGER">מנהל מערכת (הכל)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 pro-gradient text-white font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-98 transition-all shadow-xl shadow-red-600/20 text-lg border border-white/10">צור חשבון עובד</button>
                <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 bg-transparent border border-[#333] text-slate-400 font-black py-5 rounded-2xl hover:bg-[#222] transition-all">ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
