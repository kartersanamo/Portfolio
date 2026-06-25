#!/bin/bash

# Script to start the contact form handler server
# This will run in the background and save messages to files

PORTFOLIO_DIR="/home/sanamo/Websites/KarterSanamo"
PYTHON_SCRIPT="$PORTFOLIO_DIR/contact_handler.py"
PID_FILE="$PORTFOLIO_DIR/contact_handler.pid"
LOG_FILE="$PORTFOLIO_DIR/contact_handler.log"

cd "$PORTFOLIO_DIR"

# When the site runs in Docker, contact handler lives in the container (nginx → :8001 inside)
if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'kartersanamo-site'; then
    if docker exec kartersanamo-site pgrep -f '/opt/contact/contact_handler.py' >/dev/null 2>&1; then
        echo "Contact handler is already running inside kartersanamo-site"
        exit 0
    fi
    echo "Starting contact form handler inside kartersanamo-site..."
    docker exec -d kartersanamo-site python3 /opt/contact/contact_handler.py
    echo "Contact form handler started in container"
    echo "Messages volume: /var/lib/contact-messages (host: $PORTFOLIO_DIR/messages if mounted)"
    exit 0
fi

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Contact handler is already running (PID: $PID)"
        exit 1
    else
        rm "$PID_FILE"
    fi
fi

# Start the server
echo "Starting contact form handler..."
nohup python3 "$PYTHON_SCRIPT" > "$LOG_FILE" 2>&1 &
PID=$!

# Save PID
echo $PID > "$PID_FILE"

echo "Contact form handler started (PID: $PID)"
echo "Messages will be saved to: $PORTFOLIO_DIR/messages/"
echo "Log file: $LOG_FILE"
echo ""
echo "To stop the server, run:"
echo "  kill $PID"
echo "  or"
echo "  ./stop-contact-server.sh"
