import { ReactNode } from 'react';

export const metadata = {
  title: 'Manage Team',
  description: 'Manage team members and roles',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
