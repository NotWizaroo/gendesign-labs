#!/bin/bash
# Запускает студию: один сервер на все скетчи. Остановить — Ctrl+C.
cd "$(dirname "$0")"
PORT="${1:-5500}"
(sleep 1 && open "http://localhost:$PORT/studio/") &
python3 -m http.server "$PORT"
