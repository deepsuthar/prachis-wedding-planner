import type { Metadata } from 'next';
import { ThemeProvider } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: "Prachi's Wedding Planner | Luxury Celebrations Coordinator",
  description: "A premium, festive, high-performance wedding planner dashboard for Prachi & Amit's dream wedding celebration. Plan schedules, budgets, guests, and vendor bookings.",
  keywords: "wedding planner, wedding dashboard, prachi wedding, marriage coordinator, guest list, budget manager, vendor tracker"
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
      </body>
    </html>
  );
}
