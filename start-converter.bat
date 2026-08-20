@echo off
REM ============================================================================
REM  UnysonPlus Converter - START EVERYTHING (double-click this)
REM  First run: installs the prerequisites (Node.js + Git) automatically via
REM  winget if they're missing, then assembles the kit (plugin/theme/services +
REM  Ollama runtime). After that it just boots the capture service + dashboard
REM  (http://localhost:4600 opens automatically) + Ollama for the Experimental
REM  local AI. Keep the window open while you convert.
REM ============================================================================
setlocal
set "SVC=%~dp0assembled\UnysonPlus-Capture-Service\tools\design-capture"

REM --- Prerequisites: make sure Node.js (always) and Git (for the first assemble) are on PATH,
REM     auto-installing them via winget on a fresh machine so a new user can just double-click. ---
call :ensure_node
if errorlevel 1 exit /b 1
if not exist "%SVC%\serve.mjs" call :ensure_git

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

REM Keep EVERYTHING in the kit so deleting the kit leaves nothing behind: conversion outputs
REM (screenshots/bundles/state) AND the Ollama runtime + models all live under the kit folder.
set "CAPTURE_OUT=%~dp0capture-out"
set "OLLAMA_MODELS=%~dp0assembled\ollama\models"

REM Portable Ollama bundled into the kit by assemble.ps1 -> add to PATH so the service
REM finds + starts it for the Experimental local-AI tier (no system install needed).
if exist "%~dp0assembled\ollama\ollama.exe" set "PATH=%~dp0assembled\ollama;%PATH%"

REM --- Run log: ONE file per launch, everything the service + dashboard print lands in it. --------
REM   Kept in the kit (deleting the kit removes them). We keep only the 5 newest and delete the rest.
set "LOGDIR=%~dp0logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
for /f "skip=5 delims=" %%F in ('dir /b /o-d "%LOGDIR%\run-*.log" 2^>nul') do del "%LOGDIR%\%%F" >nul 2>nul
for /f %%T in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%T"
set "UPWK_LOG=%LOGDIR%\run-%STAMP%.log"
>  "%UPWK_LOG%" echo UnysonPlus AI Dev Kit - run log
>> "%UPWK_LOG%" echo started: %date% %time%
>> "%UPWK_LOG%" echo capture-out: %CAPTURE_OUT%
>> "%UPWK_LOG%" echo ollama-models: %OLLAMA_MODELS%
>> "%UPWK_LOG%" echo ============================================================
echo   Logging this run to: %UPWK_LOG%
echo   ^(the 5 newest run logs are kept in %LOGDIR%^)

cd /d "%SVC%"
call start-converter.bat
exit /b 0

REM --- ensure Node.js is on PATH; auto-install via winget on a fresh machine ---
:ensure_node
where node >nul 2>nul && exit /b 0
echo.
echo   Node.js was not found - attempting a one-time automatic install via winget...
where winget >nul 2>nul
if errorlevel 1 (
  echo   winget is not available on this system. Please install Node 20+ from https://nodejs.org/
  echo   then double-click start-converter.bat again.
  echo.
  pause
  exit /b 1
)
winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
REM winget updates the PERSISTENT PATH but not this already-open window; add the default install dir now.
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js was installed but isn't on this window's PATH yet. Please CLOSE this window,
  echo   reopen it, and double-click start-converter.bat again. ^(One-time step.^)
  echo.
  pause
  exit /b 1
)
echo   Node.js is ready.
exit /b 0

REM --- ensure Git is on PATH (needed only for the first assemble); auto-install via winget ------
:ensure_git
where git >nul 2>nul && exit /b 0
echo.
echo   Git was not found - attempting a one-time automatic install via winget...
where winget >nul 2>nul
if errorlevel 1 (
  echo   winget is unavailable; the assemble step needs Git. Install it from https://git-scm.com/
  echo   then run this again. ^(Continuing - assemble may fail without Git.^)
  exit /b 0
)
winget install -e --id Git.Git --accept-source-agreements --accept-package-agreements
if exist "%ProgramFiles%\Git\cmd\git.exe" set "PATH=%ProgramFiles%\Git\cmd;%PATH%"
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
