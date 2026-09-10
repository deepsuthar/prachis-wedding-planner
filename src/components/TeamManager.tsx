'use client';

import React, { useState } from 'react';
import { UserPlus, Trash2, Mail, Phone, Shield, CheckCircle, Clock, X } from 'lucide-react';
import { Profile } from '@/lib/mockData';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from './ui/Dialog';

interface TeamManagerProps {
  profiles: Profile[];
  currentUser: Profile;
  onAddProfile: (profile: Profile) => void;
  onDeleteProfile: (id: string) => void;
  onClearAllData?: () => void;
}

export default function TeamManager({
  profiles,
  currentUser,
  onAddProfile,
  onDeleteProfile,
  onClearAllData
}: TeamManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'family' | 'volunteer'>('volunteer');

  const isAdmin = currentUser.role === 'admin';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    // Generate a temporary UUID for the invited profile slot
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `invited-${Date.now()}`;

    const newProfile: Profile = {
      id: tempId,
      full_name: fullName,
      email: email.toLowerCase().trim(),
      phone: phone.trim() || undefined,
      role
    };

    onAddProfile(newProfile);
    setIsAddOpen(false);
    
    // Reset form
    setFullName('');
    setEmail('');
    setPhone('');
    setRole('volunteer');
  };

  const getRoleBadgeClass = (r: Profile['role']) => {
    switch (r) {
      case 'admin':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-550/20';
      case 'family':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-550/20';
      case 'volunteer':
        return 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-850/60 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
            Planning Team & Family
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Manage the administrators, family planners, and volunteer coordinators for the wedding.
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {onClearAllData && (
              <button
                type="button"
                onClick={onClearAllData}
                className="px-3.5 py-2 border border-rose-200 dark:border-rose-800 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Reset Planner Data
              </button>
            )}
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(member => {
          // Check if it's a real signed-up user (real UUID vs invited UUID)
          const isRegistered = !member.id.startsWith('invited-') && member.id.length > 20;
          const isCurrentUser = member.id === currentUser.id;

          return (
            <div
              key={member.id}
              className="bg-white dark:bg-stone-900 border border-stone-200/85 dark:border-stone-850/50 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 dark:hover:border-amber-500/20 transition-all shadow-sm relative group"
            >
              <div className="space-y-4">
                {/* Header with Avatar and Role */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-700/10">
                      {member.full_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5 font-sans">
                        {member.full_name}
                        {isCurrentUser && (
                          <span className="text-[9px] bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-500 font-bold uppercase">
                            You
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-stone-400 mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${getRoleBadgeClass(member.role)}`}>
                    {member.role}
                  </span>
                </div>

                {/* Details Section */}
                <div className="text-[11px] text-stone-500 dark:text-stone-400 space-y-2 pt-2 border-t border-stone-100 dark:border-stone-850/50">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-stone-400" />
                    <span className="capitalize">{member.role} Permissions</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator & Actions Footer */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-stone-100 dark:border-stone-850/50">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                  {isRegistered ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Active Planner</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-500">Pending Registration</span>
                    </>
                  )}
                </div>

                {/* Delete button (Only for Admin, cannot delete themselves) */}
                {isAdmin && !isCurrentUser && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${member.full_name} from the planning team?`)) {
                        onDeleteProfile(member.id);
                      }
                    }}
                    className="p-1 rounded text-stone-400 hover:text-rose-500 hover:bg-stone-50 dark:hover:bg-stone-850/80 transition-all cursor-pointer"
                    title="Remove Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal Dialog */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <DialogContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Papa Patel"
                className="w-full px-3.5 py-2 text-xs border border-stone-200 dark:border-stone-800 rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="family@wedding.com"
                className="w-full px-3.5 py-2 text-xs border border-stone-200 dark:border-stone-800 rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
              />
              <p className="text-[9px] text-stone-400 mt-1">
                They must sign up using this exact email address to claim their planner profile.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91..."
                className="w-full px-3.5 py-2 text-xs border border-stone-200 dark:border-stone-800 rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Planning Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-800 rounded-lg bg-transparent focus:outline-none text-stone-700 dark:text-stone-300"
              >
                <option value="volunteer">Volunteer (Task checks only)</option>
                <option value="family">Family Member (Full view, self-edits)</option>
                <option value="admin">Admin (Full administrative controls)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3.5 py-1.5 text-xs text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow"
              >
                Save Member
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
