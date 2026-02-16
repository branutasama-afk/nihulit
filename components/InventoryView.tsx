
import React from 'react';
import { AppState, InventoryItem } from '../types';

interface InventoryViewProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setNotification: (msg: string | null) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ state, setAppState, setNotification }) => {
  const isManager = state.currentUser?.role === 'MANAGER';
  
  const handleUpdateStatus = (itemId: string, status: InventoryItem['status']) => {
    const item = state.inventory.find(i => i.id === itemId);
    
    setAppState(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => i.id === itemId ? { ...i, status, lastReportedBy: state.currentUser?.name } : i)
    }));

    if (status === 'out_of_stock') {
      // Direct notification for shortages as requested
      setNotification(`התראה: הפריט "${item?.name}" חסר במלאי!`);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const subject = `דוח חוסרים ומלאי - B.T System - ${new Date().toLocaleDateString('he-IL')}`;
    let body = "מצב מלאי וחוסרים מעודכן:\n\n";
    
    const outOfStock = state.inventory.filter(i => i.status === 'out_of_stock');
    const lowStock = state.inventory.filter(i => i.status === 'low');
    const available = state.inventory.filter(i => i.status === 'available');

    if (outOfStock.length > 0) {
      body += "🚨 פריטים חסרים (דחוף):\n";
      outOfStock.forEach(item => body += `- ${item.name} (${item.category})\n`);
      body += "\n";
    }

    if (lowStock.length > 0) {
      body += "⚠️ מלאי נמוך:\n";
      lowStock.forEach(item => body += `- ${item.name} (${item.category})\n`);
      body += "\n";
    }

    if (available.length > 0) {
      body += "✅ מלאי תקין:\n";
      available.forEach(item => body += `- ${item.name}\n`);
    }

    body += `\nדווח על ידי: ${state.currentUser?.name} ${state.currentUser?.lastName}\n`;
    body += `תאריך: ${new Date().toLocaleString('he-IL')}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">ניהול חוסרים</h2>
          <p className="text-slate-400 text-sm font-bold">דווח על חוסרים בציוד ועקוב אחר המלאי</p>
        </div>
        
        <div className="flex gap-2 no-print">
          <button onClick={handlePrint} className="bg-[#222] hover:bg-[#333] text-slate-200 p-2.5 rounded-xl border border-[#444] transition-all" title="הדפס דוח">
            🖨️
          </button>
          <button onClick={handleEmail} className="bg-[#222] hover:bg-[#333] text-slate-200 p-2.5 rounded-xl border border-[#444] transition-all" title="שלח דוח חוסרים למייל">
            📧
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.inventory.map(item => (
          <div key={item.id} className="bg-[#1a1a1a] p-6 rounded-[32px] shadow-2xl border border-[#333] flex flex-col hover:border-slate-500 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black bg-[#222] text-slate-400 px-3 py-1.5 rounded-lg border border-[#333] uppercase tracking-widest">{item.category}</span>
              <span className={`w-3 h-3 rounded-full animate-pulse ${
                item.status === 'available' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                item.status === 'low' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
              }`} />
            </div>
            
            <h4 className="text-xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors">{item.name}</h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">
              {item.status === 'available' ? 'מלאי תקין' : 
               item.status === 'low' ? 'מלאי נמוך' : 'חסר במלאי'}
            </p>

            <div className="mt-auto space-y-4">
              <p className="text-[10px] text-slate-500 font-bold italic">עדכון אחרון: {item.lastReportedBy || 'מערכת'}</p>
              
              <div className="grid grid-cols-2 gap-2 no-print">
                <button 
                  onClick={() => handleUpdateStatus(item.id, 'low')}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    item.status === 'low' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-[#222] border-[#333] text-slate-500 hover:text-white'
                  }`}
                >
                  ⚠️ נמוך
                </button>
                <button 
                  onClick={() => handleUpdateStatus(item.id, 'out_of_stock')}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    item.status === 'out_of_stock' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-[#222] border-[#333] text-slate-500 hover:text-white'
                  }`}
                >
                  🚨 חסר
                </button>
              </div>
              
              <button 
                onClick={() => handleUpdateStatus(item.id, 'available')}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border no-print ${
                  item.status === 'available' ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-[#222] border-[#333] text-slate-500 hover:text-white'
                }`}
              >
                ✅ עדכן למלאי תקין
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryView;
