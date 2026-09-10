import { createClient } from '@supabase/supabase-js';
import {
  Profile,
  Event,
  Task,
  ShoppingItem,
  BudgetItem,
  Guest,
  VendorBooking,
  initialProfiles,
  VENDOR_LEAD_TIMES
} from './mockData';

// Initialize Supabase Client if env vars are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Storage keys for localStorage backup
const KEYS = {
  PROFILES: 'pwp_profiles',
  EVENTS: 'pwp_events',
  TASKS: 'pwp_tasks',
  SHOPPING: 'pwp_shopping',
  BUDGET: 'pwp_budget',
  GUESTS: 'pwp_guests',
  VENDORS: 'pwp_vendors',
  CURRENT_USER: 'pwp_current_user',
  DB_MODE: 'pwp_db_mode'
};

// Event emitter for realtime updates simulation
type SubscriptionCallback = () => void;
class DatabaseEmitter {
  private listeners: Set<SubscriptionCallback> = new Set();

  subscribe(callback: SubscriptionCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Subscription callback error:', err);
      }
    });
  }
}

export const dbEmitter = new DatabaseEmitter();

const isBrowser = typeof window !== 'undefined';

// Safe getter/setter for local backup
const loadLocal = <T>(key: string, defaultValue: T): T => {
  if (!isBrowser) return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
};

const saveLocal = <T>(key: string, value: T) => {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
  dbEmitter.notify();
};

// Setup realtime subscriptions to Supabase if available
if (supabase && isBrowser) {
  const channels = ['profiles', 'events', 'tasks', 'task_assignments', 'shopping', 'budget', 'guests', 'vendor_bookings'];
  channels.forEach(table => {
    supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', filter: '*', schema: 'public', table }, () => {
        dbEmitter.notify();
      })
      .subscribe();
  });
}

let activeDbMode: 'supabase' | 'local' = supabase ? 'supabase' : 'local';

