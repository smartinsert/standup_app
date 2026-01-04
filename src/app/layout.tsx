import './globals.css';
import { UserProvider } from '@/context/user-context';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Team Standup',
  description: 'Daily standup tracker for the team',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <UserProvider>
          <main className="container">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  );
}
