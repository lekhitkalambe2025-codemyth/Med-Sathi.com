import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Package, ClipboardList, AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function PharmacistDashboard() {
  const { showToast } = useToast();
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // orders, stock
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.pharmacy.getOrders(),
      api.pharmacy.getInventory()
    ])
      .then(([ordersRes, stockRes]) => {
        setOrders(ordersRes.data || []);
        setStock(stockRes.data || []);
      })
      .catch(err => console.error('Error fetching pharmacy data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispenseItem = (order) => {
    showToast(`Medication order for ${order.medicine} marked as prepared & sent to ${order.ward}`, 'success', 'Dispensed to Ward');
  };

  const lowStockCount = stock.filter(s => s.stockQty <= s.reorderLevel).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Hospital Pharmacy Dispensing & Formulary Stock
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active ward medication requirements, unit-dose fulfillment queue & stock reorder management
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">Active Prescriptions</span>
            <span className="text-2xl font-extrabold text-slate-900">{orders.length}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">Formulary SKUs</span>
            <span className="text-2xl font-extrabold text-slate-900">{stock.length}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 block mb-1">Low Stock Alerts</span>
            <span className="text-2xl font-extrabold text-amber-800">{lowStockCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-brand-600 text-brand-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Active Ward Prescriptions Queue ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'border-brand-600 text-brand-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Medication Inventory & Stock ({stock.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Rx Code</th>
                  <th className="py-3.5 px-4">Patient & Ward</th>
                  <th className="py-3.5 px-4">Medication & Dose</th>
                  <th className="py-3.5 px-4">Route / Freq</th>
                  <th className="py-3.5 px-4">Prescribed By</th>
                  <th className="py-3.5 px-4 text-center">Dispensed / Total</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order.prescriptionId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                      {order.prescriptionId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 block">{order.patientName}</span>
                      <span className="text-[11px] text-slate-400">{order.ward} • Bed {order.bed}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {order.medicine} <span className="font-normal text-slate-500">({order.dose})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {order.route} • {order.frequency}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {order.doctorName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {order.dispensedDoses || 0} / {order.totalDoses || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDispenseItem(order)}
                        className="px-3 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                      >
                        ✓ Ready for Ward
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY STOCK */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">SKU / Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Available Stock</th>
                  <th className="py-3.5 px-4 text-center">Reorder Threshold</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stock.map(item => {
                  const isLow = item.stockQty <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block">{item.medicine}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{item.id}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{item.location}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-800">
                        {item.stockQty} <span className="font-normal text-slate-400 text-[10px]">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">
                        {item.reorderLevel}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            ⚠ Reorder Needed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Adequate Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

