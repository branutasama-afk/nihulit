
import React, { useState } from 'react';
import { AppState, EquipmentOrder } from '../types';

interface OrdersViewProps {
  state: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const OrdersView: React.FC<OrdersViewProps> = ({ state, setAppState }) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<EquipmentOrder>>({
    itemName: '',
    quantity: 1,
    priceEstimate: ''
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order: EquipmentOrder = {
      id: Math.random().toString(36).substr(2, 9),
      itemName: newOrder.itemName || '',
      quantity: newOrder.quantity || 1,
      priceEstimate: newOrder.priceEstimate || '₪0',
      status: 'pending',
      date: new Date().toLocaleDateString('he-IL')
    };
    setAppState(prev => ({ ...prev, orders: [order, ...prev.orders] }));
    setShowOrderModal(false);
    setNewOrder({ itemName: '', quantity: 1, priceEstimate: '' });
  };

  const handleUpdateStatus = (id: string, status: EquipmentOrder['status']) => {
    setAppState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === id ? { ...o, status } : o)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">הזמנת ציוד</h2>
          <p className="text-slate-500 text-sm">ניהול רכש והזמנות מהספקים</p>
        </div>
        <button 
          onClick={() => setShowOrderModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
        >
          <span>📦</span> הזמנה חדשה
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">פריט</th>
                <th className="px-6 py-4">כמות</th>
                <th className="px-6 py-4">תאריך</th>
                <th className="px-6 py-4">סטטוס</th>
                <th className="px-6 py-4">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                    אין הזמנות פעילות
                  </td>
                </tr>
              ) : (
                state.orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{order.itemName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.quantity} יחידות</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        order.status === 'received' ? 'bg-green-100 text-green-700' :
                        order.status === 'ordered' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status === 'pending' ? 'ממתין לאישור' : 
                         order.status === 'ordered' ? 'הוזמן' : 'התקבל'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {order.status === 'pending' && (
                        <button onClick={() => handleUpdateStatus(order.id, 'ordered')} className="bg-blue-50 text-blue-600 p-1.5 rounded-lg hover:bg-blue-100 transition-colors text-[10px] font-bold">סמן כהוזמן</button>
                      )}
                      {order.status === 'ordered' && (
                        <button onClick={() => handleUpdateStatus(order.id, 'received')} className="bg-green-50 text-green-600 p-1.5 rounded-lg hover:bg-green-100 transition-colors text-[10px] font-bold">סמן כהתקבל</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">הזמנת ציוד חדשה</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-2xl hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center">✕</button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">שם הפריט</label>
                <input required type="text" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="למשל: עטי למדפסת" value={newOrder.itemName} onChange={e => setNewOrder({...newOrder, itemName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">כמות</label>
                  <input required type="number" min="1" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" value={newOrder.quantity} onChange={e => setNewOrder({...newOrder, quantity: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">הערכת מחיר (₪)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" value={newOrder.priceEstimate} onChange={e => setNewOrder({...newOrder, priceEstimate: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">בצע הזמנה</button>
                <button type="button" onClick={() => setShowOrderModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
