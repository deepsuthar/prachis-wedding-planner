'use client';

import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2, Calendar, FileText, CheckCircle, Clock, AlertTriangle, Phone, ExternalLink, Info, ShieldCheck } from 'lucide-react';
import { VendorBooking, Profile, Event, VENDOR_LEAD_TIMES } from '@/lib/mockData';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './ui/Dialog';
import { getBookingUrgency, formatCurrency } from '@/lib/utils';
import triggerConfetti from './ui/Confetti';

interface VendorBookingsProps {
  bookings: VendorBooking[];
  events: Event[];
  currentUser: Profile;
  weddingDate: string;
  onAddBooking: (booking: VendorBooking) => void;
  onUpdateBooking: (booking: VendorBooking) => void;
  onDeleteBooking: (id: string) => void;
}

const BOOKING_CATEGORIES = [
  'Venue',
  'Food Catering',
  'Photographer',
  'Videographer',
  'Decoration',
  'Flowers',
  'Lighting',
  'Wedding Clothes / Tailor',
  'Makeup Artist',
  'Jeweler',
  'Invitation Cards Printing',
  'DJ / Sound',
  'Transportation',
  'Accommodation / Guest Hotel',
  'Mehendi Artist',
  'Others'
];

export default function VendorBookings({
  bookings,
  events,
  currentUser,
  weddingDate,
  onAddBooking,
  onUpdateBooking,
  onDeleteBooking
}: VendorBookingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<VendorBooking | null>(null);

  // Form states
  const [formVendorName, setFormVendorName] = useState('');
  const [formCategory, setFormCategory] = useState(BOOKING_CATEGORIES[0]);
  const [formEventId, setFormEventId] = useState('');
  const [formStatus, setFormStatus] = useState<VendorBooking['booking_status']>('not_booked');
  const [formBookingDate, setFormBookingDate] = useState('');
  const [formContractSigned, setFormContractSigned] = useState(false);
  const [formAdvancePaid, setFormAdvancePaid] = useState(0);
  const [formBalanceDue, setFormBalanceDue] = useState(0);
  const [formPaymentDueDate, setFormPaymentDueDate] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formTrialDate, setFormTrialDate] = useState('');
  const [formFittingDate, setFormFittingDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formContractUrl, setFormContractUrl] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Stats Calculations
  const totalBookingsNeeded = BOOKING_CATEGORIES.length;
  // Confirmed are Booked or Confirmed statuses
  const confirmedCount = bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'booked').length;
  const pendingCount = bookings.filter(b => b.booking_status !== 'confirmed' && b.booking_status !== 'booked' && b.booking_status !== 'cancelled').length;
  
  // Overdue based on lead times
  const overdueBookings = bookings.filter(b => {
    const urgency = getBookingUrgency(b.category, b.booking_status, weddingDate);
    return urgency.level === 'overdue';
  });

  const bookingProgress = Math.round((confirmedCount / totalBookingsNeeded) * 100);

  // Fittings & Trials list
  const upcomingTrials = bookings.filter(b => b.trial_date || b.fitting_date);

  const handleOpenAdd = () => {
    setEditingBooking(null);
    setFormVendorName('');
    setFormCategory(BOOKING_CATEGORIES[0]);
    setFormEventId(events[0]?.id || '');
    setFormStatus('not_booked');
    setFormBookingDate('');
    setFormContractSigned(false);
    setFormAdvancePaid(0);
    setFormBalanceDue(0);
    setFormPaymentDueDate('');
    setFormContactPerson('');
    setFormContactPhone('');
    setFormTrialDate('');
    setFormFittingDate('');
    setFormNotes('');
    setFormContractUrl('');
    setIsOpen(true);
  };

  const handleOpenEdit = (booking: VendorBooking) => {
    setEditingBooking(booking);
    setFormVendorName(booking.vendor_name || '');
    setFormCategory(booking.category);
    setFormEventId(booking.event_id || '');
    setFormStatus(booking.booking_status);
    setFormBookingDate(booking.booking_date ? booking.booking_date.substring(0, 10) : '');
    setFormContractSigned(booking.contract_signed);
    setFormAdvancePaid(booking.advance_paid);
    setFormBalanceDue(booking.balance_due);
    setFormPaymentDueDate(booking.payment_due_date ? booking.payment_due_date.substring(0, 10) : '');
    setFormContactPerson(booking.contact_person || '');
    setFormContactPhone(booking.contact_phone || '');
    setFormTrialDate(booking.trial_date ? booking.trial_date.substring(0, 16) : '');
    setFormFittingDate(booking.fitting_date ? booking.fitting_date.substring(0, 16) : '');
    setFormNotes(booking.notes || '');
    setFormContractUrl(booking.contract_url || '');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory) return;

    const bookingData: VendorBooking = {
      id: editingBooking ? editingBooking.id : `vb-${Date.now()}`,
      vendor_name: formVendorName || undefined,
      category: formCategory,
      event_id: formEventId || undefined,
      booking_status: formStatus,
      booking_date: formBookingDate ? new Date(formBookingDate).toISOString() : undefined,
      contract_signed: formContractSigned,
      advance_paid: formAdvancePaid,
      balance_due: formBalanceDue,
      payment_due_date: formPaymentDueDate ? new Date(formPaymentDueDate).toISOString() : undefined,
      contact_person: formContactPerson || undefined,
      contact_phone: formContactPhone || undefined,
      trial_date: formTrialDate ? new Date(formTrialDate).toISOString() : undefined,
      fitting_date: formFittingDate ? new Date(formFittingDate).toISOString() : undefined,
      notes: formNotes || undefined,
      contract_url: formContractUrl || undefined
    };

    if (editingBooking) {
      onUpdateBooking(bookingData);
      if ((formStatus === 'confirmed' || formStatus === 'booked') && editingBooking.booking_status !== 'confirmed' && editingBooking.booking_status !== 'booked') {
        triggerConfetti();
      }
    } else {
      onAddBooking(bookingData);
    }
    setIsOpen(false);
  };

  const handleSimulateContractUpload = () => {
    setFormContractUrl(`/contracts/agreement_${formCategory.toLowerCase().replace(/[^a-z]/g, '_')}.pdf`);
    setFormContractSigned(true);
    alert('Simulated agreement PDF uploaded and verified!');
  };

  return (
    <div className="space-y-6">
      {/* Booking Dashboard Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Progress Ring Stats */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-xl shadow-sm flex flex-col justify-between items-center text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Bookings Progress</span>
          
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="38" className="stroke-stone-100 dark:stroke-stone-800 fill-none" strokeWidth="6" />
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-emerald-600 dark:stroke-emerald-500 fill-none transition-all duration-1000"
                strokeWidth="6"
                strokeDasharray={238}
                strokeDashoffset={238 - (238 * bookingProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-lg font-serif font-extrabold text-stone-800 dark:text-stone-150">{bookingProgress}%</span>
          </div>

          <span className="text-[10px] text-stone-400 mt-2 font-medium">
            {confirmedCount} of {totalBookingsNeeded} Categories Booked
          </span>
        </div>

        {/* Detailed counts */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-xl shadow-sm md:col-span-2 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Critical Booking Statuses</span>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-lg text-center">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xl block">{confirmedCount}</span>
              <span className="text-[9px] text-stone-400 font-semibold uppercase tracking-wider">Confirmed</span>
            </div>
            <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-lg text-center">
              <span className="text-amber-500 font-extrabold text-xl block">{pendingCount}</span>
              <span className="text-[9px] text-stone-400 font-semibold uppercase tracking-wider">Negotiating</span>
            </div>
            <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-lg text-center border border-rose-500/10">
              <span className="text-rose-500 font-extrabold text-xl block">{overdueBookings.length}</span>
              <span className="text-[9px] text-rose-400 font-semibold uppercase tracking-wider">Overdue</span>
            </div>
          </div>
        </div>

        {/* Upcoming fittings/trials summary */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-xl shadow-sm md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Fittings & Tastings Schedules</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold">{upcomingTrials.length} events</span>
          </div>

          <div className="space-y-2 max-h-24 overflow-y-auto">
            {upcomingTrials.length === 0 ? (
              <p className="text-[10px] text-stone-400 italic">No tasting or fitting schedules logged yet.</p>
            ) : (
              upcomingTrials.map(t => {
                const dateStr = t.trial_date || t.fitting_date;
                const formatted = dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }) : '';
                return (
                  <div key={t.id} className="text-[10px] border-b border-stone-50 dark:border-stone-850 pb-1 flex justify-between items-center">
                    <span className="font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[120px]">
                      {t.vendor_name || 'TBA'} ({t.category})
                    </span>
                    <span className="text-amber-600 font-medium shrink-0">
                      {t.trial_date ? 'Trial' : 'Fitting'}: {formatted}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main categories listing grid */}
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-150 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900 flex justify-between items-center">
          <h3 className="font-serif text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            Required Booking Items & Urgency Levels
          </h3>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-2.5 py-1.5 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Custom Booking
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {BOOKING_CATEGORIES.map(category => {
            // Find existing record
            const record = bookings.find(b => b.category === category);
            const status = record ? record.booking_status : 'not_booked';
            const urgency = getBookingUrgency(category, status, weddingDate);

            return (
              <div
                key={category}
                onClick={() => {
                  if (record) {
                    handleOpenEdit(record);
                  } else {
                    // Pre-fill categories name and prompt dialog
                    setEditingBooking(null);
                    setFormVendorName('');
                    setFormCategory(category);
                    setFormEventId(events[0]?.id || '');
                    setFormStatus('not_booked');
                    setFormBookingDate('');
                    setFormContractSigned(false);
                    setFormAdvancePaid(0);
                    setFormBalanceDue(0);
                    setFormPaymentDueDate('');
                    setFormContactPerson('');
                    setFormContactPhone('');
                    setFormTrialDate('');
                    setFormFittingDate('');
                    setFormNotes('');
                    setFormContractUrl('');
                    setIsOpen(true);
                  }
                }}
                className={`bg-white dark:bg-stone-900 border p-4 rounded-xl shadow-sm hover:border-amber-500/50 hover:shadow-md cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  record ? 'border-stone-200/90 dark:border-stone-800' : 'border-stone-150 border-dashed dark:border-stone-850'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate max-w-[120px]">
                      {category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${urgency.colorClass}`}>
                      {urgency.badgeText}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-stone-850 dark:text-stone-100">
                    {record && record.vendor_name ? record.vendor_name : 'Not Booked Yet'}
                  </h4>

                  {record && (
                    <div className="grid grid-cols-2 gap-2 mt-4 border-t border-stone-50 dark:border-stone-850 pt-2.5 text-[9px] font-medium text-stone-500">
                      <div>
                        <span>Deposit: </span>
                        <span className="font-bold text-stone-700 dark:text-stone-300">{formatCurrency(record.advance_paid)}</span>
                      </div>
                      <div>
                        <span>Balance: </span>
                        <span className="font-bold text-stone-700 dark:text-stone-300">{formatCurrency(record.balance_due)}</span>
                      </div>
                    </div>
                  )}

                  {!record && (
                    <p className="text-[9px] text-stone-400 mt-2 flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <Info className="w-3 h-3 text-amber-500" />
                      Suggested Lead Time: {VENDOR_LEAD_TIMES[category]} months
                    </p>
                  )}
                </div>

                {record && (
                  <div className="flex justify-between items-center border-t border-dashed border-stone-100 dark:border-stone-800 pt-2.5 mt-3 text-[9px] text-stone-400">
                    <span className="capitalize font-semibold">Status: {record.booking_status}</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      {record.contract_signed && (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3 fill-current" />
                          Contract
                        </span>
                      )}
                      {record.contact_phone && (
                        <Phone className="w-3 h-3 text-stone-400" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor/Adder Dialog */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingBooking ? 'Vendor Booking Profile' : 'Book Vendor Service'}</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Vendor Name / Business</label>
              <input
                type="text"
                placeholder="e.g. Grand Palace Hotel"
                value={formVendorName}
                onChange={e => setFormVendorName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Category Type</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                >
                  {BOOKING_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Booking Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-750"
                >
                  <option value="not_booked">Not Booked</option>
                  <option value="enquired">Enquired</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="booked">Booked (Deposit Unconfirmed)</option>
                  <option value="confirmed">Confirmed (Fully Booked)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Booking Date</label>
                <input
                  type="date"
                  value={formBookingDate}
                  onChange={e => setFormBookingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Target Function Event</label>
                <select
                  value={formEventId}
                  onChange={e => setFormEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                >
                  <option value="">Select Event</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Advance Paid</label>
                <input
                  type="number"
                  min={0}
                  value={formAdvancePaid}
                  onChange={e => setFormAdvancePaid(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Balance Due</label>
                <input
                  type="number"
                  min={0}
                  value={formBalanceDue}
                  onChange={e => setFormBalanceDue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Balance Due Date</label>
                <input
                  type="date"
                  value={formPaymentDueDate}
                  onChange={e => setFormPaymentDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-750"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Coordinator"
                  value={formContactPerson}
                  onChange={e => setFormContactPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 99999 88888"
                  value={formContactPhone}
                  onChange={e => setFormContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Trials & Fittings scheduling */}
            <div className="grid grid-cols-2 gap-3 border-t border-stone-150 dark:border-stone-850 pt-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Trial/Sample Date (Tasting/Makeup)</label>
                <input
                  type="datetime-local"
                  value={formTrialDate}
                  onChange={e => setFormTrialDate(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Outfit Fitting Date</label>
                <input
                  type="datetime-local"
                  value={formFittingDate}
                  onChange={e => setFormFittingDate(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Notes / Terms</label>
              <textarea
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-750 rounded-lg bg-transparent text-stone-700 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Agreement uploads */}
            <div className="border-t border-stone-150 dark:border-stone-850 pt-4 flex items-center justify-between">
              <div>
                <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">Service Contract</span>
                {formContractUrl ? (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Agreement Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 italic">No contract uploaded.</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSimulateContractUpload}
                className="text-xs font-semibold px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 transition-colors"
              >
                Simulate Contract Upload
              </button>
            </div>
          </DialogContent>

          <DialogFooter>
            {editingBooking && isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this vendor booking?')) {
                    onDeleteBooking(editingBooking.id);
                    setIsOpen(false);
                  }
                }}
                className="mr-auto p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-100 rounded-lg transition-colors"
                title="Delete Booking"
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
              {editingBooking ? 'Save Changes' : 'Confirm Booking'}
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
