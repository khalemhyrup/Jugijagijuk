-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 28 Bulan Mei 2026 pada 15.59
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jugijagijuk`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `gerbong`
--

CREATE TABLE `gerbong` (
  `kode_gerbong` varchar(21) NOT NULL,
  `tipe_gerbong` varchar(10) NOT NULL,
  `kelas` varchar(15) NOT NULL,
  `jumlah_kursi` int(3) NOT NULL,
  `dipo_gerbong` varchar(3) NOT NULL,
  `jumlah_penggerak` int(2) NOT NULL,
  `tahun_dinas` year(4) NOT NULL,
  `pabrikan` varchar(15) NOT NULL,
  `no_urut` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `jadwal`
--

CREATE TABLE `jadwal` (
  `no_ka` char(8) NOT NULL,
  `stasiun_keberangkatan` char(20) NOT NULL,
  `waktu_keberangkatan` time(5) NOT NULL,
  `stasiun_tujuan` char(20) NOT NULL,
  `waktu_kedatangan` time(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `jadwal_pemberhentian`
--

CREATE TABLE `jadwal_pemberhentian` (
  `no_ka` char(8) NOT NULL,
  `kode_stasiun` char(4) NOT NULL,
  `urutan_pemberhentian` int(2) NOT NULL,
  `waktu_tiba` time DEFAULT NULL,
  `waktu_berangkat` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kereta`
--

