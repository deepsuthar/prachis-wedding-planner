'use client';

import React, { useState } from 'react';
import { Heart, Search, Bell, Sun, Moon, Sparkles, User, ExternalLink, Calendar } from 'lucide-react';
import { useTheme } from '@/app/providers';
import { Profile, Task, Guest, VendorBooking, BudgetItem, ShoppingItem } from '@/lib/mockData';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from './ui/Dialog';
import { getBookingUrgency } from '@/lib/utils';
import PWAInstallPrompt from './PWAInstallPrompt';

interface HeaderProps {
  currentUser: Profile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Global search sources
  tasks: Task[];
  guests: Guest[];
  bookings: VendorBooking[];
  budget: BudgetItem[];
  shopping: ShoppingItem[];
  weddingDate: string;
  onOpenTask: (task: Task) => void;
  onOpenBooking: (booking: VendorBooking) => void;
  onLogout: () => void;
  isSearchOpenExternal?: boolean;
  setIsSearchOpenExternal?: (open: boolean) => void;
}

export default function Header({
  currentUser,
  activeTab,
  setActiveTab,
  tasks,
  guests,
  bookings,
  budget,
  shopping,
  weddingDate,
  onOpenTask,
  onOpenBooking,
  onLogout,
  isSearchOpenExternal,
  setIsSearchOpenExternal
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  
  // Search Modal state
  const [internalSearchOpen, setInternalSearchOpen] = useState(false);
  const isSearchOpen = isSearchOpenExternal !== undefined ? isSearchOpenExternal : internalSearchOpen;
  const setIsSearchOpen = (open: boolean) => {
    setInternalSearchOpen(open);
    if (setIsSearchOpenExternal) setIsSearchOpenExternal(open);
  };
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications dropdown state
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleSearchClick = (type: 'task' | 'booking', item: any) => {
    setIsSearchOpen(false);
    if (type === 'task') {
      setActiveTab('tasks');
      onOpenTask(item);
    } else if (type === 'booking') {
      setActiveTab('bookings');
      onOpenBooking(item);
    }
  };

  // Run Search filters
  const searchResults = {
    tasks: tasks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    guests: guests.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    bookings: bookings.filter(b => (b.vendor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || b.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
  };

  const hasSearchResults = searchQuery.trim() !== '' && 
    (searchResults.tasks.length > 0 || searchResults.guests.length > 0 || searchResults.bookings.length > 0);

  // Generate dynamic notifications
  const notifications: string[] = [];
  
  // 1. Budget overrun warning
  const totalAllocated = budget.reduce((sum, item) => sum + Number(item.allocated), 0);
  const totalActual = budget.reduce((sum, item) => sum + Number(item.actual || item.paid), 0);
  if (totalActual > totalAllocated) {
    notifications.push(`Budget cap warning: Total costs exceed allocated cap by ${totalActual - totalAllocated} INR.`);
  }

  // 2. Overdue vendor bookings warning
  bookings.forEach(b => {
    const urgency = getBookingUrgency(b.category, b.booking_status, weddingDate);
    if (urgency.level === 'overdue') {
      notifications.push(`Booking alert: Category "${b.category}" is overdue. Contact a vendor immediately.`);
    }
  });

  // 3. Due tasks
  tasks.filter(t => t.status !== 'completed' && t.priority === 'critical').forEach(t => {
    notifications.push(`Urgent task: "${t.name}" requires attention.`);
  });

  if (notifications.length === 0) {
    notifications.push('No new alerts. All systems operational!');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-850 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 flex items-center justify-center shadow shadow-emerald-600/10">
              <Heart className="w-4.5 h-4.5 text-white fill-current animate-pulse" />
            </div>
            <div>
              <span className="font-serif text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-800 to-amber-700 dark:from-stone-100 dark:to-amber-500 bg-clip-text text-transparent tracking-tight">
                PRACHI’S PLANNER
              </span>
              <span className="hidden sm:inline-block text-[9px] font-bold text-stone-400 uppercase tracking-widest block leading-none">
                Est. Feb 2027
              </span>
            </div>
          </div>

          {/* Navigation links (Desktop tabs) */}
          <nav className="hidden lg:flex items-center gap-1">
            {([
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'tasks', label: 'Tasks Planner' },
              { id: 'shopping', label: 'Shopping list' },
              { id: 'budget', label: 'Budget Ledger' },
              { id: 'guests', label: 'Guest List' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'team', label: 'Team' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-600 dark:from-emerald-700 dark:to-emerald-800 dark:border-emerald-700 shadow-sm'
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50/80 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-850/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Actions & Switche items */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-850 transition-colors"
              title="Global Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Notification alert hub */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-850 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && notifications[0] !== 'No new alerts. All systems operational!' && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl p-3 space-y-2 text-xs z-50">
                  <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-2">
                    <span className="font-bold text-stone-850 dark:text-stone-250">Notification Center</span>
                    <span className="text-[10px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded font-bold">{notifications.length} alerts</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.map((msg, index) => (
                      <p key={index} className="text-stone-500 dark:text-stone-400 border-b border-stone-50 dark:border-stone-850 pb-1.5 leading-relaxed last:border-b-0">
                        {msg}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PWA Install Button */}
            <PWAInstallPrompt variant="button" className="hidden sm:flex" />
            <PWAInstallPrompt variant="icon" className="sm:hidden" />

            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-850 transition-colors"
              title={theme === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* Profile marker */}
            <div className="flex items-center gap-1.5 border-l border-stone-200 dark:border-stone-800 pl-3">
              <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-600 dark:text-amber-500 text-xs">
                {currentUser.full_name[0]}
              </div>
              <span className="hidden md:inline-block text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                {currentUser.full_name.split(' ')[0]}
              </span>
              <button
                onClick={onLogout}
                className="p-1 rounded text-stone-450 hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-450 hover:bg-stone-50 dark:hover:bg-stone-850 text-[10px] font-bold uppercase transition-all ml-1.5 border border-stone-200 dark:border-stone-800"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Dialog */}
      <Dialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}>
        <DialogHeader>
          <DialogTitle>Search Wedding Registry</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search tasks, guests or vendors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 dark:border-stone-750 rounded-xl bg-transparent text-sm focus:outline-none"
              autoFocus
            />
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
            {hasSearchResults ? (
              <>
                {/* Search in Tasks */}
                {searchResults.tasks.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 px-1">Tasks</h4>
                    {searchResults.tasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleSearchClick('task', t)}
                        className="p-2 hover:bg-stone-50 dark:hover:bg-stone-850 rounded-lg cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300"
                      >
                        {t.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Search in Bookings */}
                {searchResults.bookings.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 px-1">Vendor Bookings</h4>
                    {searchResults.bookings.map(b => (
                      <div
                        key={b.id}
                        onClick={() => handleSearchClick('booking', b)}
                        className="p-2 hover:bg-stone-50 dark:hover:bg-stone-850 rounded-lg cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300"
                      >
                        {b.vendor_name || b.category} ({b.booking_status})
                      </div>
                    ))}
                  </div>
                )}

                {/* Search in Guests */}
                {searchResults.guests.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 px-1">Invited Guests</h4>
                    {searchResults.guests.map(g => (
                      <div
                        key={g.id}
                        onClick={() => {
                          setActiveTab('guests');
                          setIsSearchOpen(false);
                        }}
                        className="p-2 hover:bg-stone-50 dark:hover:bg-stone-850 rounded-lg cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300 flex justify-between"
                      >
                        <span>{g.name}</span>
                        <span className="text-[10px] text-stone-400 capitalize">{g.side} side ({g.rsvp_status})</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : searchQuery.trim() !== '' ? (
              <p className="text-xs text-stone-400 italic text-center py-4">No results found.</p>
            ) : (
              <p className="text-xs text-stone-400 italic text-center py-4">Type a query to search across the planner...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
