/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Calendar, Clock, LogIn, LogOut, ShieldAlert, Train, Ticket, LayoutDashboard, Database } from 'lucide-react';
import { UserSession } from '../types';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  session: UserSession | null;
  onLogout: () => void;
  onLoginClick: () => void;
  dbOnline: boolean;
}

export default function Header({ currentView, onViewChange, session, onLogout, onLoginClick, dbOnline }: HeaderProps) {
  const [jam, setJam] = useState('--:--:--');
  const [tanggal, setTanggal] = useState('-');

  useEffect(() => {
    const updateWaktu = () => {
      const now = new Date();
      setJam(now.toLocaleTimeString('id-ID', { hour12: false }));
      setTanggal(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateWaktu();
    const interval = setInterval(updateWaktu, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = session?.role === 'admin';
  const isCustomer = session?.role === 'customer';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-150 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand logo & Info */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onViewChange('board')}>
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-red-600 to-rose-700 flex items-center justify-center text-amber-300 font-mono font-bold text-lg shadow-md shadow-red-100 relative group overflow-hidden">
            <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            <Train className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold font-rajdhani text-slate-900 tracking-wide leading-none">
                JUGIJAGIJUK
              </h1>
              {/* Database status pill */}
              <span 
                className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  dbOnline 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}
                title={dbOnline ? 'Supabase Database Terhubung' : 'Mode Offline / Backup Lokal Aktif'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dbOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                {dbOnline ? 'Supabase' : 'Lokal'}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1 tracking-wider uppercase leading-none">
              Sistem Informasi & Reservasi Kereta Api
            </p>
          </div>
        </div>

        {/* Navigation center (Dynamic tabs) */}
        <nav className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => onViewChange('board')}
            id="nav-board-btn"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'board'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Train className="w-4 h-4" />
            Jadwal KA
          </button>

          {/* Booking View tab (visible when booking or always accessible to customers/guests) */}
          <button
            onClick={() => onViewChange('booking')}
            id="nav-booking-btn"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'booking'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Pesan Tiket
          </button>

          {/* Customer only view: My tickets */}
          {isCustomer && (
            <button
              onClick={() => onViewChange('my-tickets')}
              id="nav-my-tickets-btn"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'my-tickets'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ticket className="w-4 h-4 text-emerald-500" />
              Tiket Saya
            </button>
          )}

          {/* Admin only view: Dashboard */}
          {isAdmin && (
            <button
              onClick={() => onViewChange('admin')}
              id="nav-admin-btn"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-red-500 animate-pulse" />
              Admin Panel
            </button>
          )}
        </nav>

        {/* Real-time Clock, Date & Auth controls */}
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {/* Clock & Date details */}
          <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-4">
            <div className="flex items-center gap-1.5 text-red-600 font-mono font-bold text-lg tracking-wider">
              <Clock className="w-4 h-4 text-slate-400" />
              {jam}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono tracking-wide uppercase mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {tanggal}
            </div>
          </div>

          {/* Profile & Log Button */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 leading-tight">
                    {session.name || 'User'}
                  </div>
                  <div className="mt-0.5">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-md uppercase">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        Administrator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded-md uppercase">
                        Penumpang
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  id="header-logout-btn"
                  title="Logout"
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-red-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                id="header-login-btn"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                Masuk / Admin
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
