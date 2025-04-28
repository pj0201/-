# PowerShell script to start both Next.js frontend and backend (API routes) together
# Usage: Right-click and "Run with PowerShell" or run in terminal: ./start-all.ps1

Start-Process powershell -ArgumentList '-NoExit','-Command','npm run dev' -WorkingDirectory $PSScriptRoot

# もしバックエンドが別ディレクトリや別プロセスの場合は、以下に追加でコマンドを記述
# 例: Start-Process powershell -ArgumentList '-NoExit','-Command','cd backend; npm run dev' -WorkingDirectory $PSScriptRoot

Write-Host "Frontend (Next.js) and backend (API routes) are starting in separate terminals."
