@echo off
if exist "%CD%\tools\nexus_coordinator.js" (
    node "%CD%\tools\nexus_coordinator.js" %*
) else if exist "D:\ZORO\tools\nexus_coordinator.js" (
    node "D:\ZORO\tools\nexus_coordinator.js" %*
) else (
    node "%~dp0tools\nexus_coordinator.js" %*
)
