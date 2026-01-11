$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$expectedPath = Join-Path $repoRoot '.bun-version'

if (-not (Test-Path $expectedPath)) {
  throw "Missing .bun-version at $expectedPath"
}

$expected = (Get-Content -Raw $expectedPath).Trim()

$bun = Get-Command bun -ErrorAction SilentlyContinue
if (-not $bun) {
  throw "bun is not installed or not on PATH. Expected Bun $expected (locked)."
}

$actual = (& bun --version).Trim()
if ($actual -ne $expected) {
  throw "Invalid Bun version. Expected $expected (locked) but got $actual."
}

Write-Host "OK: Bun version is locked to $expected"
