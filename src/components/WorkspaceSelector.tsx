'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Calendar, LayoutGrid, CheckCircle } from 'lucide-react';
import { Event } from '@/lib/mockData';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './ui/Dialog';

interface WorkspaceSelectorProps {
  events: Event[];
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
  onAddEvent: (name: string, date: string, gradient: string) => void;
  onDeleteEvent: (id: string) => void;
  isAdmin: boolean;
}

const FESTIVE_GRADIENTS = [
  { label: 'Henna Green (Mehendi)', value: 'from-emerald-650 via-emerald-800 to-green-900' },
  { label: 'Marigold Yellow (Haldi)', value: 'from-amber-400 via-amber-500 to-yellow-600' },
  { label: 'Emerald & Gold (Nikah)', value: 'from-emerald-800 via-teal-900 to-amber-700' },
  { label: 'Champagne Gold (Reception)', value: 'from-amber-600 via-rose-850 to-stone-900' },
  { label: 'Royal Purple (Sangeet)', value: 'from-purple-700 via-fuchsia-800 to-slate-900' },
  { label: 'Rose Pink (Engagement)', value: 'from-rose-500 via-pink-600 to-stone-900' }
];

export default function WorkspaceSelector({
  events,
  selectedEventId,
  onSelectEvent,
  onAddEvent,
  onDeleteEvent,
  isAdmin
}: WorkspaceSelectorProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(FESTIVE_GRADIENTS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDate) return;
    onAddEvent(eventName, eventDate, selectedGradient);
    setEventName('');
    setEventDate('');
    setSelectedGradient(FESTIVE_GRADIENTS[0].value);
    setIsAddOpen(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wider text-stone-500 dark:text-stone-400 uppercase flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-amber-500" />
          Event Workspaces
        </h2>
        {isAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 dark:border-emerald-400/15 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workspace Card: Dashboard Overview */}
        <button
          onClick={() => onSelectEvent(null)}
          className={`relative overflow-hidden rounded-xl p-5 border text-left transition-all duration-300 ${
            selectedEventId === null
              ? 'border-amber-500 bg-stone-50 dark:bg-stone-900 shadow-lg shadow-amber-500/5'
              : 'border-stone-200 hover:border-amber-500/50 bg-white dark:border-stone-800 dark:bg-stone-900/60'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Overview
            </span>
            <CheckCircle className={`w-5 h-5 ${selectedEventId === null ? 'text-amber-500' : 'text-stone-300 dark:text-stone-700'}`} />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-850 dark:text-stone-100">
            Main Dashboard
        </h3>
          <p className="text-xs text-stone-500 mt-1">Wedding Central Hub</p>
        </button>

        {/* Dynamic Workspace Cards */}
        {events.map(event => {
          const isSelected = selectedEventId === event.id;
          const eventDateObj = new Date(event.date);
          const formattedDate = eventDateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });

          return (
            <div
              key={event.id}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 bg-white dark:bg-stone-900/60 ${
                isSelected
                  ? 'border-amber-500 shadow-lg shadow-amber-500/5'
                  : 'border-stone-200 hover:border-amber-500/50 dark:border-stone-800'
              }`}
            >
              {/* Top Gradient strip */}
              <div className={`h-1.5 bg-gradient-to-r ${event.color_gradient}`} />

              <div className="p-5 flex flex-col justify-between h-full min-h-[120px]">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {formattedDate}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete event "${event.name}"? This deletes all associated tasks, shopping items and budget entries.`)) {
                            onDeleteEvent(event.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 p-1 rounded transition-opacity"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectEvent(event.id)}
                    className="w-full text-left"
                  >
                    <h3 className="font-serif text-lg font-bold text-stone-850 dark:text-stone-100 hover:text-amber-500 transition-colors">
                      {event.name}
                    </h3>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400 font-medium mb-1">
                    <span>Progress</span>
                    <span>{event.completion_percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${event.color_gradient}`}
                      style={{ width: `${event.completion_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Dialog */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Event Workspace</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                placeholder="e.g. Sangeet Ceremony"
                required
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
                Select Color Theme Gradient
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FESTIVE_GRADIENTS.map(grad => (
                  <button
                    key={grad.value}
                    type="button"
                    onClick={() => setSelectedGradient(grad.value)}
                    className={`flex items-center gap-2 p-2 border rounded-lg text-left transition-all ${
                      selectedGradient === grad.value
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-stone-50 dark:bg-stone-850'
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${grad.value}`} />
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">
                      {grad.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-colors shadow-md shadow-emerald-700/10"
            >
              Create Workspace
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
