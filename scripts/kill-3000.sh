#!/bin/bash
PID=$(netstat -ano | grep ":3000 " | awk '{print $5}' | sort -u | head -1)
if [ -z "$PID" ]; then
  echo "Port 3000 is free"
else
  cmd //c "taskkill /PID $PID /F"
fi
