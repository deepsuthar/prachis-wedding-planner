'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './ui/Dialog';
import triggerConfetti from './ui/Confetti';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  variant?: 'button' | 'banner' | 'icon';
  className?: string;
}

export default function PWAInstallPrompt({ variant = 'button', className = '' }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      triggerConfetti();
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
        triggerConfetti();
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  if (isStandalone) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>App Installed</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'button' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 shadow-sm transition-all transform active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'icon' && (
        <button
          onClick={handleInstallClick}
          className={`p-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-all ${className}`}
          title="Install Wedding Planner App"
        >
          <Download className="w-4.5 h-4.5 stroke-[2]" />
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-stone-850 dark:text-stone-150">Install Mobile Web App</p>
              <p className="text-[10px] text-stone-500">Access Prachi's Planner anytime, even offline!</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs shadow-sm hover:opacity-90 transition-opacity"
          >
            Download PWA
          </button>
        </div>
      )}

      {/* iOS or Manual PWA Install Instructions Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500" />
            Install Prachi's Wedding Planner App
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            Get the full home screen app experience with instant launch, full screen display, and smooth offline access.
          </p>

          {isIOS ? (
            <div className="space-y-3 bg-stone-50 dark:bg-stone-850 p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                Instructions for iPhone & iPad (Safari):
              </h4>
              <ol className="space-y-2 text-stone-600 dark:text-stone-400 list-decimal list-inside">
                <li className="leading-normal">
                  Tap the <span className="font-bold text-stone-900 dark:text-stone-100 inline-flex items-center gap-1 bg-stone-200 dark:bg-stone-750 px-1.5 py-0.5 rounded"><Share2 className="w-3.5 h-3.5 inline text-blue-500" /> Share button</span> in your Safari toolbar at the bottom of the screen.
                </li>
                <li className="leading-normal">
                  Scroll down the options list and select <span className="font-bold text-stone-900 dark:text-stone-100 inline-flex items-center gap-1 bg-stone-200 dark:bg-stone-750 px-1.5 py-0.5 rounded"><PlusSquare className="w-3.5 h-3.5 inline text-stone-700 dark:text-stone-300" /> Add to Home Screen</span>.
                </li>
                <li className="leading-normal">
                  Tap <span className="font-bold text-emerald-600 dark:text-emerald-400">Add</span> in the top right corner. The wedding planner icon will appear on your phone home screen!
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 bg-stone-50 dark:bg-stone-850 p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
              <h4 className="font-bold text-stone-900 dark:text-stone-100">
                Instructions for Android / Chrome / Mobile Browsers:
              </h4>
              <ol className="space-y-2 text-stone-600 dark:text-stone-400 list-decimal list-inside">
                <li className="leading-normal">
                  Tap the <span className="font-bold text-stone-900 dark:text-stone-100">Browser Menu (⋮)</span> in the top right corner.
                </li>
                <li className="leading-normal">
                  Select <span className="font-bold text-amber-600 dark:text-amber-400">Install app</span> or <span className="font-bold text-amber-600 dark:text-amber-400">Add to Home screen</span>.
                </li>
                <li className="leading-normal">
                  Confirm installation. Launch directly from your mobile launcher!
                </li>
              </ol>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl shadow"
          >
            Got it, thanks!
          </button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