// Setup empty templates for critical vendor booking categories
const generateEmptyVendorBookings = (): VendorBooking[] => {
  const categories = [
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

  return categories.map((cat, idx) => ({
    id: `vb-empty-${idx}`,
    vendor_name: undefined,
    category: cat,
    event_id: undefined,
    booking_status: 'not_booked',
    booking_date: undefined,
    contract_signed: false,
    advance_paid: 0,
    balance_due: 0,
    payment_due_date: undefined,
    contact_person: undefined,
    contact_phone: undefined,
    trial_date: undefined,
    fitting_date: undefined,
    notes: undefined,
    contract_url: undefined
  }));
};

const emptyVendorBookings = generateEmptyVendorBookings();

export const db = {
  getDbMode(): 'supabase' | 'local' {
    if (!supabase) return 'local';
    return activeDbMode;
  },

  setDbMode(mode: 'supabase' | 'local') {
    activeDbMode = mode;
    if (isBrowser) {
      localStorage.setItem(KEYS.DB_MODE, mode);
    }
    dbEmitter.notify();
  },

  // 1. PROFILES
  getProfiles(): Profile[] {
    if (supabase && activeDbMode === 'supabase') {
      supabase.from('profiles').select('*').then(({ data, error }) => {
        if (error) {
          if (error.code === '42P01') activeDbMode = 'local';
        } else if (data && data.length > 0) {
          const profilesList: Profile[] = data.map(d => ({
            id: d.id,
            email: d.email,
            full_name: d.full_name,
            role: d.role,
            phone: d.phone
          }));
          const currentLocal = localStorage.getItem(KEYS.PROFILES);
          if (JSON.stringify(profilesList) !== currentLocal) {
            localStorage.setItem(KEYS.PROFILES, JSON.stringify(profilesList));
            dbEmitter.notify();
          }
        } else if (data && data.length === 0) {
          // Auto-seed active profiles so the switcher is functional
          initialProfiles.forEach(p => {
            supabase.from('profiles').upsert({
              id: p.id,
              email: p.email,
              full_name: p.full_name,
              role: p.role,
              phone: p.phone
            });
          });
        }
      });
    }
    return loadLocal<Profile[]>(KEYS.PROFILES, initialProfiles);
  },

  saveProfile(profile: Profile) {
    const list = this.getProfiles();
    const idx = list.findIndex(p => p.id === profile.id);
    if (idx >= 0) list[idx] = profile;
    else list.push(profile);
    saveLocal(KEYS.PROFILES, list);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('profiles').upsert({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        phone: profile.phone
      }).then();
    }
  },

  deleteProfile(id: string) {
    const list = this.getProfiles();
    const filtered = list.filter(p => p.id !== id);
    saveLocal(KEYS.PROFILES, filtered);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('profiles').delete().eq('id', id).then();
    }
  },

  getCurrentUser(): Profile | null {
    if (!isBrowser) return null;
    const stored = localStorage.getItem(KEYS.CURRENT_USER);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as Profile;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: Profile | null) {
    if (!isBrowser) return;
    if (user === null) {
      localStorage.removeItem(KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    }
    dbEmitter.notify();
  },

  // 2. EVENTS
  getEvents(): Event[] {
    if (supabase && activeDbMode === 'supabase') {
      supabase.from('events').select('*').then(({ data, error }) => {
        if (error) {
          if (error.code === '42P01') activeDbMode = 'local';
        } else if (data) {
          const eventsList: Event[] = data.map(d => ({
            id: d.id,
            name: d.name,
            date: d.date,
            color_gradient: d.color_gradient,
            completion_percentage: Number(d.completion_percentage),
            is_archived: d.is_archived
          }));
          const currentLocal = localStorage.getItem(KEYS.EVENTS);
          if (JSON.stringify(eventsList) !== currentLocal) {
            localStorage.setItem(KEYS.EVENTS, JSON.stringify(eventsList));
            dbEmitter.notify();
          }
        }
      });
    }

    const events = loadLocal<Event[]>(KEYS.EVENTS, []);
    const tasks = this.getTasks();
    const updatedEvents = events.map(event => {
      const eventTasks = tasks.filter(t => t.event_id === event.id);
      if (eventTasks.length === 0) return event;
      const completedTasks = eventTasks.filter(t => t.status === 'completed');
      const percentage = Math.round((completedTasks.length / eventTasks.length) * 100);
      return { ...event, completion_percentage: percentage };
    });
    return updatedEvents;
  },

  saveEvent(event: Event) {
    const list = loadLocal<Event[]>(KEYS.EVENTS, []);
    const idx = list.findIndex(e => e.id === event.id);
    if (idx >= 0) list[idx] = event;
    else list.push(event);
    saveLocal(KEYS.EVENTS, list);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('events').upsert({
        id: event.id,
        name: event.name,
        date: event.date,
        color_gradient: event.color_gradient,
        completion_percentage: event.completion_percentage,
        is_archived: event.is_archived
      }).then();
    }
  },

  deleteEvent(eventId: string) {
    const list = loadLocal<Event[]>(KEYS.EVENTS, []);
    const filtered = list.filter(e => e.id !== eventId);
    saveLocal(KEYS.EVENTS, filtered);

    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => t.event_id !== eventId);
    saveLocal(KEYS.TASKS, filteredTasks);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('events').delete().eq('id', eventId).then();
    }
  },

  // 3. TASKS
  getTasks(): Task[] {
    if (supabase && activeDbMode === 'supabase') {
      Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('task_assignments').select('*')
      ]).then(([tasksRes, assignmentsRes]) => {
        if (tasksRes.error || assignmentsRes.error) return;
        const tasksData = tasksRes.data;
        const assignmentsData = assignmentsRes.data || [];

        if (tasksData) {
          const tasksList: Task[] = tasksData.map(t => {
            const taskAssigns = assignmentsData
              .filter(a => a.task_id === t.id)
              .map(a => a.profile_id);

            return {
              id: t.id,
              event_id: t.event_id,
              name: t.name,
              description: t.description,
              category: t.category,
              priority: t.priority,
              due_date: t.due_date,
              status: t.status,
              checklist: typeof t.checklist === 'string' ? JSON.parse(t.checklist) : t.checklist,
              comments: typeof t.comments === 'string' ? JSON.parse(t.comments) : t.comments,
              completion_percentage: Number(t.completion_percentage),
              assigned_to: taskAssigns
            };
          });

          const currentLocal = localStorage.getItem(KEYS.TASKS);
          if (JSON.stringify(tasksList) !== currentLocal) {
            localStorage.setItem(KEYS.TASKS, JSON.stringify(tasksList));
            dbEmitter.notify();
          }
        }
      });
    }
    return loadLocal<Task[]>(KEYS.TASKS, []);
  },

  saveTask(task: Task) {
    const list = this.getTasks();
    const idx = list.findIndex(t => t.id === task.id);
    if (idx >= 0) list[idx] = task;
    else list.push(task);
    saveLocal(KEYS.TASKS, list);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('tasks').upsert({
        id: task.id,
        event_id: task.event_id,
        name: task.name,
        description: task.description,
        category: task.category,
        priority: task.priority,
        due_date: task.due_date,
        status: task.status,
        checklist: task.checklist,
        comments: task.comments,
        completion_percentage: task.completion_percentage
      }).then(() => {
        supabase.from('task_assignments').delete().eq('task_id', task.id).then(() => {
          task.assigned_to.forEach(profileId => {
            supabase.from('task_assignments').insert({
              task_id: task.id,
              profile_id: profileId
            }).then();
          });
        });
      });
    }
  },

  deleteTask(taskId: string) {
    const list = this.getTasks();
    const filtered = list.filter(t => t.id !== taskId);
    saveLocal(KEYS.TASKS, filtered);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('tasks').delete().eq('id', taskId).then();
    }
  },

  // 4. SHOPPING
  getShopping(): ShoppingItem[] {
    if (supabase && activeDbMode === 'supabase') {
      supabase.from('shopping').select('*').then(({ data, error }) => {
        if (error) return;
        if (data) {
          const shoppingList: ShoppingItem[] = data.map(d => ({
            id: d.id,
            event_id: d.event_id,
            name: d.name,
            category: d.category,
            quantity: d.quantity,
            budget: Number(d.budget),
            actual_price: Number(d.actual_price),
            store: d.store,
            status: d.status,
            assigned_to: d.assigned_to,
            receipt_url: d.receipt_url
          }));
          const currentLocal = localStorage.getItem(KEYS.SHOPPING);
          if (JSON.stringify(shoppingList) !== currentLocal) {
            localStorage.setItem(KEYS.SHOPPING, JSON.stringify(shoppingList));
            dbEmitter.notify();
          }
        }
      });
    }
    return loadLocal<ShoppingItem[]>(KEYS.SHOPPING, []);
  },

  saveShoppingItem(item: ShoppingItem) {
    const list = this.getShopping();
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    saveLocal(KEYS.SHOPPING, list);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('shopping').upsert({
        id: item.id,
        event_id: item.event_id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        budget: item.budget,
        actual_price: item.actual_price,
        store: item.store,
        status: item.status,
        assigned_to: item.assigned_to || null,
        receipt_url: item.receipt_url || null
      }).then();
    }
  },

  deleteShoppingItem(itemId: string) {
    const list = this.getShopping();
    const filtered = list.filter(i => i.id !== itemId);
    saveLocal(KEYS.SHOPPING, filtered);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('shopping').delete().eq('id', itemId).then();
    }
  },

  // 5. BUDGET
  getBudget(): BudgetItem[] {
    if (supabase && activeDbMode === 'supabase') {
      supabase.from('budget').select('*').then(({ data, error }) => {
        if (error) return;
        if (data) {
          const budgetList: BudgetItem[] = data.map(d => ({
            id: d.id,
            event_id: d.event_id,
            category: d.category,
            allocated: Number(d.allocated),
            actual: Number(d.actual),
            paid: Number(d.paid),
            notes: d.notes
          }));
          const currentLocal = localStorage.getItem(KEYS.BUDGET);
          if (JSON.stringify(budgetList) !== currentLocal) {
            localStorage.setItem(KEYS.BUDGET, JSON.stringify(budgetList));
            dbEmitter.notify();
          }
        }
      });
    }
    return loadLocal<BudgetItem[]>(KEYS.BUDGET, []);
  },

  saveBudgetItem(item: BudgetItem) {
    const list = this.getBudget();
    const idx = list.findIndex(b => b.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    saveLocal(KEYS.BUDGET, list);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('budget').upsert({
        id: item.id,
        event_id: item.event_id,
        category: item.category,
        allocated: item.allocated,
        actual: item.actual,
        paid: item.paid,
        notes: item.notes || null
      }).then();
    }
  },

  deleteBudgetItem(itemId: string) {
    const list = this.getBudget();
    const filtered = list.filter(b => b.id !== itemId);
    saveLocal(KEYS.BUDGET, filtered);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('budget').delete().eq('id', itemId).then();
    }
  },

  // 6. GUESTS
  getGuests(): Guest[] {
    if (supabase && activeDbMode === 'supabase') {
      supabase.from('guests').select('*').then(({ data, error }) => {
        if (error) return;
        if (data) {
          const guestsList: Guest[] = data.map(d => ({
            id: d.id,
            name: d.name,
            category: d.category,
            side: d.side,
            rsvp_status: d.rsvp_status,
            invitation_sent: d.invitation_sent,
            food_preference: d.food_preference,
            phone: d.phone
          }));
          const currentLocal = localStorage.getItem(KEYS.GUESTS);
          if (JSON.stringify(guestsList) !== currentLocal) {
            localStorage.setItem(KEYS.GUESTS, JSON.stringify(guestsList));
            dbEmitter.notify();
          }
        }
      });
    }
    return loadLocal<Guest[]>(KEYS.GUESTS, []);
  },

  saveGuest(guest: Guest) {
    const list = this.getGuests();
    const idx = list.findIndex(g => g.id === guest.id);
    if (idx >= 0) list[idx] = guest;
    else list.push(guest);
    saveLocal(KEYS.GUESTS, list);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('guests').upsert({
        id: guest.id,
        name: guest.name,
        category: guest.category,
        side: guest.side,
        rsvp_status: guest.rsvp_status,
        invitation_sent: guest.invitation_sent,
        food_preference: guest.food_preference,
        phone: guest.phone || null
      }).then();
    }
  },

  deleteGuest(guestId: string) {
    const list = this.getGuests();
    const filtered = list.filter(g => g.id !== guestId);
    saveLocal(KEYS.GUESTS, filtered);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('guests').delete().eq('id', guestId).then();
    }
  },

  // 7. VENDORS
  getVendorBookings(): VendorBooking[] {
    if (supabase && activeDbMode === 'supabase') {
      supabase.from('vendor_bookings').select('*').then(({ data, error }) => {
        if (error) return;
        if (data && data.length > 0) {
          const vendorsList: VendorBooking[] = data.map(d => ({
            id: d.id,
            vendor_name: d.vendor_name,
            category: d.category,
            event_id: d.event_id,
            booking_status: d.booking_status,
            booking_date: d.booking_date,
            contract_signed: d.contract_signed,
            advance_paid: Number(d.advance_paid),
            balance_due: Number(d.balance_due),
            payment_due_date: d.payment_due_date,
            contact_person: d.contact_person,
            contact_phone: d.contact_phone,
            trial_date: d.trial_date,
            fitting_date: d.fitting_date,
            notes: d.notes,
            contract_url: d.contract_url
          }));
          const currentLocal = localStorage.getItem(KEYS.VENDORS);
          if (JSON.stringify(vendorsList) !== currentLocal) {
            localStorage.setItem(KEYS.VENDORS, JSON.stringify(vendorsList));
            dbEmitter.notify();
          }
        } else if (data && data.length === 0) {
          // Seed ONLY empty vendor category slots to set up the tracker layout
          emptyVendorBookings.forEach(v => {
            supabase.from('vendor_bookings').insert({
              id: v.id,
              vendor_name: null,
              category: v.category,
              event_id: null,
              booking_status: 'not_booked',
              booking_date: null,
              contract_signed: false,
              advance_paid: 0,
              balance_due: 0,
              payment_due_date: null,
              contact_person: null,
              contact_phone: null,
              trial_date: null,
              fitting_date: null,
              notes: null,
              contract_url: null
            }).then();
          });
        }
      });
    }
    return loadLocal<VendorBooking[]>(KEYS.VENDORS, emptyVendorBookings);
  },

  saveVendorBooking(booking: VendorBooking) {
    const list = this.getVendorBookings();
    const idx = list.findIndex(v => v.id === booking.id);
    if (idx >= 0) list[idx] = booking;
    else list.push(booking);
    saveLocal(KEYS.VENDORS, list);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('vendor_bookings').upsert({
        id: booking.id,
        vendor_name: booking.vendor_name || null,
        category: booking.category,
        event_id: booking.event_id || null,
        booking_status: booking.booking_status,
        booking_date: booking.booking_date || null,
        contract_signed: booking.contract_signed,
        advance_paid: booking.advance_paid,
        balance_due: booking.balance_due,
        payment_due_date: booking.payment_due_date || null,
        contact_person: booking.contact_person || null,
        contact_phone: booking.contact_phone || null,
        trial_date: booking.trial_date || null,
        fitting_date: booking.fitting_date || null,
        notes: booking.notes || null,
        contract_url: booking.contract_url || null
      }).then();
    }
  },

  deleteVendorBooking(bookingId: string) {
    const list = this.getVendorBookings();
    const filtered = list.filter(v => v.id !== bookingId);
    saveLocal(KEYS.VENDORS, filtered);

    if (supabase && activeDbMode === 'supabase') {
      supabase.from('vendor_bookings').delete().eq('id', bookingId).then();
    }
  }
};
