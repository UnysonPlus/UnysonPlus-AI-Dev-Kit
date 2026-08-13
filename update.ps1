<#
    update.ps1 — keep the UnysonPlus AI Dev Kit and its tools current.

    CHECK (report only, changes nothing):
      pwsh ./update.ps1 -Check         # "are there updates?" — how many commits behind origin

    UPDATE (three idempotent steps):
      [1/3] git pull      — latest kit content (AGENTS.md, PLAYBOOK.md, docs, harness, starter)
      [2/3] assemble.ps1  — refresh the assembled plugin / theme / converter sources
                            (assemble is update-safe: robocopy /MIR + git pull-or-clone)
      [3/3] npm install   — measure-harness deps (Playwright) + the chromium browser,
                            AND capture-service deps (needs system Google Chrome)

    Run this whenever you come back to the kit, so you build against the current
    plugin/theme and the latest playbook — not a stale snapshot.

    Usage:
      pwsh ./update.ps1                   # local sources (maintainer)
      pwsh ./update.ps1 -Source github    # any other machine (release zip + clones)
      pwsh ./update.ps1 -Check            # just check, don't change anything
      pwsh ./update.ps1 -SkipDeps         # skip the npm / Playwright step
      pwsh ./update.ps1 -SkipGitPull      # skip pulling the kit's own files
#>
param(
    [switch]$Check,
    [ValidateSet('local','github')]
    [string]$Source = 'local',
    [string]$WorkDevRoot = '',
    [switch]$SkipGitPull,
    [switch]$SkipDeps
)

$ErrorActionPreference = 'Stop'
$Kit = $PSScriptRoot

# ── CHECK MODE ─ report whether updates exist; modify nothing. ──────────────────
if ($Check) {
    if (-not (Test-Path (Join-Path $Kit '.git'))) {
        Write-Warning 'Not a git checkout — cannot check. (Download the latest kit manually.)'
        return
    }
    Write-Host 'Checking for kit updates…'
    git -C $Kit fetch --tags --quiet 2>$null
    $ver = git -C $Kit describe --tags --always 2>$null
    if (-not [string]::IsNullOrWhiteSpace($ver)) { Write-Host "  Kit version: $ver" }
    $behind = git -C $Kit rev-list --count 'HEAD..@{u}' 2>$null
    $ahead  = git -C $Kit rev-list --count '@{u}..HEAD' 2>$null
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($behind)) {
        Write-Warning 'No upstream tracking branch — cannot compare. Set one: git branch --set-upstream-to=origin/main'
    } elseif ([int]$behind -gt 0) {
        $target = git -C $Kit describe --tags '@{u}' 2>$null
        $avail = if (-not [string]::IsNullOrWhiteSpace($target)) { " → $target available" } else { '' }
        Write-Host "  $behind update(s) available on origin$avail — run: pwsh ./update.ps1" -ForegroundColor Yellow
    } else {
        Write-Host '  Kit content is up to date.' -ForegroundColor Green
        if ([int]$ahead -gt 0) { Write-Host "  (you have $ahead local commit(s) not yet pushed)" }
    }
    foreach ($d in 'unysonplus', 'unysonplus-theme') {
        if (-not (Test-Path (Join-Path $Kit "assembled\$d"))) {
            Write-Host "  'assembled/$d/' not assembled yet — run: pwsh ./assemble.ps1" -ForegroundColor Yellow
        }
    }
    return
}

# ── UPDATE MODE ────────────────────────────────────────────────────────────────

# [1/3] The kit's own tracked files.
if (-not $SkipGitPull) {
    if (Test-Path (Join-Path $Kit '.git')) {
        Write-Host '[1/3] git pull (kit content)…'
        git -C $Kit pull --ff-only
    } else {
        Write-Warning '[1/3] not a git checkout — skipping git pull (download the latest kit manually).'
    }
} else {
    Write-Host '[1/3] git pull skipped (-SkipGitPull).'
}

# [2/3] Refresh the assembled sources. assemble.ps1 is idempotent, so this is the
#       "update the tools/plugin/theme" step — a re-run pulls/mirrors the latest.
Write-Host '[2/3] assemble (refresh plugin / theme / converter sources)…'
$aArgs = @{ Source = $Source }
if ($WorkDevRoot) { $aArgs['WorkDevRoot'] = $WorkDevRoot }
& (Join-Path $Kit 'assemble.ps1') @aArgs

# [3/3] Measure-harness dependencies (Playwright + chromium).
if (-not $SkipDeps) {
    $measure = Join-Path $Kit 'tools/measure'
    if (Test-Path (Join-Path $measure 'package.json')) {
        Write-Host '[3/3] npm install (measure harness)…'
        Push-Location $measure
        try {
            npm install
            try { npx --yes playwright install chromium } catch { Write-Warning "  chromium download skipped: $($_.Exception.Message)" }
        } finally { Pop-Location }
    } else {
        Write-Host '[3/3] no tools/measure/package.json — skipping deps.'
    }

    # Capture-service dependencies (the URL converter path — Phase 1 of a conversion).
    # NOTE: playwright-core ships NO bundled browser — the capture service needs system
    # Google Chrome installed. If capture.mjs errors with a missing-browser message, install Chrome.
    $capture = Join-Path $Kit 'assembled/UnysonPlus-Capture-Service/tools/design-capture'
    if (Test-Path (Join-Path $capture 'package.json')) {
        Write-Host '[3/3] npm install (capture service)…  (requires system Google Chrome)'
        Push-Location $capture
        try { npm install } finally { Pop-Location }
    } else {
        Write-Host '[3/3] no capture-service package.json — run assemble.ps1 first.'
    }
} else {
    Write-Host '[3/3] deps skipped (-SkipDeps).'
}

Write-Host "`nDev kit updated. See PLAYBOOK.md to build a site." -ForegroundColor Green
