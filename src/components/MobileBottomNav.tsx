'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  ShoppingBag,
  IndianRupee,
  MoreHorizontal,
  Users,
  CalendarCheck,
  UserCheck,
  Search,
  Moon,
  Sun,
  X,
  Download,
  Heart
} from 'lucide-react';
import { useTheme } from '@/app/providers';
import PWAInstallPrompt from './PWAInstallPrompt';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  unreadAlertsCount?: number;
}

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenSearch,
  unreadAlertsCount = 0
}: MobileBottomNavProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'budget', label: 'Budget', icon: IndianRupee },
  ];

  const drawerTabs = [
    { id: 'guests', label: 'Guest List', icon: Users, desc: 'RSVP tracker & dietary tags' },
    { id: 'bookings', label: 'Vendor Bookings', icon: CalendarCheck, desc: 'Lead time manager & contracts' },
    { id: 'team', label: 'Team Members', icon: UserCheck, desc: 'Coordinators & permissions' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Drawer Overlay backdrop */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Slide-up Drawer Menu */}
      <div
        className={`lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 rounded-t-3xl shadow-2xl p-5 space-y-4 transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Heart className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <span className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
              Wedding Navigation Menu
            </span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Quick Tab Links */}
        <div className="grid grid-cols-1 gap-2">
          {drawerTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'bg-stone-50/50 dark:bg-stone-850/50 border-stone-100 dark:border-stone-800/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-600 text-white' : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{tab.label}</p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500">{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Widgets inside drawer */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
          <PWAInstallPrompt variant="banner" />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSearch();
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <Search className="w-4 h-4 text-stone-400" />
              <span>Search Registry</span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-amber-500" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Glassmorphic Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800 px-2 py-1.5 shadow-lg flex items-center justify-around">
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-600 dark:text-amber-500 font-bold scale-105'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] tracking-tight leading-none">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-emerald-600 dark:bg-amber-500" />
              )}
            </button>
          );
        })}

        {/* More Drawer Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
            ['guests', 'bookings', 'team'].includes(activeTab) || isMenuOpen
              ? 'text-emerald-600 dark:text-amber-500 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-medium'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none">More</span>
          {['guests', 'bookings', 'team'].includes(activeTab) && (
            <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-emerald-600 dark:bg-amber-500" />
          )}
        </button>
      </nav>
    </>
  );
}
