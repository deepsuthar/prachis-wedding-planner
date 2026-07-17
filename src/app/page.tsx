'use client';

import React, { useState, useEffect } from 'react';
import { db, dbEmitter } from '@/lib/db';
import { Profile, Event, Task, ShoppingItem, BudgetItem, Guest, VendorBooking } from '@/lib/mockData';
import Header from '@/components/Header';
import WorkspaceSelector from '@/components/WorkspaceSelector';
import DashboardHome from '@/components/DashboardHome';
import TaskBoard from '@/components/TaskBoard';
import ShoppingPlanner from '@/components/ShoppingPlanner';
import BudgetManager from '@/components/BudgetManager';
import GuestList from '@/components/GuestList';
import VendorBookings from '@/components/VendorBookings';

export default function Home() {
  const WEDDING_DATE = '2027-02-21T09:00:00Z';

  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Dynamic Workspace Event Selection
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Database States
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);

  // Deep inspection sidebar link handlers
  const [openTaskTrigger, setOpenTaskTrigger] = useState<Task | null>(null);
  const [openBookingTrigger, setOpenBookingTrigger] = useState<VendorBooking | null>(null);

  // Sync state with local database
  const refreshDatabaseState = () => {
    setProfiles(db.getProfiles());
    setCurrentUser(db.getCurrentUser());
    setEvents(db.getEvents());
    setTasks(db.getTasks());
    setShopping(db.getShopping());
    setBudget(db.getBudget());
    setGuests(db.getGuests());
    setBookings(db.getVendorBookings());
  };

  // On Mount, initialize databases and subscribe to changes (Simulates Realtime)
  useEffect(() => {
    refreshDatabaseState();
    const unsubscribe = dbEmitter.subscribe(() => {
      refreshDatabaseState();
    });
    return () => unsubscribe();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center font-serif text-lg text-stone-500 animate-pulse">
          Loading Prachi's Wedding Planner...
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  // 1. Workspace Event Handlers
  const handleAddEvent = (name: string, date: string, gradient: string) => {
    const newEvent: Event = {
      id: `e-${Date.now()}`,
      name,
      date: new Date(date).toISOString(),
      color_gradient: gradient,
      completion_percentage: 0,
      is_archived: false
    };
    db.saveEvent(newEvent);
  };

  const handleDeleteEvent = (id: string) => {
    db.deleteEvent(id);
    if (selectedEventId === id) setSelectedEventId(null);
  };

  // 2. Task Handlers
  const handleAddTask = (task: Task) => db.saveTask(task);
  const handleUpdateTask = (task: Task) => db.saveTask(task);
  const handleDeleteTask = (id: string) => db.deleteTask(id);

  // 3. Shopping Handlers
  const handleAddShoppingItem = (item: ShoppingItem) => db.saveShoppingItem(item);
  const handleUpdateShoppingItem = (item: ShoppingItem) => db.saveShoppingItem(item);
  const handleDeleteShoppingItem = (id: string) => db.deleteShoppingItem(id);

  // 4. Budget Handlers
  const handleAddBudgetItem = (item: BudgetItem) => db.saveBudgetItem(item);
  const handleUpdateBudgetItem = (item: BudgetItem) => db.saveBudgetItem(item);
  const handleDeleteBudgetItem = (id: string) => db.deleteBudgetItem(id);

  // 5. Guest Handlers
  const handleAddGuest = (guest: Guest) => db.saveGuest(guest);
  const handleUpdateGuest = (guest: Guest) => db.saveGuest(guest);
  const handleDeleteGuest = (id: string) => db.deleteGuest(id);

  // 6. Booking Handlers
  const handleAddBooking = (booking: VendorBooking) => db.saveVendorBooking(booking);
  const handleUpdateBooking = (booking: VendorBooking) => db.saveVendorBooking(booking);
  const handleDeleteBooking = (id: string) => db.deleteVendorBooking(id);

  // 7. Testing Auth Profiles Switcher
  const handleSetCurrentUser = (user: Profile) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasks={tasks}
        guests={guests}
        bookings={bookings}
        budget={budget}
        shopping={shopping}
        weddingDate={WEDDING_DATE}
        onOpenTask={(t) => setOpenTaskTrigger(t)}
        onOpenBooking={(b) => setOpenBookingTrigger(b)}
      />

      {/* Main Panel Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Selector Widget */}
        <WorkspaceSelector
          events={events}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          isAdmin={isAdmin}
        />

        {/* Dynamic Route views */}
        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && (
            <DashboardHome
              tasks={tasks}
              bookings={bookings}
              guests={guests}
              shopping={shopping}
              budget={budget}
              profiles={profiles}
              currentUser={currentUser}
              onSetCurrentUser={handleSetCurrentUser}
              weddingDate={WEDDING_DATE}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard
              tasks={tasks}
              profiles={profiles}
              events={events}
              selectedEventId={selectedEventId}
              currentUser={currentUser}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'shopping' && (
            <ShoppingPlanner
              shopping={shopping}
              profiles={profiles}
              events={events}
              selectedEventId={selectedEventId}
              currentUser={currentUser}
              onAddShoppingItem={handleAddShoppingItem}
              onUpdateShoppingItem={handleUpdateShoppingItem}
              onDeleteShoppingItem={handleDeleteShoppingItem}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetManager
              budget={budget}
              events={events}
              selectedEventId={selectedEventId}
              currentUser={currentUser}
              onAddBudgetItem={handleAddBudgetItem}
              onUpdateBudgetItem={handleUpdateBudgetItem}
              onDeleteBudgetItem={handleDeleteBudgetItem}
            />
          )}

          {activeTab === 'guests' && (
            <GuestList
              guests={guests}
              currentUser={currentUser}
              onAddGuest={handleAddGuest}
              onUpdateGuest={handleUpdateGuest}
              onDeleteGuest={handleDeleteGuest}
            />
          )}

          {activeTab === 'bookings' && (
            <VendorBookings
              bookings={bookings}
              events={events}
              currentUser={currentUser}
              weddingDate={WEDDING_DATE}
              onAddBooking={handleAddBooking}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleDeleteBooking}
            />
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-6 border-t border-stone-200/50 dark:border-stone-850 bg-white dark:bg-stone-900/40 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest transition-colors mt-auto">
        Prachi’s Wedding Planner · Celebrating Love & Premium Design
      </footer>
    </div>
  );
}
