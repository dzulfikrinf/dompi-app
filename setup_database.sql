-- Skema Database MVP Pencatat Keuangan (Single-User dengan Row Level Security)

-- 1. Tabel Transaksi (transactions)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS dompet text DEFAULT 'Tunai';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON public.transactions(deleted_at);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- 2. Tabel Dompet (wallets)
CREATE TABLE IF NOT EXISTS public.wallets (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) default auth.uid(),
  nama text not null,
  tipe text not null,
  saldo_awal numeric not null default 0
);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallets"
ON public.wallets FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own wallets"
ON public.wallets FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own wallets"
ON public.wallets FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own wallets"
ON public.wallets FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- 3. Tabel Pengaturan (settings)
CREATE TABLE IF NOT EXISTS public.settings (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) default auth.uid(),
  budget_bulanan numeric not null default 10500000
);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
ON public.settings FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.settings FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own settings"
ON public.settings FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own settings"
ON public.settings FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);
