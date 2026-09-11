export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'family' | 'volunteer';
  phone?: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  color_gradient: string;
  completion_percentage: number;
  is_archived: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  category: string;
  assigned_to: string[]; // Profile IDs
  priority: 'critical' | 'high' | 'medium' | 'low';
  due_date: string;
  status: 'not_started' | 'in_progress' | 'waiting' | 'blocked' | 'completed' | 'cancelled';
  checklist: ChecklistItem[];
  comments: Comment[];
  completion_percentage: number;
}

export interface ShoppingItem {
  id: string;
  event_id: string;
  name: string;
  category: string;
  quantity: number;
  budget: number;
  actual_price: number;
  store?: string;
  status: 'pending' | 'purchased';
  assigned_to?: string; // Profile ID
  receipt_url?: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  allocated: number;
  actual: number;
  paid: number;
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  category: 'family' | 'friend' | 'vip';
  side: 'bride' | 'groom';
  rsvp_status: 'attending' | 'declined' | 'pending';
  invitation_sent: boolean;
  food_preference: string; // 'veg' | 'non-veg' | 'vegan'
  phone?: string;
}

export interface VendorBooking {
  id: string;
  vendor_name?: string;
  category: string;
  event_id?: string;
  booking_status: 'not_booked' | 'enquired' | 'negotiating' | 'booked' | 'confirmed' | 'cancelled';
  booking_date?: string;
  contract_signed: boolean;
  advance_paid: number;
  balance_due: number;
  payment_due_date?: string;
  contact_person?: string;
  contact_phone?: string;
  trial_date?: string;
  fitting_date?: string;
  notes?: string;
  contract_url?: string;
}

// Target lead times in months for bookings
export const VENDOR_LEAD_TIMES: Record<string, number> = {
  'Venue': 9,
  'Food Catering': 9,
  'Photographer': 8,
  'Videographer': 8,
  'Decoration': 6,
  'Flowers': 6,
  'Lighting': 6,
  'Wedding Clothes / Tailor': 4,
  'Makeup Artist': 4,
  'Jeweler': 4,
  'Invitation Cards Printing': 3,
  'DJ / Sound': 3,
  'Transportation': 3,
  'Accommodation / Guest Hotel': 3,
  'Mehendi Artist': 3,
  'Others': 2
};

export const initialProfiles: Profile[] = [
  { id: 'p-1', email: 'prachi@wedding.com', full_name: 'Prachi Patel', role: 'admin', phone: '+919876543210' },
  { id: 'p-2', email: 'ronak@wedding.com', full_name: 'Ronak Shah', role: 'admin', phone: '+919876543211' }
];

export const initialEvents: Event[] = [
  { id: 'e-1', name: 'Mehendi', date: '2027-02-18T16:00:00Z', color_gradient: 'from-emerald-650 via-emerald-800 to-green-900', completion_percentage: 60, is_archived: false },
  { id: 'e-2', name: 'Haldi', date: '2027-02-19T10:00:00Z', color_gradient: 'from-amber-400 via-amber-500 to-yellow-600', completion_percentage: 45, is_archived: false },
  { id: 'e-3', name: 'Nikah', date: '2027-02-21T09:00:00Z', color_gradient: 'from-emerald-800 via-teal-900 to-amber-700', completion_percentage: 20, is_archived: false },
  { id: 'e-4', name: 'Reception', date: '2027-02-21T19:00:00Z', color_gradient: 'from-amber-600 via-rose-850 to-stone-900', completion_percentage: 10, is_archived: false }
];

