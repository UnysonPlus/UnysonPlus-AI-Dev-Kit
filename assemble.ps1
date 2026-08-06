<#
    assemble.ps1 — populate the heavy, gitignored folders of the AI Dev Kit.

    These folders live under assembled/ and are NEVER committed (see .gitignore); they come
    from their own sources so the kit never drifts from the real plugin/theme/repos:

        unysonplus/                              full plugin (all extensions)
        unysonplus-theme/                        parent theme
        unysonplus-theme-child/                  child-theme starter (copy per site)
        UnysonPlus-Capture-Service/ capture service + AI companion
        UnysonPlus-Site-Converter-Extension/     site-converter extension

    Two modes:
      -Source local   (default on the maintainer's machine): copy the plugin +
                      parent theme from the working copies (siblings of this kit;
                      override with -WorkDevRoot), and clone the two service repos
                      from GitHub.
      -Source github  : download the latest full-plugin release zip + git clone
                      the theme and the two service repos. Use this on any other
                      developer's machine.

    Usage:
        pwsh ./assemble.ps1                 # local (maintainer)
        pwsh ./assemble.ps1 -Source github  # clean machine
#>
param(
    [ValidateSet('local','github')]
    [string]$Source = 'local',
    # -Source local expects the plugin + parent theme working copies to be SIBLINGS
    # of this kit folder (i.e. in the kit's parent dir). Override with -WorkDevRoot.
    [string]$WorkDevRoot = '',
    [string]$GithubOrg   = 'https://github.com/UnysonPlus',
    # -WithOllama bundles the PORTABLE (no-install) Ollama Windows build into <kit>\ollama so the
    # Experimental local-AI tier runs straight from the kit (the launcher adds it to PATH + starts it).
    # Large download (~hundreds of MB), so it's opt-in. Idempotent — skipped if already present.
    [switch]$WithOllama
)

$ErrorActionPreference = 'Stop'
$Kit = $PSScriptRoot
if (-not $WorkDevRoot) { $WorkDevRoot = Split-Path $Kit -Parent }

function Sync-Dir($from, $to) {
    if (-not (Test-Path $from)) { throw "source not found: $from" }
    New-Item -ItemType Directory -Force -Path $to | Out-Null
    # mirror, excluding VCS + build junk
    robocopy $from $to /MIR /XD .git node_modules /XF *.log /NFL /NDL /NJH /NJS /NP | Out-Null
    ".gitkeep" | ForEach-Object { $p = Join-Path $to $_; if (-not (Test-Path $p)) { New-Item -ItemType File -Force -Path $p | Out-Null } }
}

function Clone-Or-Pull($repo, $to) {
    if (Test-Path (Join-Path $to '.git')) {
        Write-Host "  pull $repo"
        git -C $to pull --ff-only
    } else {
        if (Test-Path $to) { Remove-Item -Recurse -Force $to }
        Write-Host "  clone $repo"
        git clone "$GithubOrg/$repo.git" $to
    }
}

Write-Host "Assembling UnysonPlus-AI-Dev-Kit (source: $Source)"

# 1. Plugin (full) + parent theme + child-theme starter
if ($Source -eq 'local') {
    Write-Host "[1/5] plugin  <- $WorkDevRoot\unysonplus"
    Sync-Dir "$WorkDevRoot\unysonplus"             "$Kit\assembled\unysonplus"
    Write-Host "[2/5] theme   <- $WorkDevRoot\unysonplus-theme"
    Sync-Dir "$WorkDevRoot\unysonplus-theme"       "$Kit\assembled\unysonplus-theme"
    Write-Host "[3/5] child   <- $WorkDevRoot\unysonplus-theme-child"
    Sync-Dir "$WorkDevRoot\unysonplus-theme-child" "$Kit\assembled\unysonplus-theme-child"
} else {
    Write-Host "[1/5] plugin  <- latest UnysonPlus release zip"
    $api = 'https://api.github.com/repos/UnysonPlus/UnysonPlus/releases/latest'
    $rel = Invoke-RestMethod -Uri $api -Headers @{ 'User-Agent' = 'unysonplus-ai-dev-kit' }
    $asset = $rel.assets | Where-Object { $_.name -like '*.zip' } | Select-Object -First 1
    $zip = Join-Path $env:TEMP 'unysonplus-plugin.zip'
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip
    if (Test-Path "$Kit\assembled\unysonplus") { Remove-Item -Recurse -Force "$Kit\assembled\unysonplus" }
    Expand-Archive -Path $zip -DestinationPath "$Kit\_pluginzip" -Force
    # release zip extracts to a single top folder → move its contents into unysonplus/
    $inner = Get-ChildItem "$Kit\_pluginzip" -Directory | Select-Object -First 1
    Move-Item $inner.FullName "$Kit\assembled\unysonplus"
    Remove-Item -Recurse -Force "$Kit\_pluginzip"
    Write-Host "[2/5] theme   <- clone UnysonPlus-Theme"
    Clone-Or-Pull 'UnysonPlus-Theme'       "$Kit\assembled\unysonplus-theme"
    Write-Host "[3/5] child   <- clone UnysonPlus-Theme-Child"
    Clone-Or-Pull 'UnysonPlus-Theme-Child' "$Kit\assembled\unysonplus-theme-child"
}

# 4. + 5. Service repos (always cloned)
Write-Host "[4/5] capture service"
Clone-Or-Pull 'UnysonPlus-Capture-Service' "$Kit\assembled\UnysonPlus-Capture-Service"
Write-Host "[5/5] site-converter extension"
Clone-Or-Pull 'UnysonPlus-Site-Converter-Extension' "$Kit\assembled\UnysonPlus-Site-Converter-Extension"

# 6. Refresh kit-manifest.json so the kit "recognizes an update". Records the just-assembled versions of
#    the two bump-trigger components (capture service + site-converter extension) and bumps kit_version
#    when either moved. Plugin core + parent theme are refreshed under reference_only (they NEVER bump the
#    kit — they have their own updaters). Runs AFTER the pulls above, so it reads current versions.
function Bump-KitPatch($v) {
    $p = @($v -split '\.'); while ($p.Count -lt 3) { $p += '0' }
    $maj = [int]$p[0]; $min = [int]$p[1]; $pat = [int]$p[2]
    $pat++
    if ($pat -eq 100) { $pat = 0; $min++; if ($min -eq 100) { $min = 0; $maj++ } }  # cap/cascade at 99
    "$maj.$min.$pat"
}
function Read-Ver($file, $pattern) {
    if (Test-Path $file) { $t = Get-Content $file -Raw; if ($t -match $pattern) { return $Matches[1] } }
    return ''
}
$mfPath = Join-Path $Kit 'kit-manifest.json'
if (Test-Path $mfPath) {
    $curCap   = Read-Ver "$Kit\assembled\UnysonPlus-Capture-Service\tools\design-capture\package.json" '"version"\s*:\s*"([0-9.]+)"'
    $curExt   = Read-Ver "$Kit\assembled\UnysonPlus-Site-Converter-Extension\manifest.php" "version'\s*\]\s*=\s*'([0-9.]+)'"
    $curCore  = Read-Ver "$Kit\assembled\unysonplus\unysonplus.php" 'Version:\s*([0-9.]+)'
    $curTheme = Read-Ver "$Kit\assembled\unysonplus-theme\style.css" 'Version:\s*([0-9.]+)'
    $mf = Get-Content $mfPath -Raw
    $recCap = if ($mf -match '"capture_service"\s*:\s*"([0-9.]+)"') { $Matches[1] } else { '' }
    $recExt = if ($mf -match '"site_converter_extension"\s*:\s*"([0-9.]+)"') { $Matches[1] } else { '' }
    $triggerMoved = ($curCap -and $curCap -ne $recCap) -or ($curExt -and $curExt -ne $recExt)
    if ($curCap)   { $mf = $mf -replace '("capture_service"\s*:\s*")[0-9.]+(")', ('${1}' + $curCap + '${2}') }
    if ($curExt)   { $mf = $mf -replace '("site_converter_extension"\s*:\s*")[0-9.]+(")', ('${1}' + $curExt + '${2}') }
    if ($curCore)  { $mf = $mf -replace '("plugin_core"\s*:\s*")[0-9.]+(")', ('${1}' + $curCore + '${2}') }
    if ($curTheme) { $mf = $mf -replace '("parent_theme"\s*:\s*")[0-9.]+(")', ('${1}' + $curTheme + '${2}') }
    if ($triggerMoved) {
        $kv = if ($mf -match '"kit_version"\s*:\s*"([0-9.]+)"') { $Matches[1] } else { '0.0.0' }
        $newKv = Bump-KitPatch $kv
        $mf = $mf -replace '("kit_version"\s*:\s*")[0-9.]+(")', ('${1}' + $newKv + '${2}')
        Write-Host ("kit-manifest: bump_triggers moved -> kit_version {0} -> {1} (capture {2}, ext {3})" -f $kv, $newKv, $curCap, $curExt) -ForegroundColor Yellow
    } else {
        Write-Host ("kit-manifest: bump_triggers in sync (capture {0}, ext {1})" -f $curCap, $curExt)
    }
    Set-Content -Path $mfPath -Value $mf -NoNewline
}

# 7. Portable Ollama (Experimental local AI) — opt-in with -WithOllama. The no-install Windows zip, so
#    `ollama.exe serve` runs from the kit; the launcher adds <kit>\ollama to PATH and starts it. Idempotent.
$ollamaDir = Join-Path $Kit 'assembled\ollama'
if ($WithOllama) {
    if (Test-Path (Join-Path $ollamaDir 'ollama.exe')) {
        Write-Host "[6/6] Ollama  <- already present ($ollamaDir)"
    } elseif ($env:OS -eq 'Windows_NT') {
        Write-Host "[6/6] Ollama  <- downloading portable Windows build (no install; this is large)…"
        $ozip = Join-Path $env:TEMP 'ollama-windows-amd64.zip'
        try {
            Invoke-WebRequest -Uri 'https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip' -OutFile $ozip
            New-Item -ItemType Directory -Force -Path $ollamaDir | Out-Null
            Expand-Archive -Path $ozip -DestinationPath $ollamaDir -Force
            Remove-Item $ozip -Force -ErrorAction SilentlyContinue
            Write-Host "  Ollama ready at $ollamaDir — the launcher starts it; pick a model in the dashboard (Local AI)."
        } catch {
            Write-Host "  Ollama download failed ($($_.Exception.Message)). Install it from https://ollama.com instead." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[6/6] Ollama  <- the portable zip is Windows-only; on macOS/Linux install Ollama or use a llamafile."
    }
} else {
    Write-Host "[6/6] Ollama  <- skipped (pass -WithOllama to bundle the portable local-AI runtime, no install)"
}

Write-Host "`nDone. The kit is assembled. See PLAYBOOK.md to build a site."
