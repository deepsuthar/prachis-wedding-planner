import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from './providers';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#047857',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Prachi's Wedding Planner | Luxury Celebrations Coordinator",
  description: "A premium, festive, high-performance wedding planner dashboard for Prachi & Amit's dream wedding celebration. Plan schedules, budgets, guests, and vendor bookings.",
  keywords: "wedding planner, wedding dashboard, prachi wedding, marriage coordinator, guest list, budget manager, vendor tracker",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "Prachi Wedding",
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-amber-500/25">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('PWA ServiceWorker registered with scope:', registration.scope);
                    },
                    function(err) {
                      console.log('PWA ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

