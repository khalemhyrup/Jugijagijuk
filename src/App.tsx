/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Train, Ticket, ShieldAlert, Plus, Trash2, CheckCircle2, 
  XCircle, Mail, Clock, Calendar, Check, AlertCircle, Info, ChevronRight, User, Hash, Armchair
} from 'lucide-react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import Notification from './components/Notification';
import { Jadwal, Pesanan, UserSession, ToastMessage } from './types';
import { 
  fetchSchedules, 
  saveSchedule, 
  deleteSchedule, 
  fetchBookings, 
  createBooking, 
  updateBookingStatus, 
  fetchTakenSeats,
  getDbStatus
} from './supabase';

export default function App() {
  // Views: 'board' | 'booking' | 'my-tickets' | 'admin'
  const [currentView, setCurrentView] = useState<string>('board');
  const [session, setSession] = useState<UserSession | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Database Connection Indicator
  const [dbOnline, setDbOnline] = useState<boolean>(false);

  // Schedules (Jadwal) State
  const [schedules, setSchedules] = useState<Jadwal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingSchedules, setLoadingSchedules] = useState<boolean>(true);

  // Bookings (Pesanan) State
  const [bookings, setBookings] = useState<Pesanan[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);

  // Outbox Log (from custom server)
  const [emailOutbox, setEmailOutbox] = useState<any[]>([]);

  // Selected train for reservation
  const [selectedTrainForBooking, setSelectedTrainForBooking] = useState<Jadwal | null>(null);

  // New Booking Form
  const [passengerName, setPassengerName] = useState<string>('');
  const [passengerEmail, setPassengerEmail] = useState<string>('');
  const [travelDate, setTravelDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [takenSeats, setTakenSeats] = useState<string[]>([]);
  const [loadingSeats, setLoadingSeats] = useState<boolean>(false);

  // New Schedule Form (Admin)
  const [newNoKa, setNewNoKa] = useState<string>('');
  const [newNamaKa, setNewNamaKa] = useState<string>('');
  const [newJenisKa, setNewJenisKa] = useState<string>('Eksekutif');
  const [newAsal, setNewAsal] = useState<string>('');
  const [newBerangkat, setNewBerangkat] = useState<string>('');
  const [newTujuan, setNewTujuan] = useState<string>('');
  const [newTiba, setNewTiba] = useState<string>('');

  // Toast Helpers
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismissToast(id), 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Data Fetch & Health Checks
  useEffect(() => {
    const checkDbAndLoad = async () => {
      try {
        const dbStatus = await getDbStatus();
        setDbOnline(dbStatus.jadwalOnline);
      } catch {
        setDbOnline(false);
      }
      loadSchedules();
    };
    checkDbAndLoad();

    // Check for existing session
    const savedSession = localStorage.getItem('jugijagijuk_session');
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch {
        // Clear corrupt session
        localStorage.removeItem('jugijagijuk_session');
      }
    }
  }, []);

  // Poll for schedules occasionally
  useEffect(() => {
    const interval = setInterval(loadSchedules, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch taken seats when booking parameters change
  useEffect(() => {
    if (selectedTrainForBooking && travelDate) {
      loadTakenSeats(selectedTrainForBooking.no_ka, travelDate);
    }
  }, [selectedTrainForBooking, travelDate]);

  // Load bookings when admin panel or history is loaded
  useEffect(() => {
    if (currentView === 'admin' || currentView === 'my-tickets') {
      loadBookings();
      if (currentView === 'admin') {
        fetchEmailLogs();
      }
    }
  }, [currentView, session]);

  // Actions
  const loadSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const data = await fetchSchedules();
      setSchedules(data);
    } catch (err: any) {
      addToast('Gagal memuat jadwal dari database. Menggunakan backup lokal.', 'warning');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err: any) {
      addToast('Gagal mengambil data pesanan.', 'error');
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadTakenSeats = async (no_ka: string, date: string) => {
    setLoadingSeats(true);
    try {
      const taken = await fetchTakenSeats(no_ka, date);
      setTakenSeats(taken);
      // Deselect seats that are suddenly taken
      setSelectedSeats(prev => prev.filter(seat => !taken.includes(seat)));
    } catch {
      setTakenSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const response = await fetch('/api/admin/emails');
      if (response.ok) {
        const logs = await response.json();
        setEmailOutbox(logs);
      }
    } catch (e) {
      console.warn('Could not load email outbox log');
    }
  };

  const handleLoginSuccess = (user: UserSession) => {
    setSession(user);
    localStorage.setItem('jugijagijuk_session', JSON.stringify(user));
    // Pre-fill passenger fields if customer
    if (user.role === 'customer') {
      setPassengerName(user.name || '');
      setPassengerEmail(user.email);
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('jugijagijuk_session');
    addToast('Anda telah keluar dari akun.', 'info');
    setCurrentView('board');
  };

  // Create Train Schedule (Admin Action)
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoKa || !newNamaKa || !newAsal || !newBerangkat || !newTujuan || !newTiba) {
      addToast('Harap lengkapi semua kolom jadwal kereta!', 'error');
      return;
    }

    const scheduleObj: Jadwal = {
      no_ka: newNoKa.toUpperCase(),
      stasiun_keberangkatan: newAsal,
      waktu_keberangkatan: newBerangkat,
      stasiun_tujuan: newTujuan,
      waktu_kedatangan: newTiba,
      kereta: {
        namaka: newNamaKa,
        jeniska: newJenisKa
      }
    };

    const success = await saveSchedule(scheduleObj);
    if (success) {
      addToast(`Jadwal KA ${newNoKa} berhasil ditambahkan!`, 'success');
      // Reset form
      setNewNoKa('');
      setNewNamaKa('');
      setNewAsal('');
      setNewBerangkat('');
      setNewTujuan('');
      setNewTiba('');
      loadSchedules();
    } else {
      addToast('Gagal menambahkan jadwal.', 'error');
    }
  };

  // Delete Train Schedule (Admin Action)
  const handleDeleteSchedule = async (no_ka: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus jadwal ${no_ka}?`)) {
      const success = await deleteSchedule(no_ka);
      if (success) {
        addToast(`Jadwal KA ${no_ka} telah berhasil dihapus.`, 'success');
        loadSchedules();
      } else {
        addToast('Gagal menghapus jadwal.', 'error');
      }
    }
  };

  // Create Booking Order (Client Action)
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainForBooking) {
      addToast('Silakan pilih jadwal kereta api terlebih dahulu!', 'error');
      return;
    }
    if (!passengerName.trim() || !passengerEmail.trim()) {
      addToast('Nama penumpang dan email wajib diisi!', 'error');
      return;
    }
    if (selectedSeats.length === 0) {
      addToast('Silakan pilih nomor tempat duduk/kursi terlebih dahulu!', 'warning');
      return;
    }

    const ticketPrice = selectedTrainForBooking.kereta?.jeniska === 'Eksekutif' 
      ? 180000 
      : selectedTrainForBooking.kereta?.jeniska === 'Bisnis' 
      ? 120000 
      : 80000;

    const total_harga = ticketPrice * selectedSeats.length;

    const bookingPayload = {
      no_ka: selectedTrainForBooking.no_ka,
      nama_penumpang: passengerName,
      email_penumpang: passengerEmail,
      kursi: selectedSeats,
      tanggal_perjalanan: travelDate,
      status: 'Pending' as const,
      total_harga: total_harga
    };

    try {
      const result = await createBooking(bookingPayload);
      addToast(`Pesanan berhasil dikirim! ID Pesanan Anda: ${result.id.substring(0, 8).toUpperCase()}. Menunggu konfirmasi admin.`, 'success');
      // Reset booking selection
      setSelectedSeats([]);
      setSelectedTrainForBooking(null);
      // Direct view
      if (session?.role === 'customer') {
        setCurrentView('my-tickets');
      } else {
        addToast('Masuk atau gunakan fitur Tiket Saya untuk melacak status.', 'info');
        setCurrentView('board');
      }
    } catch {
      addToast('Gagal memproses pembuatan pesanan tiket.', 'error');
    }
  };

  // Approve & Confirm Order (Admin Action + Send Email Notification)
  const handleConfirmBooking = async (booking: Pesanan) => {
    try {
      const success = await updateBookingStatus(booking.id, 'Confirmed');
      if (success) {
        addToast(`Pesanan ${booking.id.substring(0, 8).toUpperCase()} berhasil dikonfirmasi!`, 'success');
        
        // Trigger Email Notification to the Server Outbox Ledger
        try {
          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: booking.email_penumpang,
              subject: `[E-TICKET JUGIJAGIJUK] Konfirmasi Keberangkatan KA ${booking.no_ka}`,
              bookingDetail: {
                id: booking.id,
                nama_penumpang: booking.nama_penumpang,
                no_ka: booking.no_ka,
                kursi: booking.kursi,
                tanggal_perjalanan: booking.tanggal_perjalanan,
                total_harga: booking.total_harga,
                stasiun_asal: booking.jadwal_detail?.stasiun_keberangkatan || 'Stasiun Asal',
                stasiun_tujuan: booking.jadwal_detail?.stasiun_tujuan || 'Stasiun Tujuan',
                waktu_berangkat: booking.jadwal_detail?.waktu_keberangkatan || '--:--',
                kereta_nama: booking.jadwal_detail?.kereta?.namaka || 'Kereta Penumpang'
              }
            })
          });

          if (emailResponse.ok) {
            addToast(`Notifikasi e-ticket otomatis telah dikirim ke ${booking.email_penumpang}`, 'info');
          }
        } catch (emailErr) {
          console.error('API send-email error:', emailErr);
        }

        loadBookings();
        fetchEmailLogs();
      } else {
        addToast('Gagal memperbarui status pesanan.', 'error');
      }
    } catch {
      addToast('Kesalahan sistem saat mengkonfirmasi pesanan.', 'error');
    }
  };

  // Cancel Order (Admin Action)
  const handleCancelBooking = async (id: string) => {
    try {
      const success = await updateBookingStatus(id, 'Cancelled');
      if (success) {
        addToast('Pesanan telah dibatalkan. Ketersediaan kursi telah diperbarui secara real-time.', 'info');
        loadBookings();
        fetchEmailLogs();
      } else {
        addToast('Gagal membatalkan pesanan.', 'error');
      }
    } catch {
      addToast('Kesalahan sistem saat memproses pembatalan.', 'error');
    }
  };

  // Seat Selector Builder
  // Define carriage map with 40 seats: Rows A-D, columns 1-10
  const CARRIAGE_SEATS = useMemo(() => {
    const rows = ['A', 'B', 'C', 'D'];
    const cols = Array.from({ length: 10 }, (_, i) => i + 1);
    const seatsList: string[] = [];
    rows.forEach(row => {
      cols.forEach(col => {
        seatsList.push(`${row}${col}`);
      });
    });
    return seatsList;
  }, []);

  const handleSeatClick = (seatId: string) => {
    if (takenSeats.includes(seatId)) return; // Taken seats are unclickable
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(s => s !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  // Search filter schedules
  const filteredSchedules = useMemo(() => {
    if (!searchQuery.trim()) return schedules;
    const q = searchQuery.toLowerCase().trim();
    return schedules.filter(s => {
      const namaKa = s.kereta?.namaka?.toLowerCase() || '';
      const noKa = s.no_ka.toLowerCase();
      const asal = s.stasiun_keberangkatan.toLowerCase();
      const tujuan = s.stasiun_tujuan.toLowerCase();
      return namaKa.includes(q) || noKa.includes(q) || asal.includes(q) || tujuan.includes(q);
    });
  }, [schedules, searchQuery]);

  // Current customer tickets
  const myTickets = useMemo(() => {
    if (!session) return [];
    return bookings.filter(b => b.email_penumpang.toLowerCase() === session.email.toLowerCase());
  }, [bookings, session]);

  // Helper pricing display
  const getTrainPricePerSeat = (jeniska?: string) => {
    if (jeniska === 'Eksekutif') return 180000;
    if (jeniska === 'Bisnis') return 120000;
    return 80000;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-red-500 selection:text-white">
      {/* Real-time Toast Notifications */}
      <Notification toasts={toasts} onDismiss={dismissToast} />

      {/* Modern Light Theme Header */}
      <Header 
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          // Auto select first train if navigating to booking from schedule
          if (view === 'booking' && !selectedTrainForBooking && schedules.length > 0) {
            setSelectedTrainForBooking(schedules[0]);
          }
        }}
        session={session}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuth(true)}
        dbOnline={dbOnline}
      />

      {/* Main Body Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ======================================================== */}
        {/* VIEW 1: BOARD OF DEPARTURE (JADWAL KEBERANGKATAN)        */}
        {/* ======================================================== */}
        {currentView === 'board' && (
          <div className="space-y-6">
            
            {/* Banner Hero */}
            <div className="bg-linear-to-r from-red-600 via-rose-600 to-amber-500 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
                <Train className="w-80 h-80" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block bg-white/20 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 font-mono">
                  Sistem Real-Time Supabase
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold font-rajdhani tracking-tight mb-4">
                  Perjalanan Lebih Mudah dengan Jugijagijuk
                </h2>
                <p className="text-red-50 text-base md:text-lg mb-6 leading-relaxed">
                  Cari jadwal kereta api terbaik, pilih nomor kursi favorit secara real-time, dan miliki perjalanan yang nyaman dan berkesan.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (schedules.length > 0) {
                        setSelectedTrainForBooking(schedules[0]);
                      }
                      setCurrentView('booking');
                    }}
                    className="px-6 py-3 bg-white hover:bg-slate-50 text-red-600 font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Pesan Tiket Sekarang
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (session?.role === 'admin') {
                        setCurrentView('admin');
                      } else {
                        setShowAuth(true);
                      }
                    }}
                    className="px-6 py-3 bg-red-700/55 hover:bg-red-700/70 border border-white/20 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Akses Dashboard Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Controls & Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-xs">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Cari nomor KA, nama kereta, atau stasiun asal/tujuan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold">Status Papan</span>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-600">LIVE ({filteredSchedules.length} KA)</span>
                </div>
              </div>
            </div>

            {/* Table Board Layout */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150">
                      <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">No. KA</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Nama Kereta</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Jenis Kelas</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Asal</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono text-center">Berangkat</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Tujuan</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono text-center">Tiba</th>
                      <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingSchedules ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400 font-mono text-sm">
                          <span className="inline-block animate-bounce mr-2">⏳</span>
                          MEMUAT PAPAN JADWAL REAL-TIME...
                        </td>
                      </tr>
                    ) : filteredSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400 font-mono text-sm">
                          TIDAK ADA JADWAL KERETA API YANG DITEMUKAN
                        </td>
                      </tr>
                    ) : (
                      filteredSchedules.map((j) => {
                        const isEksekutif = j.kereta?.jeniska === 'Eksekutif';
                        const isBisnis = j.kereta?.jeniska === 'Bisnis';
                        const badgeColor = isEksekutif 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : isBisnis 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-slate-50 text-slate-600 border-slate-200';

                        return (
                          <tr key={j.no_ka} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-4 pl-6 font-mono font-bold text-red-600 text-sm group-hover:scale-105 transition-transform">{j.no_ka}</td>
                            <td className="p-4 font-bold text-slate-900">{j.kereta?.namaka || 'Kereta Penumpang'}</td>
                            <td className="p-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${badgeColor}`}>
                                {j.kereta?.jeniska || 'Ekonomi'}
                              </span>
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-600">
                              {j.stasiun_keberangkatan}
                              <span className="block text-[10px] text-slate-400 font-mono">ASAL</span>
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-base text-slate-900 bg-slate-50/30">{j.waktu_keberangkatan}</td>
                            <td className="p-4 text-sm font-medium text-slate-600">
                              {j.stasiun_tujuan}
                              <span className="block text-[10px] text-slate-400 font-mono">TUJUAN</span>
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-base text-slate-900 bg-slate-50/30">{j.waktu_kedatangan}</td>
                            <td className="p-4 pr-6 text-right">
                              <button
                                onClick={() => {
                                  setSelectedTrainForBooking(j);
                                  setCurrentView('booking');
                                }}
                                className="px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                              >
                                Pesan Tiket
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: TICKET RESERVATION / BOOKING & SEAT CHOICE        */}
        {/* ======================================================== */}
        {currentView === 'booking' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold font-rajdhani text-slate-900 tracking-tight">
                  Form Pemesanan & Pemilihan Kursi
                </h2>
                <p className="text-sm text-slate-500 font-mono">
                  Sistem Pemilihan Kursi Interaktif dengan Sinkronisasi Database Real-Time
                </p>
              </div>
              <button
                onClick={() => setCurrentView('board')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
              >
                Kembali ke Jadwal
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Passenger Info Form */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <User className="w-5 h-5 text-red-500" />
                    Informasi Penumpang
                  </h3>

                  <form className="space-y-4">
                    {/* Train Selector Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Pilih Kereta Api</label>
                      <select
                        value={selectedTrainForBooking?.no_ka || ''}
                        onChange={(e) => {
                          const match = schedules.find(s => s.no_ka === e.target.value);
                          if (match) {
                            setSelectedTrainForBooking(match);
                            setSelectedSeats([]); // clear selections
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
                      >
                        {schedules.map(s => (
                          <option key={s.no_ka} value={s.no_ka}>
                            {s.no_ka} - {s.kereta?.namaka} ({s.kereta?.jeniska})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Selector */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Tanggal Perjalanan</label>
                      <input
                        type="date"
                        value={travelDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setTravelDate(e.target.value);
                          setSelectedSeats([]); // Reset seats
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
                      />
                    </div>

                    {/* Passenger Name Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Nama Lengkap Penumpang</label>
                      <input
                        type="text"
                        placeholder="Contoh: Budi Santoso"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
                      />
                    </div>

                    {/* Passenger Email Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Alamat Email (Untuk Notifikasi)</label>
                      <input
                        type="email"
                        placeholder="Contoh: budi@gmail.com"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
                      />
                    </div>
                  </form>
                </div>

                {/* Selected Tickets Summary Summary */}
                {selectedTrainForBooking && (
                  <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
                    <h3 className="text-base font-mono uppercase tracking-widest text-amber-400 font-bold">Rincian Pembayaran</h3>
                    
                    <div className="space-y-2 border-b border-slate-800 pb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kereta Api</span>
                        <span className="font-bold">{selectedTrainForBooking.kereta?.namaka} ({selectedTrainForBooking.no_ka})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kelas</span>
                        <span className="font-semibold text-amber-300">{selectedTrainForBooking.kereta?.jeniska}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tanggal</span>
                        <span className="font-semibold">{travelDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Harga Satuan</span>
                        <span className="font-semibold text-slate-200">Rp {getTrainPricePerSeat(selectedTrainForBooking.kereta?.jeniska).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kursi Terpilih</span>
                        <span className="font-mono font-bold text-amber-400">
                          {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Belum memilih'}
                        </span>
                      </div>
                      <div className="flex justify-between items-end pt-2">
                        <span className="text-slate-400 text-base font-bold">Total Tagihan</span>
                        <span className="text-2xl font-extrabold text-white">
                          Rp {(getTrainPricePerSeat(selectedTrainForBooking.kereta?.jeniska) * selectedSeats.length).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCreateBooking}
                      id="submit-booking-action"
                      className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-xl text-sm transition-colors shadow-lg cursor-pointer"
                    >
                      Konfirmasi & Pesan Tiket
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Visual Train Seat Map */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Armchair className="w-5 h-5 text-red-500" />
                      Pilih Tempat Duduk (Gerbong 1)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik kursi yang kosong untuk memilih. Maksimal kapasitas gerbong: 40 kursi.
                    </p>
                  </div>

                  {/* Seat Map Legend */}
                  <div className="flex gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded" />
                      <span>Kosong</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-red-600 rounded" />
                      <span>Dipilih</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-slate-300 border border-slate-300 rounded cursor-not-allowed" />
                      <span>Terisi</span>
                    </div>
                  </div>
                </div>

                {loadingSeats ? (
                  <div className="p-16 text-center text-slate-400 font-mono text-xs animate-pulse">
                    MENGAMBIL STATUS KURSI TERBARU SECARA REAL-TIME...
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* The Visual Coach Simulator */}
                    <div className="border border-slate-200 bg-slate-50 p-6 rounded-2xl relative overflow-hidden">
                      {/* Train Driver Cockpit indicator at the top or front */}
                      <div className="bg-slate-200 border-b border-slate-300 -mx-6 -mt-6 p-2 text-center text-xs font-bold text-slate-500 font-mono tracking-widest mb-6">
                        ◀ KEMUDI MASINIS / DEPAN GERBONG
                      </div>

                      {/* Seat Grid Layout */}
                      <div className="grid grid-cols-10 gap-2.5 max-w-xl mx-auto">
                        {CARRIAGE_SEATS.map(seatId => {
                          const isTaken = takenSeats.includes(seatId);
                          const isSelected = selectedSeats.includes(seatId);
                          
                          let btnClass = 'bg-white border-slate-200 hover:border-red-400 text-slate-700 hover:bg-red-50';
                          if (isTaken) {
                            btnClass = 'bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed';
                          } else if (isSelected) {
                            btnClass = 'bg-red-600 border-red-700 text-white hover:bg-red-700';
                          }

                          return (
                            <button
                              key={seatId}
                              type="button"
                              onClick={() => handleSeatClick(seatId)}
                              disabled={isTaken}
                              id={`seat-${seatId}`}
                              className={`aspect-square w-full rounded-lg border text-[11px] sm:text-xs font-mono font-bold flex flex-col items-center justify-center transition-all ${btnClass}`}
                              title={isTaken ? `Kursi ${seatId} Terisi` : `Kursi ${seatId}`}
                            >
                              <Armchair className="w-3.5 h-3.5 opacity-60 mb-0.5" />
                              {seatId}
                            </button>
                          );
                        })}
                      </div>

                      <div className="bg-slate-200 border-t border-slate-300 -mx-6 -mb-6 p-2 text-center text-xs font-bold text-slate-500 font-mono tracking-widest mt-6">
                        BELAKANG GERBONG ▶
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>Catatan Ketersediaan Kursi:</strong> Ketika Anda menyelesaikan transaksi, database Supabase akan langsung mengunci nomor kursi Anda demi menghindari tumpang tindih dengan calon penumpang lain.
                      </p>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: CUSTOMER TICKETS HISTORY                        */}
        {/* ======================================================== */}
        {currentView === 'my-tickets' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold font-rajdhani text-slate-900 tracking-tight">
                Daftar Tiket Perjalanan Saya
              </h2>
              <p className="text-sm text-slate-500 font-mono">
                Log histori tiket untuk penumpang terautentikasi: {session?.email}
              </p>
            </div>

            {loadingBookings ? (
              <div className="p-16 text-center text-slate-400 font-mono text-sm animate-pulse">
                MEMBACA HISTORI TIKET ANDA...
              </div>
            ) : myTickets.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-150 space-y-4 max-w-lg mx-auto shadow-sm">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-700">Belum Ada Histori Pemesanan</h3>
                <p className="text-sm text-slate-500">
                  Anda belum pernah memesan tiket kereta api atau menggunakan alamat email ini sebelumnya.
                </p>
                <button
                  onClick={() => setCurrentView('board')}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Pesan Tiket Pertama Anda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myTickets.map(b => {
                  const isPending = b.status === 'Pending';
                  const isConfirmed = b.status === 'Confirmed';
                  
                  return (
                    <div key={b.id} className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex flex-col">
                      {/* Ticket Header Banner */}
                      <div className={`p-4 text-white flex items-center justify-between ${
                        isConfirmed ? 'bg-linear-to-r from-emerald-600 to-teal-600' : isPending ? 'bg-linear-to-r from-amber-500 to-yellow-500' : 'bg-linear-to-r from-rose-600 to-red-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Train className="w-5 h-5 text-amber-300" />
                          <span className="text-sm font-bold font-mono tracking-wider">
                            BOARDING PASS CODE: {b.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold uppercase bg-white/20 px-2 py-0.5 rounded-md">
                          {b.status}
                        </span>
                      </div>

                      {/* Ticket Body details */}
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">
                              {b.jadwal_detail?.kereta?.namaka || 'KA Penumpang'}
                            </h4>
                            <p className="text-xs text-red-600 font-mono font-bold">{b.no_ka}</p>
                          </div>
                          <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {b.jadwal_detail?.kereta?.jeniska || 'Ekonomi'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm font-mono border-t border-slate-100 pt-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">STASIUN ASAL</span>
                            <span className="font-semibold text-slate-700">{b.jadwal_detail?.stasiun_keberangkatan || 'Gambir (GMR)'}</span>
                            <span className="block text-red-600 font-bold text-base mt-1">{b.jadwal_detail?.waktu_keberangkatan || '--:--'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">STASIUN TUJUAN</span>
                            <span className="font-semibold text-slate-700">{b.jadwal_detail?.stasiun_tujuan || 'Bandung (BD)'}</span>
                            <span className="block text-red-600 font-bold text-base mt-1">{b.jadwal_detail?.waktu_kedatangan || '--:--'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm font-sans border-t border-b border-slate-100 py-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold font-mono">NAMA PENUMPANG</span>
                            <span className="font-bold text-slate-800">{b.nama_penumpang}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold font-mono">NOMOR KURSI</span>
                            <span className="font-bold text-slate-800 font-mono tracking-wider">{b.kursi.join(', ')}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <div className="text-xs text-slate-400 font-mono">
                            Dipesan tanggal: {new Date(b.created_at).toLocaleDateString('id-ID')}
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold font-mono">TOTAL BIAYA</span>
                            <span className="text-lg font-extrabold text-slate-900">Rp {b.total_harga.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Conditional Boarding Note */}
                      <div className="bg-slate-50 p-3 text-center border-t border-slate-100 text-xs font-mono text-slate-500">
                        {isConfirmed 
                          ? '✅ Siap Boarding! Cetak struk boarding pass di stasiun keberangkatan.' 
                          : isPending 
                          ? '⏳ Menunggu persetujuan Admin & Verifikasi pembayaran.'
                          : '❌ Tiket telah dibatalkan / Kadaluwarsa.'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: ADMIN PANEL (PROTECTED)                         */}
        {/* ======================================================== */}
        {currentView === 'admin' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold font-rajdhani text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-8 h-8 text-red-600" />
                  Sistem Informasi & Manajemen Admin (Panel)
                </h2>
                <p className="text-sm text-slate-500 font-mono">
                  Pusat Operasional: Pengaturan Jadwal KA, Status Pemesanan, dan Monitor Outbox Email
                </p>
              </div>
              <button
                onClick={loadBookings}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (Manage Schedules Form & List) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Form Add Schedule */}
                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono uppercase tracking-wider border-b border-slate-100 pb-2">
                    <Plus className="w-5 h-5 text-red-500" />
                    Tambah Jadwal KA Baru
                  </h3>

                  <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase font-mono">No. KA</label>
                        <input
                          type="text"
                          placeholder="Contoh: KA-102"
                          value={newNoKa}
                          onChange={(e) => setNewNoKa(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase font-mono">Jenis Kelas</label>
                        <select
                          value={newJenisKa}
                          onChange={(e) => setNewJenisKa(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800 font-semibold"
                        >
                          <option value="Eksekutif">Eksekutif</option>
                          <option value="Bisnis">Bisnis</option>
                          <option value="Ekonomi">Ekonomi</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase font-mono">Nama Kereta Api</label>
                      <input
                        type="text"
                        placeholder="Contoh: Argo Parahyangan"
                        value={newNamaKa}
                        onChange={(e) => setNewNamaKa(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase font-mono">Stasiun Asal</label>
                        <input
                          type="text"
                          placeholder="Gambir (GMR)"
                          value={newAsal}
                          onChange={(e) => setNewAsal(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase font-mono">Jam Berangkat</label>
                        <input
                          type="text"
                          placeholder="08:00"
                          value={newBerangkat}
                          onChange={(e) => setNewBerangkat(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase font-mono">Stasiun Tujuan</label>
                        <input
                          type="text"
                          placeholder="Bandung (BD)"
                          value={newTujuan}
                          onChange={(e) => setNewTujuan(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase font-mono">Jam Tiba</label>
                        <input
                          type="text"
                          placeholder="11:15"
                          value={newTiba}
                          onChange={(e) => setNewTiba(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="submit-new-schedule"
                      className="w-full mt-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
                    >
                      Daftarkan Jadwal KA
                    </button>
                  </form>
                </div>

                {/* Quick Schedules delete panel */}
                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono uppercase tracking-wider border-b border-slate-100 pb-2">
                    Hapus Jadwal KA ({schedules.length})
                  </h3>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                    {schedules.map(s => (
                      <div key={s.no_ka} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{s.no_ka} - {s.kereta?.namaka}</p>
                          <p className="text-slate-400 font-mono text-[10px]">{s.stasiun_keberangkatan} ➔ {s.stasiun_tujuan}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteSchedule(s.no_ka)}
                          id={`delete-schedule-${s.no_ka}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors"
                          title="Hapus jadwal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (Client bookings list & Email Log Ledger) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Client Bookings List */}
                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
                    <span>Daftar Pesanan Tiket Client</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      Total: {bookings.length} Pesanan
                    </span>
                  </h3>

                  {loadingBookings ? (
                    <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
                      MEMBACA DAFTAR TRANSAKSI...
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-mono text-xs">
                      BELUM ADA CLIENT YANG MELAKUKAN PEMESANAN TIKET.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-mono">
                            <th className="p-3 font-bold uppercase">Nama / Email</th>
                            <th className="p-3 font-bold uppercase">No. KA</th>
                            <th className="p-3 font-bold uppercase">Tanggal</th>
                            <th className="p-3 font-bold uppercase">Nomor Kursi</th>
                            <th className="p-3 font-bold uppercase">Total Tagihan</th>
                            <th className="p-3 font-bold uppercase">Status</th>
                            <th className="p-3 font-bold uppercase text-right">Tindakan Admin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {bookings.map(b => {
                            const isPending = b.status === 'Pending';
                            const isConfirmed = b.status === 'Confirmed';
                            
                            return (
                              <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3">
                                  <div className="font-bold text-slate-800">{b.nama_penumpang}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{b.email_penumpang}</div>
                                </td>
                                <td className="p-3 font-mono font-bold text-red-600">{b.no_ka}</td>
                                <td className="p-3 font-mono font-medium">{b.tanggal_perjalanan}</td>
                                <td className="p-3 font-mono font-bold text-amber-600">{b.kursi.join(', ')}</td>
                                <td className="p-3 font-bold text-slate-900">Rp {b.total_harga.toLocaleString('id-ID')}</td>
                                <td className="p-3">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                                    isConfirmed 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                      : isPending 
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    {isPending && (
                                      <>
                                        <button
                                          onClick={() => handleConfirmBooking(b)}
                                          id={`confirm-booking-${b.id}`}
                                          className="p-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-700 rounded-md transition-all cursor-pointer"
                                          title="Konfirmasi Pesanan & Kirim Email"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleCancelBooking(b.id)}
                                          id={`cancel-booking-${b.id}`}
                                          className="p-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-700 rounded-md transition-all cursor-pointer"
                                          title="Batalkan Pesanan"
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                    {!isPending && (
                                      <span className="text-[10px] font-mono text-slate-400">Finalized</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Email Outbox Logs ledger */}
                <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-xl space-y-4">
                  <h3 className="text-base font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center justify-between">
                    <span>📧 Log Outbox Email Notifikasi Otomatis</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-sans lowercase font-normal">
                      Simulated server ledger
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Setiap kali Anda mengklik tombol konfirmasi pesanan (tanda centang hijau) di atas, sistem backend Express akan secara dinamis menyusun e-ticket resmi Kementerian Perhubungan dan mengirimkannya ke alamat email client. Histori outbox tersimpan di memori server di bawah ini:
                  </p>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {emailOutbox.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                        BELUM ADA EMAIL LOG YANG DIKIRIMKAN.
                      </div>
                    ) : (
                      emailOutbox.map((mail, idx) => (
                        <div key={idx} className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                            <span className="text-amber-400 font-bold font-mono">{mail.id}</span>
                            <span className="text-slate-400 font-mono text-[10px]">{new Date(mail.sentAt).toLocaleTimeString()}</span>
                          </div>
                          <div className="space-y-1">
                            <div><strong className="text-slate-400">Kepada:</strong> {mail.to}</div>
                            <div><strong className="text-slate-400">Subjek:</strong> {mail.subject}</div>
                          </div>
                          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 mt-1">
                            <pre className="font-mono text-[10px] text-emerald-400/90 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                              {mail.body}
                            </pre>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Authentication Modal Dialog */}
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          onLoginSuccess={handleLoginSuccess}
          addToast={addToast}
        />
      )}

      {/* Footer Design */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-sans font-bold text-slate-800">
            Sistem Keberangkatan Kereta Api Jugijagijuk © 2026
          </p>
          <p>
            Dibuat menggunakan React 19, Tailwind CSS, Express v4, dan Database PostgreSQL di Supabase.
          </p>
          <p className="text-[10px] text-slate-300">
            Aplikasi ini terintegrasi penuh dengan sistem notifikasi e-ticket instan dan reservasi kursi real-time.
          </p>
        </div>
      </footer>
    </div>
  );
}
