@echo off
echo Starting BusTravel SMS Webhook Server...
echo.
echo Server will run on: http://localhost:3001
echo Health check: http://localhost:3001/health
echo.
echo Keep this window open while testing!
echo Press Ctrl+C to stop the server
echo.
node webhook-server.js
pause