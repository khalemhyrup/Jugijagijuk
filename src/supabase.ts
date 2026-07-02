/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Jadwal, Pesanan, KetersediaanKursi } from './types';

const SUPABASE_URL = 'https://latangjpwljbyedpsidw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KE2yCf39oIJMfjYUnYYVXA_0pZtMeJh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Default initial schedule data to be used as fallback or initial load
export const INITIAL_SCHEDULES: Jadwal[] = [
  {
    no_ka: 'KA-102',
    stasiun_keberangkatan: 'Gambir (GMR)',
    waktu_keberangkatan: '08:00',
    stasiun_tujuan: 'Bandung (BD)',
    waktu_kedatangan: '11:15',
    kereta: { namaka: 'Argo Parahyangan', jeniska: 'Eksekutif' }
  },
  {
    no_ka: 'KA-104',
    stasiun_keberangkatan: 'Gambir (GMR)',
    waktu_keberangkatan: '10:30',
    stasiun_tujuan: 'Surabaya Gubeng (SGU)',
    waktu_kedatangan: '19:45',
    kereta: { namaka: 'Bima', jeniska: 'Eksekutif' }
  },
  {
    no_ka: 'KA-120',
    stasiun_keberangkatan: 'Pasar Senen (PSE)',
    waktu_keberangkatan: '13:15',
    stasiun_tujuan: 'Yogyakarta (YK)',
    waktu_kedatangan: '21:00',
    kereta: { namaka: 'Fajar Utama Yk', jeniska: 'Bisnis' }
  },
  {
    no_ka: 'KA-182',
    stasiun_keberangkatan: 'Pasar Senen (PSE)',
    waktu_keberangkatan: '15:45',
    stasiun_tujuan: 'Malang (ML)',
    waktu_kedatangan: '04:30',
    kereta: { namaka: 'Matarmaja', jeniska: 'Ekonomi' }
  },
  {
    no_ka: 'KA-106',
    stasiun_keberangkatan: 'Gambir (GMR)',
    waktu_keberangkatan: '18:15',
    stasiun_tujuan: 'Semarang Tawang (SMT)',
    waktu_kedatangan: '23:50',
    kereta: { namaka: 'Argo Muria', jeniska: 'Eksekutif' }
  }
];

// Helper to check if a specific table exists and is readable
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select('count', { count: 'exact', head: true }).limit(1);
    if (error) {
      console.warn(`Table check warning for '${tableName}':`, error.message);
      // If error code is 42P01, the table doesn't exist
      if (error.code === '42P01') {
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error(`Table check failed for '${tableName}':`, err);
    return false;
  }
}

// ----------------------------------------------------
// LOCAL STORAGE BACKUPS (For tables that do not exist)
// ----------------------------------------------------
const getLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(`jugijagijuk_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`jugijagijuk_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Local storage write failed:', e);
  }
};

// ----------------------------------------------------
// DATABASE API ADAPTERS WITH AUTOMATIC FALLBACK
// ----------------------------------------------------

export interface DbStatus {
  jadwalOnline: boolean;
  pesananOnline: boolean;
  kursiOnline: boolean;
  errorMsg?: string;
}

export const getDbStatus = async (): Promise<DbStatus> => {
  const status: DbStatus = {
    jadwalOnline: false,
    pesananOnline: false,
    kursiOnline: false,
  };

  try {
    status.jadwalOnline = await tableExists('jadwal');
    status.pesananOnline = await tableExists('pesanan');
    status.kursiOnline = await tableExists('ketersediaan_kursi');
  } catch (err: any) {
    status.errorMsg = err?.message || 'Database connection error';
  }

  return status;
};

