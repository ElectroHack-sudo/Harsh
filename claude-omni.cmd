@echo off
setlocal
set "ANTHROPIC_BASE_URL=http://localhost:20128"
set "ANTHROPIC_AUTH_TOKEN=sk-28cd06a63e40d0fa-1d04bb-be07bf06"
"C:\Users\hmadg\.local\bin\claude.exe" %*
endlocal
