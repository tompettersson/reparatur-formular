'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export function AdminHeader() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#efa335] to-[#ef6a27] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#38362d]">kletterschuhe.de</h1>
                <p className="text-xs text-gray-500">Admin-Bereich</p>
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