// 1. SCHEDULES (JADWAL)
export const fetchSchedules = async (): Promise<Jadwal[]> => {
  try {
    const isOnline = await tableExists('jadwal');
    if (isOnline) {
      const { data, error } = await supabase
        .from('jadwal')
        .select(`
          no_ka,
          stasiun_keberangkatan,
          waktu_keberangkatan,
          stasiun_tujuan,
          waktu_kedatangan,
          kereta ( namaka, jeniska )
        `)
        .order('waktu_keberangkatan', { ascending: true });

      if (error) {
        console.error('Supabase fetch jadwal error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        // Transform the join result if necessary to match type interface
        return data.map((item: any) => ({
          no_ka: item.no_ka,
          stasiun_keberangkatan: item.stasiun_keberangkatan,
          waktu_keberangkatan: item.waktu_keberangkatan,
          stasiun_tujuan: item.stasiun_tujuan,
          waktu_kedatangan: item.waktu_kedatangan,
          kereta: item.kereta ? {
            namaka: item.kereta.namaka || 'Kereta',
            jeniska: item.kereta.jeniska || 'Ekonomi'
          } : undefined
        }));
      }
    }
  } catch (err) {
    console.warn('Falling back to local schedules storage due to error:', err);
  }

  // Fallback to local storage or defaults
  const localSchedules = getLocalData<Jadwal[]>('schedules', []);
  if (localSchedules.length === 0) {
    setLocalData('schedules', INITIAL_SCHEDULES);
    return INITIAL_SCHEDULES;
  }
  return localSchedules;
};

export const saveSchedule = async (schedule: Jadwal): Promise<boolean> => {
  try {
    const isOnline = await tableExists('jadwal');
    if (isOnline) {
      // First, we need to make sure the kereta exists, but if we don't have schema control, 
      // let's try inserting directly into jadwal, or creating a kereta record first.
      // Since 'kereta' might be foreign-key constrained, let's insert into 'kereta' first if it has table
      const hasKeretaTable = await tableExists('kereta');
      if (hasKeretaTable && schedule.kereta) {
        await supabase.from('kereta').upsert({
          namaka: schedule.kereta.namaka,
          jeniska: schedule.kereta.jeniska
        }, { onConflict: 'namaka' });
      }

      const { error } = await supabase.from('jadwal').insert({
        no_ka: schedule.no_ka,
        stasiun_keberangkatan: schedule.stasiun_keberangkatan,
        waktu_keberangkatan: schedule.waktu_keberangkatan,
        stasiun_tujuan: schedule.stasiun_tujuan,
        waktu_kedatangan: schedule.waktu_kedatangan
      });

      if (!error) return true;
      console.error('Supabase save schedule failed, using fallback:', error.message);
    }
  } catch (err) {
    console.warn('Supabase save schedule error, using fallback:', err);
  }

  // Local storage fallback
  const schedules = getLocalData<Jadwal[]>('schedules', INITIAL_SCHEDULES);
  // Prevent duplicate
  const filtered = schedules.filter(s => s.no_ka !== schedule.no_ka);
  setLocalData('schedules', [...filtered, schedule]);
  return true;
};

export const deleteSchedule = async (no_ka: string): Promise<boolean> => {
  try {
    const isOnline = await tableExists('jadwal');
    if (isOnline) {
      const { error } = await supabase.from('jadwal').delete().eq('no_ka', no_ka);
      if (!error) return true;
      console.error('Supabase delete schedule failed, using fallback:', error.message);
    }
  } catch (err) {
    console.warn('Supabase delete schedule error, using fallback:', err);
  }

  // Local storage fallback
  const schedules = getLocalData<Jadwal[]>('schedules', INITIAL_SCHEDULES);
  const updated = schedules.filter(s => s.no_ka !== no_ka);
  setLocalData('schedules', updated);
  return true;
};

// 2. BOOKINGS (PESANAN)
export const fetchBookings = async (): Promise<Pesanan[]> => {
  try {
    const isOnline = await tableExists('pesanan');
    if (isOnline) {
      const { data, error } = await supabase
        .from('pesanan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch pesanan error:', error);
        throw error;
      }

      if (data) {
        // Hydrate each booking with its train schedule details
        const schedules = await fetchSchedules();
        return data.map((p: any) => {
          const detail = schedules.find(s => s.no_ka === p.no_ka);
          // Handle arrays stored as json or text strings
          let kursiList: string[] = [];
          if (Array.isArray(p.kursi)) {
            kursiList = p.kursi;
          } else if (typeof p.kursi === 'string') {
            try {
              kursiList = JSON.parse(p.kursi);
            } catch {
              kursiList = p.kursi.split(',').map((s: string) => s.trim());
            }
          }
          return {
            id: p.id,
            no_ka: p.no_ka,
            nama_penumpang: p.nama_penumpang,
            email_penumpang: p.email_penumpang,
            kursi: kursiList,
            tanggal_perjalanan: p.tanggal_perjalanan,
            status: p.status,
            total_harga: Number(p.total_harga),
            created_at: p.created_at,
            jadwal_detail: detail
          };
        });
      }
    }
  } catch (err) {
    console.warn('Falling back to local bookings storage:', err);
  }

  // Local storage fallback
  const bookings = getLocalData<Pesanan[]>('bookings', []);
  const schedules = await fetchSchedules();
  return bookings.map(p => ({
    ...p,
    jadwal_detail: schedules.find(s => s.no_ka === p.no_ka)
  }));
};