export const initialTasks: Task[] = [
  // Mehendi Tasks
  {
    id: 't-1',
    event_id: 'e-1',
    name: 'Finalize Mehendi Artist',
    description: 'Review portfolio designs, select style (Arabic vs Traditional), and confirm timings.',
    category: 'Bookings',
    assigned_to: ['p-1', 'p-4'],
    priority: 'high',
    due_date: '2026-11-15T18:30:00Z',
    status: 'completed',
    checklist: [
      { id: 'c-1-1', text: 'Select Top 3 Artists', completed: true },
      { id: 'c-1-2', text: 'Take trials', completed: true },
      { id: 'c-1-3', text: 'Confirm booking deposit', completed: true }
    ],
    comments: [
      { id: 'cm-1-1', author: 'Prachi Patel', text: 'Spoke to Alpa, she is booked for Feb 18!', timestamp: '2026-07-10T11:00:00Z' }
    ],
    completion_percentage: 100
  },
  {
    id: 't-2',
    event_id: 'e-1',
    name: 'Order Henna Cones & Green Theme Decor',
    description: 'Ensure natural, organic henna is purchased. Select green/floral decor options.',
    category: 'Decorations',
    assigned_to: ['p-3'],
    priority: 'medium',
    due_date: '2026-12-10T18:30:00Z',
    status: 'in_progress',
    checklist: [
      { id: 'c-2-1', text: 'Order 30 organic henna cones', completed: true },
      { id: 'c-2-2', text: 'Finalize marigold background draping', completed: false }
    ],
    comments: [],
    completion_percentage: 50
  },
  {
    id: 't-3',
    event_id: 'e-1',
    name: 'Prepare Mehendi Playlist',
    description: 'Curate dynamic folk songs and Bollywood dance tracks for the evening.',
    category: 'Music / DJ',
    assigned_to: ['p-4', 'p-5'],
    priority: 'low',
    due_date: '2027-01-20T18:30:00Z',
    status: 'not_started',
    checklist: [
      { id: 'c-3-1', text: 'Ask family for song requests', completed: false },
      { id: 'c-3-2', text: 'Share playlist with DJ', completed: false }
    ],
    comments: [],
    completion_percentage: 0
  },

  // Haldi Tasks
  {
    id: 't-4',
    event_id: 'e-2',
    name: 'Source Organic Turmeric & Sandalwood Powder',
    description: 'Get premium pure turmeric root powder for a gentle skin paste.',
    category: 'Shopping',
    assigned_to: ['p-3'],
    priority: 'high',
    due_date: '2026-12-05T18:30:00Z',
    status: 'completed',
    checklist: [
      { id: 'c-4-1', text: 'Buy from organic vendor', completed: true }
    ],
    comments: [],
    completion_percentage: 100
  },
  {
    id: 't-5',
    event_id: 'e-2',
    name: 'Haldi Outfits Setup (Yellow/White theme)',
    description: 'Buy kurta for Groom and yellow saree/lehenga for Bride.',
    category: 'Clothes',
    assigned_to: ['p-1', 'p-2'],
    priority: 'high',
    due_date: '2026-10-30T18:30:00Z',
    status: 'in_progress',
    checklist: [
      { id: 'c-5-1', text: 'Prachi outfit fitting', completed: true },
      { id: 'c-5-2', text: 'Ronak kurta stitching', completed: false }
    ],
    comments: [],
    completion_percentage: 50
  },

  // Nikah Tasks
  {
    id: 't-6',
    event_id: 'e-3',
    name: 'Book Nikah Venue and Registrar',
    description: 'Coordinate with registrar for legal requirements and book the grand hall.',
    category: 'Venue & Registrar',
    assigned_to: ['p-1', 'p-2'],
    priority: 'critical',
    due_date: '2026-08-15T18:30:00Z',
    status: 'in_progress',
    checklist: [
      { id: 'c-6-1', text: 'Select venue hall', completed: true },
      { id: 'c-6-2', text: 'Submit legal forms', completed: false },
      { id: 'c-6-3', text: 'Pay deposit amount', completed: true }
    ],
    comments: [
      { id: 'cm-6-1', author: 'Ronak Shah', text: 'Royal Palace Hall booked, waiting for registrar approval.', timestamp: '2026-07-16T15:20:00Z' }
    ],
    completion_percentage: 66
  },
  {
    id: 't-7',
    event_id: 'e-3',
    name: 'Select Bridal Nikah Wear',
    description: 'Exquisite traditional emerald-gold embroidered lehenga.',
    category: 'Clothes',
    assigned_to: ['p-1'],
    priority: 'critical',
    due_date: '2026-09-30T18:30:00Z',
    status: 'in_progress',
    checklist: [
      { id: 'c-7-1', text: 'Visit boutiques', completed: true },
      { id: 'c-7-2', text: 'Give fitting measurements', completed: false }
    ],
    comments: [],
    completion_percentage: 50
  },

  // Reception Tasks
  {
    id: 't-8',
    event_id: 'e-4',
    name: 'Tasting with Food Caterer',
    description: 'Review multi-cuisine menu options, mocktail selections, and dessert counters.',
    category: 'Catering',
    assigned_to: ['p-2', 'p-3'],
    priority: 'high',
    due_date: '2026-11-20T18:30:00Z',
    status: 'not_started',
    checklist: [
      { id: 'c-8-1', text: 'Schedule tasting date', completed: false },
      { id: 'c-8-2', text: 'Finalize live counters list', completed: false }
    ],
    comments: [],
    completion_percentage: 0
  }
];

