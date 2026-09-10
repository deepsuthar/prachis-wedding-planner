'use client';

import React, { useState } from 'react';
import { IndianRupee, Plus, Trash2, ArrowUpRight, TrendingUp, AlertTriangle, FileSpreadsheet, Percent, HelpCircle } from 'lucide-react';
import { BudgetItem, Event, Profile } from '@/lib/mockData';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './ui/Dialog';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';

interface BudgetManagerProps {
  budget: BudgetItem[];
  events: Event[];
  selectedEventId: string | null;
  currentUser: Profile;
  onAddBudgetItem: (item: BudgetItem) => void;
  onUpdateBudgetItem: (item: BudgetItem) => void;
  onDeleteBudgetItem: (id: string) => void;
}

const BUDGET_CATEGORIES = [
  'Venue',
  'Food Catering',
  'Decoration',
  'Flowers',
  'Lighting',
  'Music / DJ',
  'Wedding Clothes',
  'Makeup',
  'Photography',
  'Jewelry',
  'Gifts',
  'Invitation Cards',
  'Others'
];

export default function BudgetManager({
  budget,
  events,
  selectedEventId,
  currentUser,
  onAddBudgetItem,
  onUpdateBudgetItem,
  onDeleteBudgetItem
}: BudgetManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState(BUDGET_CATEGORIES[0]);
  const [formEventId, setFormEventId] = useState('');
  const [formAllocated, setFormAllocated] = useState(0);
  const [formActual, setFormActual] = useState(0);
  const [formPaid, setFormPaid] = useState(0);
  const [formNotes, setFormNotes] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Filter budgets based on active event workspace selection
  const filteredBudget = budget.filter(item => {
    if (selectedEventId && item.event_id !== selectedEventId) return false;
    return true;
  });

  // Aggregated totals
  const totalAllocated = filteredBudget.reduce((sum, item) => sum + Number(item.allocated), 0);
  const totalActual = filteredBudget.reduce((sum, item) => sum + Number(item.actual || item.paid), 0);
  const totalPaid = filteredBudget.reduce((sum, item) => sum + Number(item.paid), 0);
  const outstandingBalance = totalActual - totalPaid;
  const remainingBudget = totalAllocated - totalActual;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormCategory(BUDGET_CATEGORIES[0]);
    setFormEventId(selectedEventId || events[0]?.id || '');
    setFormAllocated(0);
    setFormActual(0);
    setFormPaid(0);
    setFormNotes('');
    setIsOpen(true);
  };

  const handleOpenEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormEventId(item.event_id);
    setFormAllocated(item.allocated);
    setFormActual(item.actual);
    setFormPaid(item.paid);
    setFormNotes(item.notes || '');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formEventId) return;

    const itemData: BudgetItem = {
      id: editingItem ? editingItem.id : `b-${Date.now()}`,
      event_id: formEventId,
      category: formCategory,
      allocated: formAllocated,
      actual: formActual,
      paid: formPaid,
      notes: formNotes
    };

    if (editingItem) {
      onUpdateBudgetItem(itemData);
    } else {
      onAddBudgetItem(itemData);
    }
    setIsOpen(false);
  };

  // Recharts: category distribution Pie Chart
  const pieData = filteredBudget.map(b => ({
    name: b.category,
    value: Number(b.actual || b.allocated || 0)
  })).filter(item => item.value > 0);

  const PIE_COLORS = ['#047857', '#d97706', '#059669', '#f59e0b', '#10b981', '#fbbf24', '#34d399', '#fbbf24', '#6ee7b7', '#fef08a'];

  // Recharts: Allocated vs Actual Bar Chart per Event
  const barData = events.map(ev => {
    const evBudgets = budget.filter(b => b.event_id === ev.id);
    const allocatedSum = evBudgets.reduce((sum, item) => sum + Number(item.allocated), 0);
    const actualSum = evBudgets.reduce((sum, item) => sum + Number(item.actual || item.paid), 0);
    return {
      name: ev.name,
      Allocated: allocatedSum,
      Actual: actualSum
    };
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Total Budget Allocated</span>
          <span className="text-xl font-serif font-extrabold text-stone-800 dark:text-stone-150">{formatCurrency(totalAllocated)}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Actual Booked Cost</span>
          <span className="text-xl font-serif font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalActual)}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Total Paid (Advances)</span>
          <span className="text-xl font-serif font-extrabold text-amber-600 dark:text-amber-500">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Outstanding Balance</span>
          <span className="text-xl font-serif font-extrabold text-rose-500">{formatCurrency(outstandingBalance)}</span>
        </div>
      </div>

      {/* Warnings & Alerts */}
      {totalActual > totalAllocated && (
        <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
          <div>
            <span className="font-bold">Budget Cap Overflow Alert!</span> Your total booked costs ({formatCurrency(totalActual)}) exceed your allocated planning budget ({formatCurrency(totalAllocated)}) by <span className="font-bold">{formatCurrency(totalActual - totalAllocated)}</span>. Please review vendor negotiations.
          </div>
        </div>
      )}

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocated vs Actual Bar Chart */}
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 p-5 rounded-xl shadow-sm">
          <h3 className="font-serif text-sm font-bold text-stone-800 dark:text-stone-200 mb-4">
            Function Budget Comparison (Allocated vs Actual)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f0" className="dark:stroke-stone-800" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} />
                <YAxis fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Allocated" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses category breakdown Pie chart */}
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <h3 className="font-serif text-sm font-bold text-stone-800 dark:text-stone-200 mb-4">
            Cost Breakdown by Category
          </h3>
          <div className="h-48 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-stone-400 italic">No budget distribution logged.</span>
            )}
          </div>
          {/* Custom legends grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-[9px] font-semibold text-stone-500 max-h-16 overflow-y-auto">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="truncate">{item.name} ({formatCurrency(item.value)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-150 dark:border-stone-850 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900">
          <h3 className="font-serif text-sm font-bold text-stone-800 dark:text-stone-200">
            Category Budget Ledger
          </h3>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-2.5 py-1.5 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Ledger Item
            </button>
          )}
        </div>

        {/* Mobile View: Touch Cards */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
          {filteredBudget.map(item => {
            const event = events.find(e => e.id === item.event_id);
            const isOverrun = item.actual > item.allocated;
            const pendingBal = item.actual - item.paid;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className="p-4 space-y-2.5 hover:bg-stone-50/50 dark:hover:bg-stone-850/50 cursor-pointer active:bg-stone-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {item.category}
                      {isOverrun && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                    </div>
                    <span className="text-[10px] text-stone-400 font-semibold">{event?.name || 'General Event'}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                      {formatCurrency(item.actual)}
                    </span>
                    <span className="text-[10px] text-stone-400">Allocated: {formatCurrency(item.allocated)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-stone-850">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-500">
                      Paid: {formatCurrency(item.paid)}
                    </span>
                    {pendingBal > 0 && (
                      <span className="text-[11px] font-bold text-rose-500">
                        Due: {formatCurrency(pendingBal)}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <span className="text-[10px] text-stone-400 max-w-[150px] truncate">{item.notes}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Ledger Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-850 bg-stone-50/30 dark:bg-stone-900/40 text-stone-500 dark:text-stone-400 font-bold">
                <th className="p-3">Category</th>
                <th className="p-3">Function Event</th>
                <th className="p-3">Allocated Limit</th>
                <th className="p-3">Booked Cost</th>
                <th className="p-3">Paid Deposit</th>
                <th className="p-3">Pending Bal</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
              {filteredBudget.map(item => {
                const event = events.find(e => e.id === item.event_id);
                const isOverrun = item.actual > item.allocated;

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenEdit(item)}
                    className="hover:bg-stone-50/30 dark:hover:bg-stone-850/30 cursor-pointer text-stone-700 dark:text-stone-300 font-medium"
                  >
                    <td className="p-3 font-semibold flex items-center gap-1.5">
                      {item.category}
                      {isOverrun && <span title="Over allocated budget"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" /></span>}
                    </td>
                    <td className="p-3">{event?.name || 'General'}</td>
                    <td className="p-3">{formatCurrency(item.allocated)}</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(item.actual)}</td>
                    <td className="p-3 text-amber-600 dark:text-amber-500 font-semibold">{formatCurrency(item.paid)}</td>
                    <td className={`p-3 font-bold ${item.actual - item.paid > 0 ? 'text-rose-500' : 'text-stone-400'}`}>
                      {formatCurrency(item.actual - item.paid)}
                    </td>
                    <td className="p-3 text-stone-400 max-w-xs truncate">{item.notes || '-'}</td>
                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this budget entry?')) {
                              onDeleteBudgetItem(item.id);
                            }
                          }}
                          className="text-stone-400 hover:text-rose-500 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ledger Form Dialog */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Budget Entry' : 'Create Budget Entry'}</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-750"
                >
                  {BUDGET_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Function Event</label>
                <select
                  value={formEventId}
                  onChange={e => setFormEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-750"
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Allocated Budget</label>
                <input
                  type="number"
                  min={0}
                  value={formAllocated}
                  onChange={e => setFormAllocated(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-750 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Actual Booked Cost</label>
                <input
                  type="number"
                  min={0}
                  value={formActual}
                  onChange={e => setFormActual(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-750"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Paid Amount (Advances)</label>
                <input
                  type="number"
                  min={0}
                  value={formPaid}
                  onChange={e => setFormPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-750"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Notes / Terms</label>
              <textarea
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-750"
              />
            </div>
          </DialogContent>
          
          <DialogFooter>
            {editingItem && isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this budget entry?')) {
                    onDeleteBudgetItem(editingItem.id);
                    setIsOpen(false);
                  }
                }}
                className="mr-auto p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-100 rounded-lg transition-colors"
                title="Delete Entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-colors font-semibold"
            >
              {editingItem ? 'Save Changes' : 'Add Entry'}
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
