'use client';

import React, { useState } from 'react';
import { Heart, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/db';
import { Profile } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import triggerConfetti from './ui/Confetti';

interface LoginProps {
  onAuthSuccess: (profile: Profile) => void;
  localProfiles: Profile[];
}

export default function Login({ onAuthSuccess, localProfiles }: LoginProps) {
  const { theme } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'family' | 'volunteer'>('volunteer');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isSupabaseActive = !!supabase;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMessage('');

    if (isSupabaseActive && supabase) {
      // 1. Supabase Auth Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // 2. Fetch profile details
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          // If profile table doesn't have a record yet, create a default profile
          const fallbackProfile: Profile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || 'Guest User',
            role: 'volunteer',
            phone: data.user.phone || undefined
          };
          // Insert profile
          await supabase.from('profiles').insert(fallbackProfile);
          onAuthSuccess(fallbackProfile);
        } else {
          onAuthSuccess({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            phone: profile.phone
          });
        }
        triggerConfetti();
      }
    } else {
      // Local sandbox fallback login simulation
      const matched = localProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        onAuthSuccess(matched);
        triggerConfetti();
      } else {
        setErrorMessage('Local simulation: User email not found. Try prachi@wedding.com, ronak@wedding.com, or rohan@wedding.com.');
      }
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;

    setLoading(true);
    setErrorMessage('');

    if (isSupabaseActive && supabase) {
      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if there is a pre-registered placeholder profile for this email
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .maybeSingle();

        const finalRole = existingProfile ? existingProfile.role : selectedRole;

        if (existingProfile) {
          // Delete old placeholder profile to prevent primary key conflicts
          await supabase.from('profiles').delete().eq('email', email.toLowerCase().trim());
        }

        const newProfile: Profile = {
          id: data.user.id,
          email: email.toLowerCase().trim(),
          full_name: fullName,
          role: finalRole,
          phone: phone || existingProfile?.phone || undefined
        };

        // 2. Create profile row linking correct auth id and final role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newProfile.id,
            email: newProfile.email,
            full_name: newProfile.full_name,
            role: newProfile.role,
            phone: newProfile.phone || null
          });

        if (profileError) {
          console.error('Failed to create profile row:', profileError.message);
        }
        
        onAuthSuccess(newProfile);
        triggerConfetti();
      }
    } else {
      // Simulated Local sign up
      const newLocalProfile: Profile = {
        id: `p-${Date.now()}`,
        email,
        full_name: fullName,
        role: selectedRole,
        phone: phone || undefined
      };
      // Save profile in local list in memory
      onAuthSuccess(newLocalProfile);
      triggerConfetti();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Background Festive Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none transform -translate-x-12 -translate-y-12 dark:bg-emerald-550/10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none transform translate-x-12 translate-y-12 dark:bg-amber-500/10" />

      {/* Main card */}
      <div className="max-w-md w-full bg-card border border-border p-8 rounded-2xl shadow-xl relative z-10 transition-all duration-300">
        
        {/* Logo and Titles */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 mx-auto flex items-center justify-center shadow-lg shadow-emerald-700/10 mb-4">
            <Heart className="w-6 h-6 text-white fill-current animate-pulse" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Prachi's Wedding Planner
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-medium">
            {isSignUp ? 'Request an invitations account code' : 'Welcome to your digital wedding sanctuary'}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg text-xs text-rose-600 dark:text-rose-400 mb-6 text-center font-medium leading-relaxed">
            {errorMessage}
          </div>
        )}

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          
          {/* Sign Up Fields */}
          {isSignUp && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ronak Patel"
                    className="w-full pl-10 pr-4 py-2 text-xs border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Phone (WA Link)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full pl-10 pr-4 py-2 text-xs border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Planner Role</label>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-transparent focus:outline-none text-stone-700 dark:text-stone-300"
                  >
                    <option value="volunteer">Volunteer (Friend)</option>
                    <option value="family">Family Member</option>
                    <option value="admin">Administrator (Prachi)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@wedding.com"
                className="w-full pl-10 pr-4 py-2 text-xs border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 text-xs border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Actions button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold text-xs transition-all shadow-md shadow-emerald-700/10 disabled:opacity-50 mt-6 cursor-pointer"
          >
            {loading ? (
              <span>Connecting Registry...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Request Invitation Account' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Database indicator */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[10px] font-medium text-stone-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className={cn('w-4 h-4', isSupabaseActive ? 'text-emerald-500' : 'text-amber-500')} />
            <span>Mode: {isSupabaseActive ? 'Supabase Live Server' : 'Sandbox Simulator'}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage('');
            }}
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold"
          >
            {isSignUp ? 'Back to Login' : 'Request Access (Sign Up)'}
          </button>
        </div>
      </div>
    </div>
  );
}
