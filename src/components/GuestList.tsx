'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Heart, Search, Filter, Phone, Check, X, ShieldAlert, Mail } from 'lucide-react';
import { Guest, Profile } from '@/lib/mockData';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './ui/Dialog';

interface GuestListProps {
  guests: Guest[];
  currentUser: Profile;
  onAddGuest: (guest: Guest) => void;
  onUpdateGuest: (guest: Guest) => void;
  onDeleteGuest: (id: string) => void;
}

export default function GuestList({
  guests,
  currentUser,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest
}: GuestListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sideFilter, setSideFilter] = useState<'all' | 'bride' | 'groom'>('all');
  const [rsvpFilter, setRsvpFilter] = useState<'all' | Guest['rsvp_status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Guest['category']>('all');

  // Dialog management
  const [isOpen, setIsOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Guest['category']>('family');
  const [formSide, setFormSide] = useState<Guest['side']>('bride');
  const [formRsvp, setFormRsvp] = useState<Guest['rsvp_status']>('pending');
  const [formInviteSent, setFormInviteSent] = useState(false);
  const [formFood, setFormFood] = useState('veg');
  const [formPhone, setFormPhone] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Filter guests
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (g.phone || '').includes(searchQuery);
    const matchesSide = sideFilter === 'all' || g.side === sideFilter;
    const matchesRsvp = rsvpFilter === 'all' || g.rsvp_status === rsvpFilter;
    const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter;

    return matchesSearch && matchesSide && matchesRsvp && matchesCategory;
  });

  // Analytics
  const totalGuests = guests.length;
  const attendingCount = guests.filter(g => g.rsvp_status === 'attending').length;
  const declinedCount = guests.filter(g => g.rsvp_status === 'declined').length;
  const pendingCount = guests.filter(g => g.rsvp_status === 'pending').length;
  const invitesSentCount = guests.filter(g => g.invitation_sent).length;

  const vegCount = guests.filter(g => g.rsvp_status === 'attending' && g.food_preference === 'veg').length;
  const nonVegCount = guests.filter(g => g.rsvp_status === 'attending' && g.food_preference === 'non-veg').length;
  const veganCount = guests.filter(g => g.rsvp_status === 'attending' && g.food_preference === 'vegan').length;

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setFormName('');
    setFormCategory('family');
    setFormSide(sideFilter === 'all' ? 'bride' : sideFilter);
    setFormRsvp('pending');
    setFormInviteSent(false);
    setFormFood('veg');
    setFormPhone('');
    setIsOpen(true);
  };

  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormCategory(guest.category);
    setFormSide(guest.side);
    setFormRsvp(guest.rsvp_status);
    setFormInviteSent(guest.invitation_sent);
    setFormFood(guest.food_preference);
    setFormPhone(guest.phone || '');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const guestData: Guest = {
      id: editingGuest ? editingGuest.id : `g-${Date.now()}`,
      name: formName,
      category: formCategory,
      side: formSide,
      rsvp_status: formRsvp,
      invitation_sent: formInviteSent,
      food_preference: formFood,
      phone: formPhone || undefined
    };

    if (editingGuest) {
      onUpdateGuest(guestData);
    } else {
      onAddGuest(guestData);
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* RSVP & Catering Summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-4 rounded-xl shadow-sm md:col-span-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">RSVP Breakdown</span>
          <div className="flex justify-between items-center text-xs">
            <div className="text-center bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg flex-1 mr-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-base block">{attendingCount}</span>
              <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">Attending</span>
            </div>
            <div className="text-center bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg flex-1 mr-2">
              <span className="text-amber-600 dark:text-amber-500 font-extrabold text-base block">{pendingCount}</span>
              <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">Pending</span>
            </div>
            <div className="text-center bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg flex-1">
              <span className="text-rose-500 font-extrabold text-base block">{declinedCount}</span>
              <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">Declined</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-4 rounded-xl shadow-sm md:col-span-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Confirmed Meals Needed</span>
          <div className="flex justify-between items-center text-xs">
            <div className="text-center bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg flex-1 mr-2">
              <span className="text-stone-800 dark:text-stone-200 font-extrabold text-base block">{vegCount}</span>
              <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">Vegetarian</span>
            </div>
            <div className="text-center bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg flex-1 mr-2">
              <span className="text-stone-800 dark:text-stone-200 font-extrabold text-base block">{nonVegCount}</span>
              <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">Non-Veg</span>
            </div>
            <div className="text-center bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg flex-1">
              <span className="text-stone-800 dark:text-stone-200 font-extrabold text-base block">{veganCount}</span>
              <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">Vegan</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-4 rounded-xl shadow-sm text-center flex flex-col justify-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Invites Sent</span>
          <span className="text-2xl font-serif font-extrabold text-amber-500">{invitesSentCount} / {totalGuests}</span>
          <span className="text-[9px] text-stone-400 mt-1">Completion rate</span>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900/60 p-4 border border-stone-200/80 dark:border-stone-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search guests by name/phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-stone-200 dark:border-stone-850 rounded-lg bg-transparent text-xs text-stone-850 focus:outline-none"
            />
          </div>

          {/* Bride/Groom side switch */}
          <div className="bg-stone-100 dark:bg-stone-850 p-1 rounded-lg flex items-center gap-1 border border-stone-200/40 text-xs font-semibold">
            <button
              onClick={() => setSideFilter('all')}
              className={`px-2.5 py-1 rounded transition-all ${sideFilter === 'all' ? 'bg-white dark:bg-stone-900 text-amber-600 shadow' : 'text-stone-400'}`}
            >
              All Sides
            </button>
            <button
              onClick={() => setSideFilter('bride')}
              className={`px-2.5 py-1 rounded transition-all ${sideFilter === 'bride' ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow' : 'text-stone-400'}`}
            >
              Bride
            </button>
            <button
              onClick={() => setSideFilter('groom')}
              className={`px-2.5 py-1 rounded transition-all ${sideFilter === 'groom' ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow' : 'text-stone-400'}`}
            >
              Groom
            </button>
          </div>

          {/* RSVP Filter */}
          <div className="flex items-center gap-1.5 border border-stone-200 dark:border-stone-850 rounded-lg px-2 py-1 bg-transparent">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <select
              value={rsvpFilter}
              onChange={e => setRsvpFilter(e.target.value as any)}
              className="bg-transparent text-xs text-stone-600 dark:text-stone-300 focus:outline-none font-medium"
            >
              <option value="all">All RSVPs</option>
              <option value="attending">Attending</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 border border-stone-200 dark:border-stone-850 rounded-lg px-2 py-1 bg-transparent">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="bg-transparent text-xs text-stone-600 dark:text-stone-300 focus:outline-none font-medium"
            >
              <option value="all">All Categories</option>
              <option value="vip">VIPs</option>
              <option value="family">Family Members</option>
              <option value="friend">Friends</option>
            </select>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-3 py-2 rounded-lg shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Invite Guest
          </button>
        )}
      </div>

      {/* Guest lists grid */}
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/80 text-stone-500 dark:text-stone-400 font-bold">
                <th className="p-3">Guest Name</th>
                <th className="p-3">Side</th>
                <th className="p-3">Category</th>
                <th className="p-3">RSVP Status</th>
                <th className="p-3">Invite Sent</th>
                <th className="p-3">Meal Pref</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
              {filteredGuests.map(g => (
                <tr
                  key={g.id}
                  onClick={() => handleOpenEdit(g)}
                  className="hover:bg-stone-50/30 dark:hover:bg-stone-850/30 cursor-pointer text-stone-700 dark:text-stone-300 font-medium"
                >
                  <td className="p-3 font-semibold flex items-center gap-1.5">
                    {g.name}
                    {g.category === 'vip' && <span title="VIP Guest"><Heart className="w-3.5 h-3.5 text-amber-500 fill-current" /></span>}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded capitalize text-[10px] font-semibold border ${
                      g.side === 'bride'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/10'
                    }`}>
                      {g.side}
                    </span>
                  </td>
                  <td className="p-3 capitalize">{g.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded capitalize text-[10px] font-bold ${
                      g.rsvp_status === 'attending' && 'bg-emerald-500/10 text-emerald-600' ||
                      g.rsvp_status === 'declined' && 'bg-rose-500/10 text-rose-600' ||
                      'bg-stone-100 text-stone-500 dark:bg-stone-855'
                    }`}>
                      {g.rsvp_status}
                    </span>
                  </td>
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onUpdateGuest({ ...g, invitation_sent: !g.invitation_sent })}
                      className={`p-1.5 rounded-full border transition-all ${
                        g.invitation_sent
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                          : 'border-stone-200 dark:border-stone-800 text-stone-350 hover:bg-stone-100 dark:hover:bg-stone-850'
                      }`}
                    >
                      {g.invitation_sent ? <Check className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                  <td className="p-3 uppercase font-semibold text-[10px] text-stone-500 dark:text-stone-400">
                    {g.food_preference}
                  </td>
                  <td className="p-3 text-stone-400">
                    {g.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {g.phone}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete guest "${g.name}"?`)) {
                            onDeleteGuest(g.id);
                          }
                        }}
                        className="text-stone-400 hover:text-rose-500 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest editor dialog */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingGuest ? 'Edit Guest Information' : 'Invite New Guest'}</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Guest Name</label>
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
                  onChange={e => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                >
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="vip">VIP Guest</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Bridal Party Side</label>
                <select
                  value={formSide}
                  onChange={e => setFormSide(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                >
                  <option value="bride">Bride's Side</option>
                  <option value="groom">Groom's Side</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">RSVP Status</label>
                <select
                  value={formRsvp}
                  onChange={e => setFormRsvp(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                >
                  <option value="pending">Pending</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Meal Preference</label>
                <select
                  value={formFood}
                  onChange={e => setFormFood(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                >
                  <option value="veg">Vegetarian (Veg)</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              <div className="flex flex-col justify-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={formInviteSent}
                    onChange={e => setFormInviteSent(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Invite Sent
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700 focus:outline-none"
              />
            </div>
          </DialogContent>
          <DialogFooter>
            {editingGuest && isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove ${editingGuest.name} from guest list?`)) {
                    onDeleteGuest(editingGuest.id);
                    setIsOpen(false);
                  }
                }}
                className="mr-auto p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-100 rounded-lg transition-colors"
                title="Delete Guest"
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
              {editingGuest ? 'Save Changes' : 'Invite'}
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
