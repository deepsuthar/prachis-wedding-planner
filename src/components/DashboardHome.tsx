'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, IndianRupee, Users, ShoppingBag, Clock, Heart, Award, ArrowUpRight, HelpCircle } from 'lucide-react';
import { Task, VendorBooking, Guest, ShoppingItem, BudgetItem, Profile, VENDOR_LEAD_TIMES } from '@/lib/mockData';
import { calculateCountdown, CountdownState, getBookingUrgency, formatCurrency } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardHomeProps {
  tasks: Task[];
  bookings: VendorBooking[];
  guests: Guest[];
  shopping: ShoppingItem[];
  budget: BudgetItem[];
  profiles: Profile[];
  currentUser: Profile;
  onSetCurrentUser: (user: Profile) => void;
  weddingDate: string;
}

export default function DashboardHome({
  tasks,
  bookings,
  guests,
  shopping,
  budget,
  profiles,
  currentUser,
  onSetCurrentUser,
  weddingDate
}: DashboardHomeProps) {
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  // Sync Live Countdown ticker
  useEffect(() => {
    setCountdown(calculateCountdown(weddingDate));
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(weddingDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  if (!countdown) return null;

  // Calculators
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overallTaskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Booking calculations
  const totalBookingsNeeded = bookings.length;
  const confirmedBookings = bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'booked').length;
  const overdueBookings = bookings.filter(b => {
    const urgency = getBookingUrgency(b.category, b.booking_status, weddingDate);
    return urgency.level === 'overdue';
  });

  // Budget calculations
  const totalAllocatedBudget = budget.reduce((sum, item) => sum + Number(item.allocated), 0);
  const totalActualSpent = budget.reduce((sum, item) => sum + Number(item.actual || item.paid), 0);
  const totalPaid = budget.reduce((sum, item) => sum + Number(item.paid), 0);
  const remainingBudget = totalAllocatedBudget - totalActualSpent;

  // Guest calculations
  const rsvpYes = guests.filter(g => g.rsvp_status === 'attending').length;
  const rsvpPending = guests.filter(g => g.rsvp_status === 'pending').length;
  const totalGuests = guests.length;

  // Shopping calculations
  const totalShoppingItems = shopping.length;
  const purchasedShoppingItems = shopping.filter(s => s.status === 'purchased').length;
  const shoppingProgress = totalShoppingItems > 0 ? Math.round((purchasedShoppingItems / totalShoppingItems) * 100) : 0;

  // Urgency Tasks filtering (due soon, priority is critical/high and not completed)
  const urgentTasks = tasks
    .filter(t => t.status !== 'completed' && (t.priority === 'critical' || t.priority === 'high'))
    .slice(0, 3);

  // Recharts: simple mini area chart showing budget spent by event categories
  const chartData = budget.map(b => ({
    name: b.category,
    Allocated: Number(b.allocated),
    Actual: Number(b.actual)
  }));

  return (
    <div className="space-y-8">
      {/* Role Switcher Sandbox Banner */}
      <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/80 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
            <span className="font-semibold text-amber-600 dark:text-amber-500">Sandbox Authorization Switcher:</span> Simulating active member authentication role.
          </p>
        </div>
        <div className="flex gap-2">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => onSetCurrentUser(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                currentUser.id === p.id
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-600 shadow'
                  : 'bg-white dark:bg-stone-850 hover:bg-stone-50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              {p.full_name} ({p.role.toUpperCase()})
            </button>
          ))}
        </div>
      </div>

      {/* Main Countdown & Greeting Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Greetings Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-stone-200/85 bg-white p-6 sm:p-8 dark:border-emerald-800/25 dark:bg-stone-900 flex flex-col justify-between shadow-sm">
          {/* Subtle floral/mandala watermark backdrop */}
          <div className="absolute right-0 bottom-0 text-emerald-500/5 pointer-events-none transform translate-x-12 translate-y-12">
            <Heart className="w-96 h-96" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-semibold text-sm mb-3">
              <Heart className="w-4.5 h-4.5 fill-current" />
              <span>Prachi & Amit’s Wedding Day</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              Namaste, {currentUser.full_name}!
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 max-w-xl">
              Welcome to your digital wedding sanctuary. Let's make every detail perfect. Currently logged in as <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentUser.role}</span> with custom view access permissions.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="mt-8 grid grid-cols-4 gap-3 max-w-md">
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Weeks', value: countdown.weeks },
              { label: 'Hours', value: countdown.hours },
              { label: 'Minutes', value: countdown.minutes }
            ].map(unit => (
              <div key={unit.label} className="bg-stone-50/50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800/60 p-3 rounded-xl text-center">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-amber-500 block">
                  {unit.value}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Circular Progress Ring Card */}
        <div className="rounded-2xl border border-stone-200/85 bg-white p-6 dark:border-emerald-800/25 dark:bg-stone-900 flex flex-col items-center justify-center text-center shadow-sm">
          <h3 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200 mb-4">
            Planning Progress
          </h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-stone-100 dark:stroke-stone-800 fill-none"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-emerald-600 dark:stroke-emerald-500 fill-none transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * overallTaskProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-serif text-stone-800 dark:text-stone-150">
                {overallTaskProgress}%
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">
                Tasks Done
              </span>
            </div>
          </div>
          
          <p className="text-xs text-stone-500 mt-4 leading-relaxed">
            {countdown.percentElapsed}% of your wedding planning window has elapsed. Keep it up!
          </p>
        </div>
      </div>

      {/* Urgency Engine Panel */}
      {(overdueBookings.length > 0 || urgentTasks.length > 0) && (
        <div className="border border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/10 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3.5">
            <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
            <h2 className="font-serif text-lg font-bold text-rose-700 dark:text-rose-400">
              Urgency Center: Action Items Required
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overdue Bookings */}
            {overdueBookings.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-rose-700/80 dark:text-rose-400/80 uppercase tracking-wider">
                  Overdue Bookings (Critical Lead Time Exceeded)
                </h3>
                <div className="space-y-1.5">
                  {overdueBookings.map(b => {
                    const urgency = getBookingUrgency(b.category, b.booking_status, weddingDate);
                    return (
                      <div key={b.id} className="flex items-center justify-between bg-white dark:bg-stone-900 border border-rose-500/10 rounded-lg p-2.5 text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-800 dark:text-stone-200">{b.category}</span>
                          <span className="text-[10px] text-stone-400">Suggested lead time: {VENDOR_LEAD_TIMES[b.category]} months</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          {urgency.badgeText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Overdue / High Priority Tasks */}
            {urgentTasks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-rose-700/80 dark:text-rose-400/80 uppercase tracking-wider">
                  Urgent Planner Tasks
                </h3>
                <div className="space-y-1.5">
                  {urgentTasks.map(t => {
                    const formattedDate = t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date';
                    return (
                      <div key={t.id} className="flex items-center justify-between bg-white dark:bg-stone-900 border border-rose-500/10 rounded-lg p-2.5 text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-800 dark:text-stone-200">{t.name}</span>
                          <span className="text-[10px] text-stone-400">Due: {formattedDate}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 capitalize">
                          {t.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid of Summaries / Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Budget Summary Card */}
        <div className="rounded-xl border border-stone-200/85 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Budget Balance</span>
            <IndianRupee className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-extrabold text-stone-800 dark:text-stone-150">
              {formatCurrency(remainingBudget)}
            </h3>
            <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2 font-medium">
              <span>Spent: {formatCurrency(totalActualSpent)}</span>
              <span>Paid: {formatCurrency(totalPaid)}</span>
            </div>
          </div>
          <div className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-emerald-600"
              style={{ width: `${Math.min(100, (totalActualSpent / totalAllocatedBudget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Vendors Booked Card */}
        <div className="rounded-xl border border-stone-200/85 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Bookings Tracker</span>
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-extrabold text-stone-800 dark:text-stone-150">
              {confirmedBookings} / {totalBookingsNeeded}
            </h3>
            <p className="text-[11px] text-stone-400 mt-2 font-medium">
              Required services confirmed
            </p>
          </div>
          <div className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-amber-500"
              style={{ width: `${totalBookingsNeeded > 0 ? (confirmedBookings / totalBookingsNeeded) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Guest RSVP Card */}
        <div className="rounded-xl border border-stone-200/85 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Guests RSVP</span>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-extrabold text-stone-800 dark:text-stone-150">
              {rsvpYes} / {totalGuests}
            </h3>
            <p className="text-[11px] text-stone-400 mt-2 font-medium">
              {rsvpPending} guest invitations pending response
            </p>
          </div>
          <div className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-emerald-600"
              style={{ width: `${totalGuests > 0 ? (rsvpYes / totalGuests) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Shopping Completed Card */}
        <div className="rounded-xl border border-stone-200/85 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Shopping Status</span>
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-extrabold text-stone-800 dark:text-stone-150">
              {shoppingProgress}%
            </h3>
            <p className="text-[11px] text-stone-400 mt-2 font-medium">
              {purchasedShoppingItems} of {totalShoppingItems} items purchased
            </p>
          </div>
          <div className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-amber-500"
              style={{ width: `${shoppingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analytics chart and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Budget Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200/85 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/60 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-stone-850 dark:text-stone-150 mb-4">
            Budget Distribution by Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f0" className="dark:stroke-stone-800" />
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={11} tickLine={false} />
                <YAxis stroke="#a8a29e" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Allocated" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorAllocated)" />
                <Area type="monotone" dataKey="Actual" stroke="#047857" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Activity & Contacts */}
        <div className="rounded-2xl border border-stone-200/85 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/60 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-850 dark:text-stone-150 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-stone-50/50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800/60 rounded-xl flex items-center justify-between text-xs hover:border-amber-500/20 transition-all">
                <span className="font-medium text-stone-700 dark:text-stone-300">Invite a Guest</span>
                <span className="text-[10px] text-stone-400">Guest List tab</span>
              </div>
              <div className="p-3 bg-stone-50/50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800/60 rounded-xl flex items-center justify-between text-xs hover:border-amber-500/20 transition-all">
                <span className="font-medium text-stone-700 dark:text-stone-300">Record Vendor Fitting</span>
                <span className="text-[10px] text-stone-400">Bookings tab</span>
              </div>
              <div className="p-3 bg-stone-50/50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800/60 rounded-xl flex items-center justify-between text-xs hover:border-amber-500/20 transition-all">
                <span className="font-medium text-stone-700 dark:text-stone-300">Update Shopping Receipt</span>
                <span className="text-[10px] text-stone-400">Shopping tab</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t border-stone-100 dark:border-stone-800/60 pt-4">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Upcoming Trial</h4>
            {bookings.filter(b => b.trial_date || b.fitting_date).slice(0, 1).map(b => {
              const trialDate = b.trial_date || b.fitting_date;
              const formattedTrial = trialDate ? new Date(trialDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div key={b.id} className="text-xs text-stone-600 dark:text-stone-300">
                  <p className="font-semibold">{b.vendor_name || 'TBA'} - {b.category}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{b.trial_date ? 'Trial tasting/makeup' : 'Clothes fitting'}: {formattedTrial}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
