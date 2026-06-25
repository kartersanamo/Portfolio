#!/bin/bash

# Script to stop the contact form handler server

PORTFOLIO_DIR="/home/sanamo/KarterSanamo"
PID_FILE="$PORTFOLIO_DIR/contact_handler.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        kill "$PID"
        rm "$PID_FILE"
        echo "Contact form handler stopped (PID: $PID)"
    else
        echo "Contact form handler is not running"
        rm "$PID_FILE"
    fi
else
    echo "PID file not found. Server may not be running."
fi

