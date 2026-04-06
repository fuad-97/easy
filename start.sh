#!/usr/bin/env bash
set -euo pipefail

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "Python is not installed in the runtime environment."
  exit 1
fi

cd backend

"${PYTHON_BIN}" -m alembic upgrade head
exec "${PYTHON_BIN}" -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
