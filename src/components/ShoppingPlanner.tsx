'use client';

import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2, CheckCircle, Tag, Store, CreditCard, User, Upload, ArrowUpRight, Search, FileText } from 'lucide-react';
import { ShoppingItem, Profile, Event } from '@/lib/mockData';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './ui/Dialog';
import { formatCurrency } from '@/lib/utils';
import triggerConfetti from './ui/Confetti';

interface ShoppingPlannerProps {
  shopping: ShoppingItem[];
  profiles: Profile[];
  events: Event[];
  selectedEventId: string | null;
  currentUser: Profile;
  onAddShoppingItem: (item: ShoppingItem) => void;
  onUpdateShoppingItem: (item: ShoppingItem) => void;
  onDeleteShoppingItem: (id: string) => void;
}

const CATEGORIES = [
  'All',
  'Clothes',
  'Jewelry',
  'Decorations',
  'Flowers',
  'Food',
  'Return Gifts',
  'Wedding Cards',
  'Stage',
  'Lighting',
  'Others'
];

export default function ShoppingPlanner({
  shopping,
  profiles,
  events,
  selectedEventId,
  currentUser,
  onAddShoppingItem,
  onUpdateShoppingItem,
  onDeleteShoppingItem
}: ShoppingPlannerProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog management
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Clothes');
  const [formEventId, setFormEventId] = useState('');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formBudget, setFormBudget] = useState(0);
  const [formActualPrice, setFormActualPrice] = useState(0);
  const [formStore, setFormStore] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'purchased'>('pending');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formReceiptUrl, setFormReceiptUrl] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Filter items
  const filteredItems = shopping.filter(item => {
    if (selectedEventId && item.event_id !== selectedEventId) return false;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.store || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate totals for active filtered set
  const totalBudget = filteredItems.reduce((sum, item) => sum + (Number(item.budget) * item.quantity), 0);
  const totalActual = filteredItems.reduce((sum, item) => sum + (Number(item.actual_price || 0) * item.quantity), 0);
  const totalPurchased = filteredItems.filter(i => i.status === 'purchased').length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(selectedCategory === 'All' ? 'Clothes' : selectedCategory);
    setFormEventId(selectedEventId || events[0]?.id || '');
    setFormQuantity(1);
    setFormBudget(0);
    setFormActualPrice(0);
    setFormStore('');
    setFormStatus('pending');
    setFormAssignedTo('');
    setFormReceiptUrl('');
    setIsOpen(true);
  };

  const handleOpenEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormEventId(item.event_id);
    setFormQuantity(item.quantity);
    setFormBudget(item.budget);
    setFormActualPrice(item.actual_price);
    setFormStore(item.store || '');
    setFormStatus(item.status);
    setFormAssignedTo(item.assigned_to || '');
    setFormReceiptUrl(item.receipt_url || '');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEventId) return;

    const itemData: ShoppingItem = {
      id: editingItem ? editingItem.id : `s-${Date.now()}`,
      event_id: formEventId,
      name: formName,
      category: formCategory,
      quantity: formQuantity,
      budget: formBudget,
      actual_price: formActualPrice,
      store: formStore,
      status: formStatus,
      assigned_to: formAssignedTo || undefined,
      receipt_url: formReceiptUrl || undefined
    };

    if (editingItem) {
      onUpdateShoppingItem(itemData);
      if (formStatus === 'purchased' && editingItem.status !== 'purchased') {
        triggerConfetti();
      }
    } else {
      onAddShoppingItem(itemData);
    }
    setIsOpen(false);
  };

  // Simulating document uploads for contracts/receipts
  const handleSimulateUpload = () => {
    const mockReceipts = [
      '/receipts/boutique_invoice_1.pdf',
      '/receipts/tanishq_jewelry_bill.png',
      '/receipts/caterer_adv_slip.jpg'
    ];
    const randomReceipt = mockReceipts[Math.floor(Math.random() * mockReceipts.length)];
    setFormReceiptUrl(randomReceipt);
    alert('Simulated receipt uploaded successfully! Mock Invoice link populated.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* Categories Sidebar */}
      <div className="rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-4 space-y-1.5 shadow-sm">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-2">
          Categories
        </h3>
        {CATEGORIES.map(cat => {
          const count = shopping.filter(i => {
            if (selectedEventId && i.event_id !== selectedEventId) return false;
            return cat === 'All' || i.category === cat;
          }).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
              }`}
            >
              <span>{cat}</span>
              <span className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[10px] text-stone-500 dark:text-stone-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Items Listing Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Statistics & Filters banner */}
        <div className="bg-white dark:bg-stone-900/60 p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-150">
              Shopping Category: {selectedCategory}
            </h3>
            <div className="flex gap-4 text-xs font-medium text-stone-500 dark:text-stone-400">
              <span>Budgeted: <span className="text-stone-850 dark:text-stone-200">{formatCurrency(totalBudget)}</span></span>
              <span>Spent: <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalActual)}</span></span>
              <span>Purchased: <span className="text-amber-600 dark:text-amber-500">{totalPurchased} / {filteredItems.length}</span></span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-stone-200 dark:border-stone-850 rounded-lg bg-transparent text-xs text-stone-850 focus:outline-none"
              />
            </div>
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-3 py-1.5 rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Items Cards list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const event = events.find(e => e.id === item.event_id);
            const assigned = profiles.find(p => p.id === item.assigned_to);

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-4 rounded-xl shadow-sm hover:border-amber-500/50 hover:shadow-md cursor-pointer transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-850 text-stone-500 dark:text-stone-400 border border-stone-200/10">
                      {item.category}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      const updatedStatus = item.status === 'purchased' ? 'pending' : 'purchased';
                      onUpdateShoppingItem({ ...item, status: updatedStatus });
                      if (updatedStatus === 'purchased') triggerConfetti();
                    }}
                    className={`p-1 rounded ${
                      item.status === 'purchased' ? 'text-emerald-500 hover:bg-emerald-500/5' : 'text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850'
                    }`}
                    title={item.status === 'purchased' ? 'Mark Pending' : 'Mark Purchased'}
                  >
                    <CheckCircle className="w-5 h-5 fill-current" />
                  </button>
                </div>

                <h4 className={`text-xs font-bold text-stone-850 dark:text-stone-100 ${item.status === 'purchased' && 'line-through text-stone-400'}`}>
                  {item.name}
                </h4>

                <div className="grid grid-cols-2 gap-2 mt-4 border-t border-stone-50 dark:border-stone-850 pt-3 text-[10px]">
                  <div>
                    <span className="text-stone-400 block font-medium">Budget Cost</span>
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      {formatCurrency(item.budget * item.quantity)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-medium">Actual Cost</span>
                    <span className={`font-bold ${item.status === 'purchased' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500'}`}>
                      {item.actual_price ? formatCurrency(item.actual_price * item.quantity) : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] mt-3 pt-2.5 border-t border-dashed border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <User className="w-3 h-3" />
                    <span>{assigned ? assigned.full_name : 'Unassigned'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.store && (
                      <span className="text-stone-400 flex items-center gap-0.5">
                        <Store className="w-3 h-3" />
                        {item.store}
                      </span>
                    )}
                    {item.receipt_url && (
                      <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                        <FileText className="w-3 h-3" />
                        Invoice
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item details and create/edit Dialog */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Shopping Item Details' : 'Add Shopping Requirement'}</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Item Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Workspace / Event</label>
                <select
                  value={formEventId}
                  onChange={e => setFormEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={formQuantity}
                  onChange={e => setFormQuantity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Budget / Unit</label>
                <input
                  type="number"
                  min={0}
                  value={formBudget}
                  onChange={e => setFormBudget(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Actual / Unit</label>
                <input
                  type="number"
                  min={0}
                  value={formActualPrice}
                  onChange={e => setFormActualPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Store / Supplier</label>
                <input
                  type="text"
                  value={formStore}
                  onChange={e => setFormStore(e.target.value)}
                  placeholder="e.g. Heritage Designs"
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                >
                  <option value="pending">Pending Purchase</option>
                  <option value="purchased">Purchased</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Assigned Purchaser</label>
              <select
                value={formAssignedTo}
                onChange={e => setFormAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
              >
                <option value="">Select Member</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            {/* Receipt upload trigger */}
            <div className="border-t border-stone-150 dark:border-stone-850 pt-4">
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Invoice Receipt</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSimulateUpload}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-200 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Attach Bill / Receipt
                </button>
                {formReceiptUrl && (
                  <span className="text-[10px] text-emerald-600 font-semibold truncate">
                    Attached: {formReceiptUrl.substring(formReceiptUrl.lastIndexOf('/') + 1)}
                  </span>
                )}
              </div>
            </div>
          </DialogContent>

          <DialogFooter>
            {editingItem && isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this item?')) {
                    onDeleteShoppingItem(editingItem.id);
                    setIsOpen(false);
                  }
                }}
                className="mr-auto p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-100 rounded-lg transition-colors"
                title="Delete Item"
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
              {editingItem ? 'Save Changes' : 'Add Item'}
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
