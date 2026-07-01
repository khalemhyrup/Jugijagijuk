-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 30 Bulan Mei 2026 pada 16.13
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

SET FOREIGN_KEY_CHECKS = 0;
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jugijagijuk`
--

--
-- Dumping data untuk tabel `gerbong`
--

INSERT INTO `gerbong` (`kode_gerbong`, `tipe_gerbong`, `kelas`, `jumlah_kursi`, `dipo_gerbong`, `jumlah_penggerak`, `tahun_dinas`, `pabrikan`, `no_urut`) VALUES
('K1-0-18-24-YK', 'Penumpang', 'Eksekutif', 50, 'YK', 0, '2018', 'INKA', 24),
('K1-0-22-05-JAKK', 'Penumpang', 'Luxury', 26, 'JAK', 0, '2022', 'INKA', 5),
('K1-0-24-34-YK', 'Penumpang', 'Eksekutif', 50, 'YK', 0, '2024', 'INKA', 34),
('K1-0-24-98-YK', 'Penumpang', 'Eksekutif', 50, 'YK', 0, '2024', 'INKA', 98),
('K3-0-19-12-SMC', 'Penumpang', 'Ekonomi', 80, 'SMC', 0, '2019', 'INKA', 12),
('M1-0-18-02-YK', 'Makan', 'Eksekutif', 0, 'YK', 0, '2018', 'INKA', 2),
('P-0-17-01-SMC', 'Pembangkit', 'Tidak ada', 0, 'SMC', 0, '2017', 'PT KAI', 1);

--
-- Dumping data untuk tabel `jadwal`
--

INSERT INTO `jadwal` (`no_ka`, `stasiun_keberangkatan`, `waktu_keberangkatan`, `stasiun_tujuan`, `waktu_kedatangan`) VALUES
('KA162', 'Yogyakarta', '16:20:00.00000', 'Cirebon', '19:40:00.00000'),
('KA270', 'Maseng', '08:35:00.00000', 'Semarang Tawang', '16:40:00.00000'),
('KA272', 'Tambun', '07:35:00.00000', 'Ngawi', '15:40:00.00000'),
('KA282', 'Ngawi', '09:35:00.00000', 'Yogyakarta', '17:40:00.00000'),
('PLB7006', 'Semarang Tawang', '15:20:00.00000', 'Solo Balapan', '18:40:00.00000');

--
-- Dumping data untuk tabel `jadwal_pemberhentian`
--

INSERT INTO `jadwal_pemberhentian` (`no_ka`, `kode_stasiun`, `urutan_pemberhentian`, `waktu_tiba`, `waktu_berangkat`) VALUES
('KA270', 'NGW', 1, '09:00:00', '09:10:00'),
('KA272', 'CN', 1, '09:00:00', '09:10:00'),
('KA272', 'SLO', 2, '12:30:00', '12:40:00'),
('KA282', 'SLO', 1, '11:15:00', '11:25:00');

--
-- Dumping data untuk tabel `kereta`
--

INSERT INTO `kereta` (`no_ka`, `kode_lokomotif`, `NamaKA`, `JenisKA`) VALUES
('KA162', 'CC201-89-07-MN', 'Bangunkarta', 'KAJJ'),
('KA270', 'CC201-83-04-YK', 'Matarmaja', 'KAJJ'),
('KA272', 'CC201-77-20-CN', 'Airlangga', 'KAJJ'),
('KA282', 'CC201-83-08-JR', 'Bengawan', 'KAJJ'),
('PLB7006', 'CC203-98-08-CPN', 'Batavia', 'KA Tambahan');

--
-- Dumping data untuk tabel `kursi`
--

INSERT INTO `kursi` (`no_kursi`, `kode_gerbong`, `TipeKursi`) VALUES
('10A', 'K1-0-24-34-YK', 'Eksekutif'),
('10A', 'K1-0-24-98-YK', 'Eksekutif'),
('10B', 'K1-0-24-34-YK', 'Eksekutif'),
('10B', 'K1-0-24-98-YK', 'Eksekutif'),
('10C', 'K1-0-24-34-YK', 'Eksekutif'),
('10C', 'K1-0-24-98-YK', 'Eksekutif'),
('10D', 'K1-0-24-34-YK', 'Eksekutif'),
('10D', 'K1-0-24-98-YK', 'Eksekutif'),
('11A', 'K1-0-24-34-YK', 'Eksekutif'),
('11A', 'K1-0-24-98-YK', 'Eksekutif'),
('11B', 'K1-0-24-34-YK', 'Eksekutif'),
('11B', 'K1-0-24-98-YK', 'Eksekutif'),
('11C', 'K1-0-24-34-YK', 'Eksekutif'),
('11C', 'K1-0-24-98-YK', 'Eksekutif'),
('11D', 'K1-0-24-34-YK', 'Eksekutif'),
('11D', 'K1-0-24-98-YK', 'Eksekutif'),
('12A', 'K1-0-24-34-YK', 'Eksekutif'),
('12A', 'K1-0-24-98-YK', 'Eksekutif'),
('12B', 'K1-0-24-34-YK', 'Eksekutif'),
('12B', 'K1-0-24-98-YK', 'Eksekutif'),
('12C', 'K1-0-24-34-YK', 'Eksekutif'),
('12C', 'K1-0-24-98-YK', 'Eksekutif'),
('12D', 'K1-0-24-34-YK', 'Eksekutif'),
('12D', 'K1-0-24-98-YK', 'Eksekutif'),
('13A', 'K1-0-24-34-YK', 'Eksekutif'),
('13A', 'K1-0-24-98-YK', 'Eksekutif'),
('13B', 'K1-0-24-34-YK', 'Eksekutif'),
('13B', 'K1-0-24-98-YK', 'Eksekutif'),
('14C', 'K3-0-19-12-SMC', 'Premium'),
('15A', 'K1-0-18-24-YK', 'Eksekutif'),
('15B', 'K1-0-18-24-YK', 'Eksekutif'),
('1A', 'K1-0-18-24-YK', 'Eksekutif'),
('1A', 'K1-0-24-34-YK', 'Eksekutif'),
('1A', 'K1-0-24-98-YK', 'Eksekutif'),
('1A', 'K3-0-19-12-SMC', 'Premium'),
('1B', 'K1-0-18-24-YK', 'Eksekutif'),
('1B', 'K1-0-24-34-YK', 'Eksekutif'),
('1B', 'K1-0-24-98-YK', 'Eksekutif'),
('1B', 'K3-0-19-12-SMC', 'Premium'),
('1C', 'K1-0-24-34-YK', 'Eksekutif'),
('1C', 'K1-0-24-98-YK', 'Eksekutif'),
('1D', 'K1-0-24-34-YK', 'Eksekutif'),
('1D', 'K1-0-24-98-YK', 'Eksekutif'),
('2A', 'K1-0-24-34-YK', 'Eksekutif'),
('2A', 'K1-0-24-98-YK', 'Eksekutif'),
('2B', 'K1-0-24-34-YK', 'Eksekutif'),
('2B', 'K1-0-24-98-YK', 'Eksekutif'),
('2C', 'K1-0-24-34-YK', 'Eksekutif'),
('2C', 'K1-0-24-98-YK', 'Eksekutif'),
('2D', 'K1-0-24-34-YK', 'Eksekutif'),
('2D', 'K1-0-24-98-YK', 'Eksekutif'),
('3A', 'K1-0-24-34-YK', 'Eksekutif'),
('3A', 'K1-0-24-98-YK', 'Eksekutif'),
('3B', 'K1-0-24-34-YK', 'Eksekutif'),
('3B', 'K1-0-24-98-YK', 'Eksekutif'),
('3C', 'K1-0-24-34-YK', 'Eksekutif'),
('3C', 'K1-0-24-98-YK', 'Eksekutif'),
('3D', 'K1-0-24-34-YK', 'Eksekutif'),
('3D', 'K1-0-24-98-YK', 'Eksekutif'),
('4A', 'K1-0-24-34-YK', 'Eksekutif'),
('4A', 'K1-0-24-98-YK', 'Eksekutif'),
('4B', 'K1-0-24-34-YK', 'Eksekutif'),
('4B', 'K1-0-24-98-YK', 'Eksekutif'),
('4C', 'K1-0-24-34-YK', 'Eksekutif'),
('4C', 'K1-0-24-98-YK', 'Eksekutif'),
('4D', 'K1-0-24-34-YK', 'Eksekutif'),
('4D', 'K1-0-24-98-YK', 'Eksekutif'),
('5A', 'K1-0-24-34-YK', 'Eksekutif'),
('5A', 'K1-0-24-98-YK', 'Eksekutif'),
('5B', 'K1-0-24-34-YK', 'Eksekutif'),
('5B', 'K1-0-24-98-YK', 'Eksekutif'),
('5C', 'K1-0-24-34-YK', 'Eksekutif'),
('5C', 'K1-0-24-98-YK', 'Eksekutif'),
('5D', 'K1-0-24-34-YK', 'Eksekutif'),
('5D', 'K1-0-24-98-YK', 'Eksekutif'),
('6A', 'K1-0-24-34-YK', 'Eksekutif'),
('6A', 'K1-0-24-98-YK', 'Eksekutif'),
('6B', 'K1-0-24-34-YK', 'Eksekutif'),
('6B', 'K1-0-24-98-YK', 'Eksekutif'),
('6C', 'K1-0-24-34-YK', 'Eksekutif'),
('6C', 'K1-0-24-98-YK', 'Eksekutif'),
('6D', 'K1-0-24-34-YK', 'Eksekutif'),
('6D', 'K1-0-24-98-YK', 'Eksekutif'),
('7A', 'K1-0-24-34-YK', 'Eksekutif'),
('7A', 'K1-0-24-98-YK', 'Eksekutif'),
('7B', 'K1-0-24-34-YK', 'Eksekutif'),
('7B', 'K1-0-24-98-YK', 'Eksekutif'),
('7C', 'K1-0-24-34-YK', 'Eksekutif'),
('7C', 'K1-0-24-98-YK', 'Eksekutif'),
('7D', 'K1-0-24-34-YK', 'Eksekutif'),
('7D', 'K1-0-24-98-YK', 'Eksekutif'),
('8A', 'K1-0-24-34-YK', 'Eksekutif'),
('8A', 'K1-0-24-98-YK', 'Eksekutif'),
('8B', 'K1-0-24-34-YK', 'Eksekutif'),
('8B', 'K1-0-24-98-YK', 'Eksekutif'),
('8C', 'K1-0-24-34-YK', 'Eksekutif'),
('8C', 'K1-0-24-98-YK', 'Eksekutif'),
('8D', 'K1-0-24-34-YK', 'Eksekutif'),
('8D', 'K1-0-24-98-YK', 'Eksekutif'),
('9A', 'K1-0-24-34-YK', 'Eksekutif'),
('9A', 'K1-0-24-98-YK', 'Eksekutif'),
('9B', 'K1-0-24-34-YK', 'Eksekutif'),
('9B', 'K1-0-24-98-YK', 'Eksekutif'),
('9C', 'K1-0-24-34-YK', 'Eksekutif'),
('9C', 'K1-0-24-98-YK', 'Eksekutif'),
('9D', 'K1-0-24-34-YK', 'Eksekutif'),
('9D', 'K1-0-24-98-YK', 'Eksekutif');

--
-- Dumping data untuk tabel `lokomotif`
--

INSERT INTO `lokomotif` (`kode_lokomotif`, `model_seri`, `tahun_dinas`, `is_rebuild`, `dipo_induk`, `jenis`, `no_urut`, `foto_lok`) VALUES
('CC201-77-20-CN', 201, '1977', 0, 'CN', 'diesel-electric', 20, 'default_lok.jpg'),
('CC201-83-04-YK', 201, '1983', 0, 'YK', 'diesel-electric', 4, 'default_lok.jpg'),
('CC201-83-08-JR', 201, '1983', 1, 'JR', 'diesel-electric', 8, 'default_lok.jpg'),
('CC201-83-31-SMC', 201, '1983', 0, 'SMC', 'diesel-electric', 31, 'img_1780064101057.jpg'),
('CC201-83-47R-JR', 201, '1983', 1, 'JR', 'diesel-electric', 47, 'img_1780064029596.jpg'),
('CC201-83-53-JR', 201, '1983', 1, 'JR', 'diesel-electric', 53, 'default_lok.jpg'),
('CC201-89-07-MN', 201, '1989', 1, 'MN', 'diesel-electric', 7, 'default_lok.jpg'),
('CC201-89-12-SDT', 201, '1989', 1, 'SDT', 'diesel-electric', 12, 'img_1780064158691.jpg'),
('CC203-95-11-MN', 203, '1995', 0, 'MN', 'diesel-electric', 11, 'default_lok.jpg'),
('CC203-98-08-CPN', 203, '1998', 0, 'CPN', 'diesel-electric', 8, 'default_lok.jpg');

--
-- Dumping data untuk tabel `penumpang`
--

INSERT INTO `penumpang` (`nik`, `nama_penumpang`, `jenis_kelamin`, `tanggal_lahir`) VALUES
(3271063010020008, 'Muchammad Abdurohim', 'L', '2004-04-15'),
(3271063010020010, 'Siti Aminah', 'P', '1988-12-12'),
(3271063010020011, 'Joko Anwar', 'L', '1961-06-21'),
(3271063010020012, 'Owo Kiyowo', 'L', '1951-10-17');

--
-- Dumping data untuk tabel `petugas`
--

INSERT INTO `petugas` (`id_petugas`, `nama_petugas`) VALUES
(343647188, 'Bahlil Lahadalia'),
(343647189, 'Budi Utomo'),
(343647190, 'Agus Harimurti'),
(343647191, 'Sri Mulyani');

--
-- Dumping data untuk tabel `stasiun`
--

INSERT INTO `stasiun` (`kode_stasiun`, `nama_stasiun`, `tinggi`, `petak`, `daop`, `kota`, `foto_papan_nama_stasiun`) VALUES
('CN', 'Cirebon', '+4M', '210+150', 3, 'Cirebon', 'default_papan_nama_stasiun.jpg'),
('MSG', 'Maseng', '+278M', '12+400', 1, 'Bogor', 'default_papan_nama_stasiun.jpg'),
('NGW', 'Ngawi', '+65M', '198+200', 7, 'Ngawi', 'default_papan_nama_stasiun.jpg'),
('SLO', 'Solo Balapan', '+92M', '570+200', 6, 'Surakarta', 'default_papan_nama_stasiun.jpg'),
('SMT', 'Semarang Tawang', '+2M', '440+100', 4, 'Semarang', 'default_papan_nama_stasiun.jpg'),
('TB', 'Tambun', '+19M', '33+359', 1, 'Bekasi', 'default_papan_nama_stasiun.jpg'),
('YK', 'Yogyakarta', '+113M', '510+300', 6, 'Yogyakarta', 'default_papan_nama_stasiun.jpg');

--
-- Dumping data untuk tabel `trainset`
--

INSERT INTO `trainset` (`no_ka`, `urutan_gerbong`, `kode_gerbong`, `formasi`, `tipe_penggerak`) VALUES
('KA162', 1, 'P-0-17-01-SMC', 'Pembangkit', 'Tidak ada'),
('KA162', 2, 'K3-0-19-12-SMC', 'Eko1', 'Tidak ada'),
('KA270', 1, 'P-0-17-01-SMC', 'Pembangkit', 'Tidak ada'),
('KA270', 2, 'K3-0-19-12-SMC', 'Eko1', 'Tidak ada'),
('KA272', 1, 'P-0-17-01-SMC', 'Pembangkit', 'Tidak ada'),
('KA272', 2, 'K1-0-18-24-YK', 'Eks2', 'Tidak ada'),
('KA272', 3, 'K3-0-19-12-SMC', 'Eko1', 'Tidak ada'),
('KA272', 4, 'K1-0-24-98-YK', 'Eks3', 'Tidak ada'),
('KA272', 5, 'K1-0-24-34-YK', 'Eks4', 'Tidak ada');

--
-- Dumping data untuk tabel `transaksi`
--

INSERT INTO `transaksi` (`no_transaksi`, `nik`, `nama_pesanan`, `email`) VALUES
('ACC/20251105/1214428233583', 3271063010020010, 'Siti Aminah', 'siti@yahoo.com');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
