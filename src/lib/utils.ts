import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VENDOR_LEAD_TIMES } from './mockData';

// Class merger utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format numbers as currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Live Countdown Calculator
export interface CountdownState {
  days: number;
  weeks: number;
  hours: number;
  minutes: number;
  seconds: number;
  percentElapsed: number;
  isOver: boolean;
}

export function calculateCountdown(weddingDateStr: string): CountdownState {
  const weddingDate = new Date(weddingDateStr).getTime();
  const now = new Date().getTime();
  const timeDifference = weddingDate - now;

  // Let's assume planning started on Feb 21, 2026 (1 year before Feb 21, 2027)
  const planningStartDate = new Date('2026-02-21T00:00:00Z').getTime();
  const totalPlanningTime = weddingDate - planningStartDate;
  const timeElapsed = now - planningStartDate;
  
  let percentElapsed = Math.round((timeElapsed / totalPlanningTime) * 100);
  percentElapsed = Math.max(0, Math.min(100, percentElapsed)); // bound between 0-100

  if (timeDifference <= 0) {
    return { days: 0, weeks: 0, hours: 0, minutes: 0, seconds: 0, percentElapsed: 100, isOver: true };
  }

  const seconds = Math.floor((timeDifference / 1000) % 60);
  const minutes = Math.floor((timeDifference / 1000 / 60) % 60);
  const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);

  return {
    days,
    weeks,
    hours,
    minutes,
    seconds,
    percentElapsed,
    isOver: false
  };
}

// Urgency Level types
export type UrgencyLevel = 'overdue' | 'urgent' | 'upcoming' | 'on_track';

export interface UrgencyInfo {
  level: UrgencyLevel;
  colorClass: string;
  badgeText: string;
  marginDays: number;
}

// Calculate Booking Urgency based on Category Lead Times
export function getBookingUrgency(category: string, bookingStatus: string, weddingDateStr: string): UrgencyInfo {
  if (bookingStatus === 'booked' || bookingStatus === 'confirmed') {
    return { level: 'on_track', colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', badgeText: 'Confirmed', marginDays: 999 };
  }
  if (bookingStatus === 'cancelled') {
    return { level: 'on_track', colorClass: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20', badgeText: 'Cancelled', marginDays: 999 };
  }

  const leadTimeMonths = VENDOR_LEAD_TIMES[category] || 2; // Default to 2 months if not specified
  const leadTimeDays = leadTimeMonths * 30.5;

  const weddingDate = new Date(weddingDateStr).getTime();
  const now = new Date().getTime();
  const daysRemaining = (weddingDate - now) / (1000 * 60 * 60 * 24);

  const marginDays = Math.round(daysRemaining - leadTimeDays);

  if (marginDays < 0) {
    return {
      level: 'overdue',
      colorClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse',
      badgeText: `Overdue by ${Math.abs(marginDays)}d`,
      marginDays
    };
  } else if (marginDays <= 30) {
    return {
      level: 'urgent',
      colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badgeText: `Urgent (${marginDays}d left)`,
      marginDays
    };
  } else if (marginDays <= 90) {
    return {
      level: 'upcoming',
      colorClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      badgeText: `Upcoming (${marginDays}d left)`,
      marginDays
    };
  } else {
    return {
      level: 'on_track',
      colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badgeText: 'On Track',
      marginDays
    };
  }
}
