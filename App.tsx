import React, { useState, useEffect } from 'react';
import { User, Task, AppState, Role, ConnectionEvent, UserPermissions } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TasksView from './components/TasksView';
import ScheduleView from './components/ScheduleView';
import Onboarding from './components/Onboarding';
import AbsencesView from './components/AbsencesView';
import UsersView from './components/UsersView';
import AttendanceView from './components/AttendanceView';
import InventoryView from './components/InventoryView';
import OrdersView from './components/OrdersView';
import SecurityView from './components/SecurityView';
import ReportingView from './components/ReportingView';
import LoginView from './components/LoginView';
import PasswordChangeOverlay from './components/PasswordChangeOverlay';

const DEFAULT_PERMISSIONS: Record<Role, UserPermissions> = {
  MANAGER: { viewDashboard: true, viewTasks: true, viewAttendance: true, viewSchedule: true, viewReporting: true, viewInventory: true, viewOrders: true, viewAbsences: true, viewUsers: true, viewSecurity: true },
  SUPERVISOR: { viewDashboard: true, viewTasks: true, viewAttendance: true, viewSchedule: true, viewReporting: true, viewInventory: true, viewOrders: false, viewAbsences: true, viewUsers: false, viewSecurity: true },
  EMPLOYEE: { viewDashboard: false, viewTasks: true, viewAttendance: true, viewSchedule: true, viewReporting: false, viewInventory: false, viewOrders: false, viewAbsences: true, viewUsers: false, viewSecurity: false },
};

const INITIAL_USERS: User[] = [
  { id: '1', name: 'אבי', lastName: 'המנהל', tz: '123456789', phone: '0501112222', email: 'manager@work.com', role: 'MANAGER', avatar: 'https://i.pravatar.cc/150?u=1', onboarded: true, password: '1234', passwordChanged: true, permissions: DEFAULT_PERMISSIONS.MANAGER },
  { id: '2', name: 'רוני', lastName: 'אחמ"ש', tz: '987654321', phone: '0523334444', email: 'supervisor@work.com', role: 'SUPERVISOR', avatar: 'https://i.pravatar.cc/150?u=2', onboarded: true, password: '2222', passwordChanged: true, permissions: DEFAULT_PERMISSIONS.SUPERVISOR },
  { id: '3', name: 'עידן', lastName: 'עובד', tz: '556677889', phone: '0545556666', email: 'worker@work.com', role: 'EMPLOYEE', avatar: 'https://i.pravatar.cc/150?u=3', onboarded: true, password: '3333', firstTimePassword: '3333', passwordChanged: false, permissions: DEFAULT_PERMISSIONS.EMPLOYEE },
];

const INITIAL_TASKS: Task[] = [
  { id: 'dt1', title: 'בדיקת קופה ותחילת משמרת', description: 'ספירת מזומן ובדיקת תקינות מסופונים', assignedTo: '3', createdBy: '1', status: 'pending', priority: 'high', proofRequired: 'photo', dueDate: new Date().toISOString().split('T')[0], isRecurring: true },
  { id: 'dt2', title: 'ניקיון חלון ראווה', description: 'ניקוי יסודי של הזכוכית והמדפים', assignedTo: '3', createdBy: '1', status: 'pending', priority: 'medium', proofRequired: 'video', dueDate: new Date().toISOString().split('T')[0], isRecurring: true },
  { id: 'dt3', title: 'סידור סחורה שהגיעה', description: 'פתיחת ארגזים וסידור לפי תאריכי תפוגה', assignedTo: '3', createdBy: '1', status: 'pending', priority: 'medium', proofRequired: 'photo', dueDate: new Date().toISOString().split('T')[0], isRecurring: false },
];

