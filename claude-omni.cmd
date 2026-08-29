@echo off
setlocal
set "ANTHROPIC_BASE_URL=http://127.0.0.1:20128"
set "ANTHROPIC_API_KEY=sk-28cd06a63e40d0fa-1d04bb-be07bf06"
set "ANTHROPIC_AUTH_TOKEN="
set "ANTHROPIC_MODEL=auto/best-coding"
set "ANTHROPIC_DEFAULT_MODEL=auto/best-coding"
"C:\Users\hmadg\.local\bin\claude.exe" %*
endlocal