CREATE TABLE `kereta` (
  `no_ka` char(8) NOT NULL,
  `kode_lokomotif` varchar(16) NOT NULL,
  `NamaKA` varchar(50) DEFAULT NULL,
  `JenisKA` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kursi`
--

CREATE TABLE `kursi` (
  `no_kursi` char(5) NOT NULL,
  `kode_gerbong` varchar(21) NOT NULL,
  `TipeKursi` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `lokomotif`
--

CREATE TABLE `lokomotif` (
  `kode_lokomotif` varchar(16) NOT NULL,
  `model_seri` int(6) NOT NULL,
  `tahun_dinas` year(4) NOT NULL,
  `is_rebuild` tinyint(1) NOT NULL,
  `dipo_induk` char(3) NOT NULL,
  `jenis` varchar(17) NOT NULL,
  `no_urut` int(3) NOT NULL,
  `foto_lok` varchar(255) DEFAULT 'default_lok.jpg'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `penumpang`
--

CREATE TABLE `penumpang` (
  `nik` bigint(16) NOT NULL,
  `nama_penumpang` varchar(30) NOT NULL,
  `jenis_kelamin` char(2) NOT NULL,
  `tanggal_lahir` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `petugas`
--

CREATE TABLE `petugas` (
  `id_petugas` int(10) NOT NULL,
  `nama_petugas` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `stasiun`
--

CREATE TABLE `stasiun` (
  `kode_stasiun` char(4) NOT NULL,
  `nama_stasiun` varchar(30) NOT NULL,
  `tinggi` char(5) NOT NULL,
  `petak` varchar(10) NOT NULL,
  `daop` int(2) NOT NULL,
  `kota` varchar(15) NOT NULL,
  `foto_papan_nama_stasiun` varchar(255) DEFAULT 'default_papan_nama_stasiun.jpg'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tiket`
--

CREATE TABLE `tiket` (
  `no_tiket` int(10) NOT NULL,
  `no_ka` char(8) NOT NULL,
  `urutan_gerbong` int(2) NOT NULL,
  `kode_gerbong` varchar(21) NOT NULL,
  `no_kursi` char(5) NOT NULL,
  `no_transaksi` varchar(28) NOT NULL,
  `id_petugas` int(10) NOT NULL,
  `harga_tiket` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `trainset`
--

CREATE TABLE `trainset` (
  `no_ka` char(8) NOT NULL,
  `urutan_gerbong` int(2) NOT NULL,
  `kode_gerbong` varchar(21) NOT NULL,
  `formasi` varchar(60) NOT NULL,
  `tipe_penggerak` char(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaksi`
--

CREATE TABLE `transaksi` (
  `no_transaksi` varchar(28) NOT NULL,
  `nik` bigint(16) NOT NULL,
  `nama_pesanan` char(30) NOT NULL,
  `email` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `gerbong`
--
ALTER TABLE `gerbong`
  ADD PRIMARY KEY (`kode_gerbong`);

--
-- Indeks untuk tabel `jadwal`
--
ALTER TABLE `jadwal`
  ADD PRIMARY KEY (`no_ka`);

--
-- Indeks untuk tabel `jadwal_pemberhentian`
--
ALTER TABLE `jadwal_pemberhentian`
  ADD PRIMARY KEY (`no_ka`,`kode_stasiun`),
  ADD KEY `kode_stasiun` (`kode_stasiun`);

--
-- Indeks untuk tabel `kereta`
--
ALTER TABLE `kereta`
  ADD PRIMARY KEY (`no_ka`),
  ADD KEY `kode_lokomotif` (`kode_lokomotif`);

--
-- Indeks untuk tabel `kursi`
--
ALTER TABLE `kursi`
  ADD PRIMARY KEY (`no_kursi`,`kode_gerbong`),
  ADD KEY `kode_gerbong` (`kode_gerbong`);

--
-- Indeks untuk tabel `lokomotif`
--
ALTER TABLE `lokomotif`
  ADD PRIMARY KEY (`kode_lokomotif`);

--
-- Indeks untuk tabel `penumpang`
--
ALTER TABLE `penumpang`
  ADD PRIMARY KEY (`nik`);

--
-- Indeks untuk tabel `petugas`
--
ALTER TABLE `petugas`
  ADD PRIMARY KEY (`id_petugas`);

--
-- Indeks untuk tabel `stasiun`
--
ALTER TABLE `stasiun`
  ADD PRIMARY KEY (`kode_stasiun`);

--
-- Indeks untuk tabel `tiket`
--
ALTER TABLE `tiket`
  ADD PRIMARY KEY (`no_tiket`),
  ADD KEY `fk_tiket_trainset` (`no_ka`,`urutan_gerbong`,`kode_gerbong`),
  ADD KEY `fk_tiket_kursi` (`no_kursi`,`kode_gerbong`),
  ADD KEY `tiket_ibfk_1` (`no_transaksi`),
  ADD KEY `tiket_ibfk_2` (`id_petugas`);

--
-- Indeks untuk tabel `trainset`
--
ALTER TABLE `trainset`
  ADD PRIMARY KEY (`no_ka`,`urutan_gerbong`,`kode_gerbong`),
  ADD KEY `kode_gerbong` (`kode_gerbong`);

--
-- Indeks untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`no_transaksi`),
  ADD KEY `fk_transaksi_penumpang` (`nik`);

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `jadwal`
--
ALTER TABLE `kereta`
  ADD CONSTRAINT `kereta_ibfk_1` FOREIGN KEY (`kode_lokomotif`) REFERENCES `lokomotif` (`kode_lokomotif`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `jadwal`
--
ALTER TABLE `jadwal`
  ADD CONSTRAINT `jadwal_ibfk_1` FOREIGN KEY (`no_ka`) REFERENCES `kereta` (`no_ka`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jadwal_ibfk_2` FOREIGN KEY (`stasiun_keberangkatan`) REFERENCES `stasiun` (`kode_stasiun`) ON UPDATE CASCADE,
  ADD CONSTRAINT `jadwal_ibfk_3` FOREIGN KEY (`stasiun_tujuan`) REFERENCES `stasiun` (`kode_stasiun`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `kursi`
--
ALTER TABLE `kursi`
  ADD CONSTRAINT `kursi_ibfk_1` FOREIGN KEY (`kode_gerbong`) REFERENCES `gerbong` (`kode_gerbong`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `trainset`
--
ALTER TABLE `trainset`
  ADD CONSTRAINT `trainset_ibfk_1` FOREIGN KEY (`no_ka`) REFERENCES `kereta` (`no_ka`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trainset_ibfk_2` FOREIGN KEY (`kode_gerbong`) REFERENCES `gerbong` (`kode_gerbong`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaksi`
--
-- SOLUSI HAPUS PENOMPANG: Ditambahkan ON DELETE CASCADE agar riwayat transaksi ikut terhapus saat master penumpang dihapus
ALTER TABLE `transaksi`
  ADD CONSTRAINT `transaksi_ibfk_1` FOREIGN KEY (`nik`) REFERENCES `penumpang` (`nik`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tiket`
--
-- SOLUSI RELASI BERULANG & BERANTAI: Disederhanakan dan ditambahkan ON DELETE CASCADE ke transaksi
ALTER TABLE `tiket`
  ADD CONSTRAINT `tiket_ibfk_1` FOREIGN KEY (`no_transaksi`) REFERENCES `transaksi` (`no_transaksi`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tiket_ibfk_2` FOREIGN KEY (`id_petugas`) REFERENCES `petugas` (`id_petugas`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tiket_kursi` FOREIGN KEY (`no_kursi`, `kode_gerbong`) REFERENCES `kursi` (`no_kursi`, `kode_gerbong`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tiket_kereta` FOREIGN KEY (`no_ka`) REFERENCES `kereta` (`no_ka`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