export const createBooking = async (booking: Omit<Pesanan, 'id' | 'created_at'>): Promise<Pesanan> => {
  const newId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const newBooking: Pesanan = {
    ...booking,
    id: newId,
    created_at: createdAt
  };

  try {
    const isOnline = await tableExists('pesanan');
    if (isOnline) {
      const { error } = await supabase.from('pesanan').insert({
        id: newId,
        no_ka: booking.no_ka,
        nama_penumpang: booking.nama_penumpang,
        email_penumpang: booking.email_penumpang,
        kursi: booking.kursi, // Supabase natively supports JSON arrays or text arrays
        tanggal_perjalanan: booking.tanggal_perjalanan,
        status: booking.status,
        total_harga: booking.total_harga,
        created_at: createdAt
      });

      if (!error) {
        // Also update seat occupancy in DB
        await markSeatsAsTakenInDb(booking.no_ka, booking.tanggal_perjalanan, booking.kursi);
        return newBooking;
      }
      console.error('Supabase insert booking failed, using local storage:', error.message);
    }
  } catch (err) {
    console.warn('Supabase insert booking error, using local storage fallback:', err);
  }

  // Local storage fallback
  const bookings = getLocalData<Pesanan[]>('bookings', []);
  setLocalData('bookings', [newBooking, ...bookings]);

  // Update local seats
  await markSeatsAsTakenInDb(booking.no_ka, booking.tanggal_perjalanan, booking.kursi);

  return newBooking;
};

export const updateBookingStatus = async (id: string, status: 'Confirmed' | 'Cancelled'): Promise<boolean> => {
  try {
    const isOnline = await tableExists('pesanan');
    if (isOnline) {
      const { error } = await supabase
        .from('pesanan')
        .update({ status })
        .eq('id', id);

      if (!error) {
        // If cancelled, we free up the seats
        if (status === 'Cancelled') {
          const bookings = await fetchBookings();
          const target = bookings.find(b => b.id === id);
          if (target) {
            await freeSeatsInDb(target.no_ka, target.tanggal_perjalanan, target.kursi);
          }
        }
        return true;
      }
      console.error('Supabase update status failed, using local storage:', error.message);
    }
  } catch (err) {
    console.warn('Supabase update status error, using fallback:', err);
  }

  // Local storage fallback
  const bookings = getLocalData<Pesanan[]>('bookings', []);
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    const previousStatus = bookings[index].status;
    bookings[index].status = status;
    setLocalData('bookings', bookings);

    // If cancelled, we free up the seats in fallback
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      await freeSeatsInDb(bookings[index].no_ka, bookings[index].tanggal_perjalanan, bookings[index].kursi);
    }
    return true;
  }
  return false;
};

