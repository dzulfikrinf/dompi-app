import os
import sys
import psycopg2

db_url = os.environ.get('SUPABASE_DB_URL')
db_password = os.environ.get('SUPABASE_DB_PASSWORD')
db_user = os.environ.get('SUPABASE_DB_USER')
db_host = os.environ.get('SUPABASE_DB_HOST', 'aws-0-ap-southeast-1.pooler.supabase.com')
db_port = int(os.environ.get('SUPABASE_DB_PORT', '6543'))
db_name = os.environ.get('SUPABASE_DB_NAME', 'postgres')

if not db_url and not db_password:
    print("Error: Kredensial database tidak ditemukan.", file=sys.stderr)
    print("Silakan set environment variable SUPABASE_DB_URL atau SUPABASE_DB_PASSWORD.", file=sys.stderr)
    sys.exit(1)

try:
    if db_url:
        conn = psycopg2.connect(db_url, sslmode='require')
    else:
        if not db_user:
            print("Error: SUPABASE_DB_USER wajib diset jika menggunakan SUPABASE_DB_PASSWORD.", file=sys.stderr)
            sys.exit(1)
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_password,
            sslmode='require'
        )
except Exception as e:
    print(f"Error saat menghubungkan ke database: {e}", file=sys.stderr)
    sys.exit(1)

conn.autocommit = True
cur = conn.cursor()

sql_statements = [
    "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS dompet text DEFAULT 'Tunai'",
    """CREATE TABLE IF NOT EXISTS wallets (
        id bigint primary key generated always as identity,
        nama text not null,
        tipe text not null,
        saldo_awal numeric not null default 0
    )""",
    """CREATE TABLE IF NOT EXISTS settings (
        id bigint primary key generated always as identity,
        budget_bulanan numeric not null default 10500000
    )"""
]

for sql in sql_statements:
    cur.execute(sql)
    print(f'OK: {sql[:60]}...')

# Check if wallets has data
cur.execute('SELECT count(*) FROM wallets')
count = cur.fetchone()[0]
if count == 0:
    cur.execute("""INSERT INTO wallets (nama, tipe, saldo_awal) VALUES 
        ('BCA Payroll', 'Rekening Utama', 16420000),
        ('GoPay', 'Dompet Digital', 1830000),
        ('Bibit Investasi', 'Reksa Dana', 6000000),
        ('Tunai', 'Uang Fisik', 600000)""")
    print('OK: Inserted 4 wallets')
else:
    print(f'Wallets already has {count} rows, skipped insert')

# Check if settings has data
cur.execute('SELECT count(*) FROM settings')
count = cur.fetchone()[0]
if count == 0:
    cur.execute('INSERT INTO settings (budget_bulanan) VALUES (10500000)')
    print('OK: Inserted default budget')
else:
    print(f'Settings already has {count} rows, skipped insert')

# Verify
cur.execute('SELECT * FROM wallets')
print('\nWallets:')
for row in cur.fetchall():
    print(f'  {row}')

cur.execute('SELECT * FROM settings')
print('\nSettings:')
for row in cur.fetchall():
    print(f'  {row}')

cur.execute("""SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position""")
print('\nTransactions columns:')
for row in cur.fetchall():
    print(f'  {row[0]}')

cur.close()
conn.close()
print('\nDone! All tables ready.')