export const initialShopping: ShoppingItem[] = [
  { id: 's-1', event_id: 'e-3', name: 'Bridal Lehenga (Emerald Gold)', category: 'Clothes', quantity: 1, budget: 150000, actual_price: 145000, store: 'Heritage Bridal, Mumbai', status: 'pending', assigned_to: 'p-1' },
  { id: 's-2', event_id: 'e-3', name: 'Groom Sherwani', category: 'Clothes', quantity: 1, budget: 80000, actual_price: 0, store: 'Manyavar Mohey', status: 'pending', assigned_to: 'p-2' },
  { id: 's-3', event_id: 'e-1', name: 'Premium Henna Cones', category: 'Decorations', quantity: 30, budget: 3000, actual_price: 2500, store: 'Organic Farms Co.', status: 'purchased', assigned_to: 'p-3' },
  { id: 's-4', event_id: 'e-2', name: 'Floral Jewelry for Haldi', category: 'Jewelry', quantity: 1, budget: 5000, actual_price: 4800, store: 'FlowerCrafts Online', status: 'purchased', assigned_to: 'p-4' },
  { id: 's-5', event_id: 'e-3', name: 'Nikah Gold Rings', category: 'Jewelry', quantity: 2, budget: 120000, actual_price: 118000, store: 'Tanishq Jewellers', status: 'purchased', assigned_to: 'p-1' }
];

export const initialBudget: BudgetItem[] = [
  { id: 'b-1', event_id: 'e-3', category: 'Venue', allocated: 500000, actual: 480000, paid: 150000, notes: 'Royal Palace Hall. Balance due in Jan.' },
  { id: 'b-2', event_id: 'e-4', category: 'Food Catering', allocated: 400000, actual: 0, paid: 50000, notes: 'Mock catering advances paid.' },
  { id: 'b-3', event_id: 'e-3', category: 'Decoration', allocated: 250000, actual: 230000, paid: 230000, notes: 'Complete floral + lighting theme.' },
  { id: 'b-4', event_id: 'e-1', category: 'Catering & Snacks', allocated: 60000, actual: 55000, paid: 20000, notes: 'Traditional Mehendi food and tea.' },
  { id: 'b-5', event_id: 'e-2', category: 'Flowers & Genda Phool', allocated: 40000, actual: 38000, paid: 38000, notes: 'Haldi yellow theme decoration.' }
];

