<#
    assemble.ps1 — populate the heavy, gitignored folders of the AI Dev Kit.

    These folders are NEVER committed (see .gitignore); they come from their own
    sources so the kit never drifts from the real plugin/theme/repos:

        unysonplus/                              full plugin (all extensions)
        unysonplus-theme/                        parent theme
        UnysonPlus-HTML-to-Wordpress-Conversion/ capture service + AI companion
        UnysonPlus-Site-Converter-Extension/     site-converter extension

    Two modes:
      -Source local   (default on the maintainer's machine): copy the plugin +
                      parent theme from the working copies under D:\Web Dev, and
                      clone the two service repos from GitHub.
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
    [string]$WorkDevRoot = 'D:\Web Dev',
    [string]$GithubOrg   = 'https://github.com/UnysonPlus'
)

$ErrorActionPreference = 'Stop'
$Kit = $PSScriptRoot

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

# 1. Plugin (full) + parent theme
if ($Source -eq 'local') {
    Write-Host "[1/4] plugin  <- $WorkDevRoot\unysonplus"
    Sync-Dir "$WorkDevRoot\unysonplus"       "$Kit\unysonplus"
    Write-Host "[2/4] theme   <- $WorkDevRoot\unysonplus-theme"
    Sync-Dir "$WorkDevRoot\unysonplus-theme" "$Kit\unysonplus-theme"
} else {
    Write-Host "[1/4] plugin  <- latest UnysonPlus release zip"
    $api = 'https://api.github.com/repos/UnysonPlus/UnysonPlus/releases/latest'
    $rel = Invoke-RestMethod -Uri $api -Headers @{ 'User-Agent' = 'unysonplus-ai-dev-kit' }
    $asset = $rel.assets | Where-Object { $_.name -like '*.zip' } | Select-Object -First 1
    $zip = Join-Path $env:TEMP 'unysonplus-plugin.zip'
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip
    if (Test-Path "$Kit\unysonplus") { Remove-Item -Recurse -Force "$Kit\unysonplus" }
    Expand-Archive -Path $zip -DestinationPath "$Kit\_pluginzip" -Force
    # release zip extracts to a single top folder → move its contents into unysonplus/
    $inner = Get-ChildItem "$Kit\_pluginzip" -Directory | Select-Object -First 1
    Move-Item $inner.FullName "$Kit\unysonplus"
    Remove-Item -Recurse -Force "$Kit\_pluginzip"
    Write-Host "[2/4] theme   <- clone UnysonPlus-Theme"
    Clone-Or-Pull 'UnysonPlus-Theme' "$Kit\unysonplus-theme"
}

# 3. + 4. Service repos (always cloned)
Write-Host "[3/4] capture service"
Clone-Or-Pull 'UnysonPlus-HTML-to-Wordpress-Conversion' "$Kit\UnysonPlus-HTML-to-Wordpress-Conversion"
Write-Host "[4/4] site-converter extension"
Clone-Or-Pull 'UnysonPlus-Site-Converter-Extension' "$Kit\UnysonPlus-Site-Converter-Extension"

Write-Host "`nDone. The kit is assembled. See PLAYBOOK.md to build a site."
