-- 1. Tambahkan kolom 'dompet' ke tabel transaksi yang sudah ada
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS dompet text DEFAULT 'Tunai';

-- 2. Buat tabel dompet (wallets) untuk menyimpan saldo awal tiap akun
CREATE TABLE IF NOT EXISTS wallets (
  id bigint primary key generated always as identity,
  nama text not null,
  tipe text not null,
  saldo_awal numeric not null default 0
);

-- 3. Isi data dompet awal
INSERT INTO wallets (nama, tipe, saldo_awal) VALUES 
('BCA Payroll', 'Rekening Utama', 16420000),
('GoPay', 'Dompet Digital', 1830000),
('Bibit Investasi', 'Reksa Dana', 6000000),
('Tunai', 'Uang Fisik', 600000);

-- 4. Buat tabel pengaturan (settings) untuk budget bulanan
CREATE TABLE IF NOT EXISTS settings (
  id bigint primary key generated always as identity,
  budget_bulanan numeric not null default 10500000
);

-- 5. Isi setting awal
INSERT INTO settings (budget_bulanan) VALUES (10500000);
