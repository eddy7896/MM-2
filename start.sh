#!/bin/sh
# Start nginx in the background
nginx -g "daemon off;" &

# Start the backend server
cd /app/backend && node index.js

# Keep the container running
tail -f /dev/null
