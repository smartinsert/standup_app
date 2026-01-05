import './globals.css';
import { UserProvider } from '@/context/user-context';
import { ThemeProvider } from '@/context/theme-context';
import { ReactNode } from 'react';
import { Header } from '@/components/header';

export const metadata = {
  title: 'Team Standup',
  description: 'Daily list tracker for the team',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <UserProvider>
            <Header />
            <main className="container">
              {children}
            </main>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
