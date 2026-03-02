# Install git hooks for this repository (Windows PowerShell)
# Sets core.hooksPath to .githooks in this repo so hooks are used.

param()

Write-Host "Setting repository git hooks path to '.githooks'..."
git config core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) {
  Write-Host "Failed to set core.hooksPath. Ensure git is installed and you are in the repo root." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "Hooks path set. The pre-push hook will now run on local pushes and block pushes containing .env files." -ForegroundColor Green
