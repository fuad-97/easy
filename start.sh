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

DB_URL="${DATABASE_URL:-sqlite:///./smallbiz.db}"
export DB_URL

if [[ "${DB_URL}" == sqlite:///* ]]; then
  DB_PATH="${DB_URL#sqlite:///}"
  "${PYTHON_BIN}" - <<'PY'
import os
from pathlib import Path

db_url = os.environ.get("DB_URL", "sqlite:///./smallbiz.db")
db_path = db_url.removeprefix("sqlite:///")
path = Path(db_path)
if not path.is_absolute():
    path = Path.cwd() / path
path.parent.mkdir(parents=True, exist_ok=True)
PY
fi

"${PYTHON_BIN}" -m alembic upgrade head
exec "${PYTHON_BIN}" -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
