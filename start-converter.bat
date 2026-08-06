@echo off
REM ============================================================================
REM  UnysonPlus Converter - START EVERYTHING (double-click this)
REM  Run from the AI Dev Kit root. Boots the capture service + dashboard
REM  (http://localhost:4600 opens automatically) and Ollama if installed
REM  (Experimental local AI). Keep the window open while you convert.
REM ============================================================================
setlocal
set "SVC=%~dp0assembled\UnysonPlus-Capture-Service\tools\design-capture"

if not exist "%SVC%\serve.mjs" (
  echo.
  echo   The capture service isn't assembled into the kit yet.
  echo   From PowerShell in this folder, run once:   pwsh ./assemble.ps1
  echo   ^(that pulls the capture service + extension into the kit^), then
  echo   double-click this file again.
  echo.
  pause
  exit /b 1
)

REM Portable Ollama bundled into the kit (assemble.ps1 -WithOllama) → add to PATH so the service
REM finds + starts it for the Experimental local-AI tier (no system install needed).
if exist "%~dp0assembled\ollama\ollama.exe" set "PATH=%~dp0assembled\ollama;%PATH%"

cd /d "%SVC%"
call start-converter.bat
