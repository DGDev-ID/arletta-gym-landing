# PowerShell pre-push hook for Windows environments
# Blocks pushes if any .env files are tracked or staged.

$ErrorActionPreference = 'Stop'

function Has-TrackedEnv($file) {
  try {
    git ls-files --error-unmatch $file | Out-Null
    return $true
  } catch {
    return $false
  }
}

if (Has-TrackedEnv '.env' -or Has-TrackedEnv '.env.local') {
  Write-Host "ERROR: A .env file is tracked in this repository." -ForegroundColor Red
  Write-Host "Please remove it from the index before pushing:" -ForegroundColor Yellow
  Write-Host "  git rm --cached .env .env.local" -ForegroundColor Yellow
  Write-Host "Then commit the removal and push again." -ForegroundColor Yellow
  exit 1
}

$staged = git diff --cached --name-only | Select-String -Pattern '^\.env($|\.|/)'
if ($staged) {
  Write-Host "ERROR: You are attempting to push staged .env files:" -ForegroundColor Red
  $staged.Matches | ForEach-Object { Write-Host $_.Value }
  Write-Host "Remove them from the index with: git rm --cached <file>" -ForegroundColor Yellow
  exit 1
}

exit 0
