/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, User, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { UserSession } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function AuthModal({ onClose, onLoginSuccess, addToast }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      addToast('Harap isi semua kolom input!', 'error');
      return;
    }

    if (isRegister) {
      // Sign Up simulation
      if (!name) {
        addToast('Harap masukkan nama lengkap Anda!', 'error');
        return;
      }
      
      const existingUsers = JSON.parse(localStorage.getItem('jugijagijuk_users') || '[]');
      if (existingUsers.some((u: any) => u.email === email.toLowerCase())) {
        addToast('Email ini sudah terdaftar!', 'error');
        return;
      }

      const newUser = { name, email: email.toLowerCase(), password, role: 'customer' };
      existingUsers.push(newUser);
      localStorage.setItem('jugijagijuk_users', JSON.stringify(existingUsers));

      addToast(`Akun berhasil dibuat! Selamat datang, ${name}.`, 'success');
      onLoginSuccess({ email: email.toLowerCase(), role: 'customer', name });
      onClose();
    } else {
      // Login simulation
      const normalizedEmail = email.toLowerCase().trim();

      // 1. Admin login override
      if (
        (normalizedEmail === 'admin' && password === 'admin') ||
        (normalizedEmail === 'admin@jugijagijuk.com' && password === 'admin')
      ) {
        addToast('Selamat datang, Admin Utama Jugijagijuk!', 'success');
        onLoginSuccess({ email: 'admin@jugijagijuk.com', role: 'admin', name: 'Administrator' });
        onClose();
        return;
      }

      // 2. Local customer search
      const registeredUsers = JSON.parse(localStorage.getItem('jugijagijuk_users') || '[]');
      const user = registeredUsers.find((u: any) => u.email === normalizedEmail && u.password === password);

      if (user) {
        addToast(`Login berhasil! Selamat datang kembali, ${user.name}.`, 'success');
        onLoginSuccess({ email: user.email, role: 'customer', name: user.name });
        onClose();
      } else {
        addToast('Kredensial salah! Gunakan "admin" / "admin" untuk akses admin.', 'error');
      }
    }
  };

  // Helper shortcuts for testing
  const handleAdminShortcut = () => {
    setEmail('admin');
    setPassword('admin');
    setIsRegister(false);
    addToast('Kredensial Admin diisi otomatis. Silakan klik Masuk!', 'info');
  };

  const handleGuestShortcut = () => {
    const guestSession: UserSession = {
      email: `tamu_${Math.floor(Math.random() * 1000)}@jugijagijuk.com`,
      role: 'customer',
      name: 'Tamu Penumpang'
    };
    addToast('Masuk sebagai Tamu Penumpang!', 'success');
    onLoginSuccess(guestSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden z-10"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          id="auth-modal-close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Art */}
        <div className="bg-linear-to-b from-red-50 to-white px-8 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600 text-amber-400 font-mono font-bold text-lg mb-3 shadow-md shadow-red-100">
            KA
          </div>
          <h2 className="text-2xl font-bold font-rajdhani text-slate-900 tracking-wide">
            {isRegister ? 'BUAT AKUN BARU' : 'MASUK KE JUGIJAGIJUK'}
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1 tracking-wider uppercase">
            Akses Pemesanan & Dashboard Admin
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAuth} className="p-8 pt-2 space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Nama Lengkap</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Email / Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={isRegister ? 'budi@example.com' : 'admin atau email Anda'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            id="auth-submit-btn"
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-red-100 transition-colors focus:ring-2 focus:ring-red-500/40 focus:outline-none cursor-pointer"
          >
            {isRegister ? 'Daftar Akun' : 'Masuk Sekarang'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Toggle Register/Login Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              id="auth-toggle-view"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar gratis'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-300 text-[10px] font-mono tracking-widest uppercase">Uji Coba Instan</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Direct Access Shortcuts */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              id="auth-shortcut-admin"
              onClick={handleAdminShortcut}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-medium transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-red-500" />
              Sandi Admin
            </button>
            <button
              type="button"
              id="auth-shortcut-guest"
              onClick={handleGuestShortcut}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-medium transition-all"
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              Masuk Tamu
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
