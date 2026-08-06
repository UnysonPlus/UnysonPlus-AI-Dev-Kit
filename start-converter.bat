@echo off
REM ============================================================================
REM  UnysonPlus Converter - START EVERYTHING (double-click this)
REM  First run: assembles the kit automatically (plugin/theme/services + Ollama
REM  runtime). After that it just boots the capture service + dashboard
REM  (http://localhost:4600 opens automatically) + Ollama for the Experimental
REM  local AI. Keep the window open while you convert.
REM ============================================================================
setlocal
set "SVC=%~dp0assembled\UnysonPlus-Capture-Service\tools\design-capture"

REM --- First-time setup: assemble the kit if it isn't populated yet -----------
if not exist "%SVC%\serve.mjs" (
  echo.
  echo   First-time setup: assembling the kit ^(plugin, theme, services + Ollama runtime^).
  echo   This downloads a fair bit and can take a few minutes. It only happens once.
  echo.
  call :assemble
)
if not exist "%SVC%\serve.mjs" (
  echo.
  echo   Setup did not complete. Make sure Git and Node 20+ are installed, then run this again.
  echo   ^(Or run  pwsh ./assemble.ps1  manually to see the full output.^)
  echo.
  pause
  exit /b 1
)

REM Ensure the Ollama runtime is present — fetch JUST it if missing (no full re-assemble), so an
REM already-assembled kit still gains local AI on the next launch. Everything's ready after one click.
if not exist "%~dp0assembled\ollama\ollama.exe" (
  echo.
  echo   Setting up local AI: fetching the Ollama runtime ^(one-time download; press Ctrl+C to skip^)...
  echo.
  call :ollama
)

REM Portable Ollama bundled into the kit by assemble.ps1 -> add to PATH so the service
REM finds + starts it for the Experimental local-AI tier (no system install needed).
if exist "%~dp0assembled\ollama\ollama.exe" set "PATH=%~dp0assembled\ollama;%PATH%"

cd /d "%SVC%"
call start-converter.bat
exit /b 0

REM --- assemble subroutine (PowerShell 7 if present, else Windows PowerShell) --
:assemble
where pwsh >nul 2>nul
if %errorlevel%==0 (
  pwsh -ExecutionPolicy Bypass -File "%~dp0assemble.ps1" -Source github
) else (
  powershell -ExecutionPolicy Bypass -File "%~dp0assemble.ps1" -Source github
)
exit /b

REM --- fetch ONLY the portable Ollama runtime (already-assembled kit) ----------
:ollama
where pwsh >nul 2>nul
if %errorlevel%==0 (
  pwsh -ExecutionPolicy Bypass -File "%~dp0assemble.ps1" -OllamaOnly
) else (
  powershell -ExecutionPolicy Bypass -File "%~dp0assemble.ps1" -OllamaOnly
)
exit /b
