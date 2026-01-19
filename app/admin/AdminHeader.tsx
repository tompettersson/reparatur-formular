'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

// Tool icon for admin header
const ToolIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export function AdminHeader() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <header className="bg-white border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders" className="flex items-center gap-4">
              <Image
                src="/kletterschuhe-logo.png"
                alt="kletterschuhe.de"
                width={160}
                height={36}
                className="h-7 w-auto"
              />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ef6a27] text-white rounded-full text-xs font-medium">
                <ToolIcon />
                <span>Admin</span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/admin/orders" className="text-gray-600 hover:text-[#ef6a27]">
              Aufträge
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Abmelden
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