export const initialGuests: Guest[] = [
  { id: 'g-1', name: 'Dinesh Patel (Uncle)', category: 'family', side: 'bride', rsvp_status: 'attending', invitation_sent: true, food_preference: 'veg', phone: '+919900990099' },
  { id: 'g-2', name: 'Savita Patel (Aunt)', category: 'family', side: 'bride', rsvp_status: 'attending', invitation_sent: true, food_preference: 'veg', phone: '+919900990088' },
  { id: 'g-3', name: 'Vikram Shah', category: 'family', side: 'groom', rsvp_status: 'attending', invitation_sent: true, food_preference: 'veg', phone: '+919911991199' },
  { id: 'g-4', name: 'Kabir Mehta (College Friend)', category: 'friend', side: 'bride', rsvp_status: 'pending', invitation_sent: true, food_preference: 'non-veg', phone: '+919877766611' },
  { id: 'g-5', name: 'Ayesha Khan (VIP Guest)', category: 'vip', side: 'groom', rsvp_status: 'pending', invitation_sent: false, food_preference: 'non-veg', phone: '+919866655522' },
  { id: 'g-6', name: 'Rajesh Sharma', category: 'friend', side: 'groom', rsvp_status: 'declined', invitation_sent: true, food_preference: 'veg', phone: '+919855544433' }
];

export const initialVendorBookings: VendorBooking[] = [
  {
    id: 'vb-1',
    vendor_name: 'Royal Palace Grand Hall',
    category: 'Venue',
    event_id: 'e-3',
    booking_status: 'booked',
    booking_date: '2026-05-10T12:00:00Z',
    contract_signed: true,
    advance_paid: 150000,
    balance_due: 330000,
    payment_due_date: '2027-01-15T18:30:00Z',
    contact_person: 'Mr. Kapoor',
    contact_phone: '+919811122233',
    trial_date: undefined,
    fitting_date: undefined,
    notes: 'Includes catering tables and lighting setup. Extra charges for bridal suite.'
  },
  {
    id: 'vb-2',
    vendor_name: 'Spice & Saffron Caterers',
    category: 'Food Catering',
    event_id: 'e-4',
    booking_status: 'negotiating',
    booking_date: undefined,
    contract_signed: false,
    advance_paid: 50000,
    balance_due: 350000,
    payment_due_date: '2027-02-10T18:30:00Z',
    contact_person: 'Chef Suresh',
    contact_phone: '+919822233344',
    trial_date: '2026-11-20T14:00:00Z',
    fitting_date: undefined,
    notes: 'Tasting scheduled for late November.'
  },
  {
    id: 'vb-3',
    vendor_name: 'Heritage Bridal Studio',
    category: 'Wedding Clothes / Tailor',
    event_id: 'e-3',
    booking_status: 'booked',
    booking_date: '2026-06-15T10:00:00Z',
    contract_signed: true,
    advance_paid: 60000,
    balance_due: 850000,
    payment_due_date: '2026-12-15T18:30:00Z',
    contact_person: 'Designer Nita',
    contact_phone: '+919833344455',
    trial_date: undefined,
    fitting_date: '2026-10-30T16:30:00Z',
    notes: 'First fitting of the Nikah Lehenga.'
  },
  {
    id: 'vb-4',
    vendor_name: 'Glamour by Alpa',
    category: 'Makeup Artist',
    event_id: 'e-3',
    booking_status: 'confirmed',
    booking_date: '2026-07-02T08:00:00Z',
    contract_signed: true,
    advance_paid: 20000,
    balance_due: 30000,
    payment_due_date: '2027-02-15T18:30:00Z',
    contact_person: 'Alpa Patel',
    contact_phone: '+919844455566',
    trial_date: '2026-12-10T11:00:00Z',
    fitting_date: undefined,
    notes: 'Trial scheduled. Hair styling trial included.'
  },
  {
    id: 'vb-5',
    vendor_name: 'Epic Wedding Films',
    category: 'Photographer',
    event_id: 'e-3',
    booking_status: 'enquired',
    booking_date: undefined,
    contract_signed: false,
    advance_paid: 0,
    balance_due: 180000,
    payment_due_date: undefined,
    contact_person: 'Rohan Sen',
    contact_phone: '+919855566677',
    trial_date: undefined,
    fitting_date: undefined,
    notes: 'Sent quotation. Awaiting response.'
  },
  {
    id: 'vb-6',
    vendor_name: undefined,
    category: 'Decoration',
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
    notes: 'Need to review quotes from local decorators.'
  }
];
