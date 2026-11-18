#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

DB_NAME="decolae"

echo "1/5 Recriando banco de dados '$DB_NAME'..."
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
sudo -u postgres dropdb --if-exists "$DB_NAME"
sudo -u postgres createdb "$DB_NAME"

echo "2/5 Aplicando schema.sql..."
sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f schema.sql

echo "3/5 Aplicando migrations..."
for f in migrations/*.sql; do
  if [ -f "$f" ]; then
    echo "   -> $f"
    sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f "$f"
  fi
done

echo "4/5 Aplicando triggers.sql..."
sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f triggers.sql

if [ -f "views.sql" ]; then
  echo "4.5/5 Aplicando views.sql..."
  sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f views.sql
fi

echo "5/5 Populando dados iniciais (seed.sql)..."
sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f seed.sql

echo "Banco '$DB_NAME' configurado e populado com sucesso!"
