/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Kereta {
  namaka: string;
  jeniska: string;
}

export interface Jadwal {
  no_ka: string;
  stasiun_keberangkatan: string;
  waktu_keberangkatan: string;
  stasiun_tujuan: string;
  waktu_kedatangan: string;
  kereta?: Kereta;
}

export interface Pesanan {
  id: string;
  no_ka: string;
  nama_penumpang: string;
  email_penumpang: string;
  kursi: string[]; // List of seat IDs (e.g. ['A1', 'A2'])
  tanggal_perjalanan: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  total_harga: number;
  created_at: string;
  jadwal_detail?: Jadwal;
}

export interface KetersediaanKursi {
  no_ka: string;
  tanggal: string;
  kursi_terisi: string[];
}

export interface UserSession {
  email: string;
  role: 'admin' | 'customer';
  name?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