// 3. SEATS (KETERSEDIAAN KURSI)
export const fetchTakenSeats = async (no_ka: string, tanggal: string): Promise<string[]> => {
  try {
    const isOnline = await tableExists('ketersediaan_kursi');
    if (isOnline) {
      const { data, error } = await supabase
        .from('ketersediaan_kursi')
        .select('kursi_terisi')
        .eq('no_ka', no_ka)
        .eq('tanggal', tanggal)
        .maybeSingle();

      if (error) {
        console.error('Supabase fetch seats error:', error);
        throw error;
      }

      if (data && data.kursi_terisi) {
        return Array.isArray(data.kursi_terisi) ? data.kursi_terisi : [];
      }
    }
  } catch (err) {
    console.warn('Falling back to local seats storage:', err);
  }

  // Local storage fallback
  const allSeats = getLocalData<KetersediaanKursi[]>('seats_availability', []);
  const entry = allSeats.find(s => s.no_ka === no_ka && s.tanggal === tanggal);
  return entry ? entry.kursi_terisi : [];
};

export const markSeatsAsTakenInDb = async (no_ka: string, tanggal: string, seatsToBook: string[]): Promise<boolean> => {
  try {
    const isOnline = await tableExists('ketersediaan_kursi');
    const currentlyTaken = await fetchTakenSeats(no_ka, tanggal);
    const updatedTaken = Array.from(new Set([...currentlyTaken, ...seatsToBook]));

    if (isOnline) {
      const { error } = await supabase
        .from('ketersediaan_kursi')
        .upsert({
          no_ka,
          tanggal,
          kursi_terisi: updatedTaken
        }, { onConflict: 'no_ka,tanggal' });

      if (!error) return true;
      console.error('Supabase upsert seats failed:', error.message);
    }
  } catch (err) {
    console.warn('Supabase seats marking failed, using fallback:', err);
  }

  // Fallback
  const allSeats = getLocalData<KetersediaanKursi[]>('seats_availability', []);
  const index = allSeats.findIndex(s => s.no_ka === no_ka && s.tanggal === tanggal);
  
  if (index !== -1) {
    const current = allSeats[index].kursi_terisi;
    allSeats[index].kursi_terisi = Array.from(new Set([...current, ...seatsToBook]));
  } else {
    allSeats.push({
      no_ka,
      tanggal,
      kursi_terisi: seatsToBook
    });
  }
  setLocalData('seats_availability', allSeats);
  return true;
};

export const freeSeatsInDb = async (no_ka: string, tanggal: string, seatsToFree: string[]): Promise<boolean> => {
  try {
    const isOnline = await tableExists('ketersediaan_kursi');
    const currentlyTaken = await fetchTakenSeats(no_ka, tanggal);
    const updatedTaken = currentlyTaken.filter(seat => !seatsToFree.includes(seat));

    if (isOnline) {
      const { error } = await supabase
        .from('ketersediaan_kursi')
        .upsert({
          no_ka,
          tanggal,
          kursi_terisi: updatedTaken
        }, { onConflict: 'no_ka,tanggal' });

      if (!error) return true;
      console.error('Supabase free seats failed:', error.message);
    }
  } catch (err) {
    console.warn('Supabase free seats failed, using fallback:', err);
  }

  // Fallback
  const allSeats = getLocalData<KetersediaanKursi[]>('seats_availability', []);
  const index = allSeats.findIndex(s => s.no_ka === no_ka && s.tanggal === tanggal);
  
  if (index !== -1) {
    const current = allSeats[index].kursi_terisi;
    allSeats[index].kursi_terisi = current.filter(seat => !seatsToFree.includes(seat));
    setLocalData('seats_availability', allSeats);
  }
  return true;
};
