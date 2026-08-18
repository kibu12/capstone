import React from 'react';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-600 selection:text-white w-full">
      <Header />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