const INITIAL_INVENTORY: any[] = [
  { id: 'i1', name: 'נייר מדפסת', status: 'available', category: 'משרד' },
  { id: 'i2', name: 'שקיות אריזה', status: 'low', category: 'כללי' },
  { id: 'i3', name: 'חומר חיטוי', status: 'out_of_stock', category: 'ניקיון' },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    users: INITIAL_USERS,
    tasks: INITIAL_TASKS,
    shifts: [],
    absences: [],
    attendance: [],
    inventory: INITIAL_INVENTORY,
    orders: [],
    reports: [],
    connectionEvents: [],
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (appState.currentUser && !appState.currentUser.onboarded) {
      setShowOnboarding(true);
    }
  }, [appState.currentUser?.id]);

  const handleLogin = (user: User, remember: boolean) => {
    const event: ConnectionEvent = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: `${user.name} ${user.lastName}`,
      type: 'login',
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    };
    setAppState(prev => ({ ...prev, currentUser: user, connectionEvents: [event, ...prev.connectionEvents].slice(0, 10) }));
  };

  const handleLogout = () => setAppState(prev => ({ ...prev, currentUser: null }));
  const handleOnboardingComplete = () => {
    if (!appState.currentUser) return;
    const updatedUser = { ...appState.currentUser, onboarded: true };
    setAppState(prev => ({
      ...prev,
      currentUser: updatedUser,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
    setShowOnboarding(false);
  };

  const handlePasswordChanged = (newPassword: string) => {
    if (!appState.currentUser) return;
    const updatedUser = { ...appState.currentUser, password: newPassword, passwordChanged: true };
    setAppState(prev => ({
      ...prev,
      currentUser: updatedUser,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
    setShowPasswordChange(false);
    if (!updatedUser.onboarded) setShowOnboarding(true);
  };

  const renderContent = () => {
    const perms = appState.currentUser?.permissions || DEFAULT_PERMISSIONS[appState.currentUser?.role || 'EMPLOYEE'];
    switch (activeTab) {
      case 'dashboard': return perms.viewDashboard ? <Dashboard state={appState} setAppState={setAppState} setNotification={setNotification} /> : <TasksView state={appState} setAppState={setAppState} />;
      case 'tasks': return perms.viewTasks ? <TasksView state={appState} setAppState={setAppState} /> : null;
      case 'schedule': return perms.viewSchedule ? <ScheduleView state={appState} setAppState={setAppState} /> : null;
      case 'absences': return perms.viewAbsences ? <AbsencesView state={appState} setAppState={setAppState} /> : null;
      case 'users': return perms.viewUsers ? <UsersView state={appState} setAppState={setAppState} /> : null;
      case 'attendance': return perms.viewAttendance ? <AttendanceView state={appState} setAppState={setAppState} /> : null;
      case 'inventory': return perms.viewInventory ? <InventoryView state={appState} setAppState={setAppState} setNotification={setNotification} /> : null;
      case 'orders': return perms.viewOrders ? <OrdersView state={appState} setAppState={setAppState} /> : null;
      case 'security': return perms.viewSecurity ? <SecurityView state={appState} setAppState={setAppState} /> : null;
      case 'reports': return perms.viewReporting ? <ReportingView state={appState} setAppState={setAppState} /> : null;
      default: return <TasksView state={appState} setAppState={setAppState} />;
    }
  };

  if (!appState.currentUser) return <LoginView users={appState.users} onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-slate-100 selection:bg-red-500/30" dir="rtl">
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-12 duration-500">
          <div className="bg-[#1a1a1a] border border-red-500/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <p className="text-sm font-black text-white">{notification}</p>
          </div>
        </div>
      )}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={appState.currentUser} />
      <div className="flex-1 flex flex-col">
        <Header user={appState.currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">{renderContent()}</main>
      </div>
      {showPasswordChange && <PasswordChangeOverlay onComplete={handlePasswordChanged} />}
      {showOnboarding && !showPasswordChange && <Onboarding onComplete={handleOnboardingComplete} userName={appState.currentUser?.name || ''} />}
    </div>
  );
};

export default App;
