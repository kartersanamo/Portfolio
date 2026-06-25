#!/bin/sh
set -e
# Contact form API (stdlib Python); nginx proxies /api/contact here
python3 /opt/contact/contact_handler.py &
