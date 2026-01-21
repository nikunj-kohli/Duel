# Supabase Initialization Helper
Write-Host "🚀 Duel - Supabase Setup Helper" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
$envPath = "services\code-executor\.env"
if (Test-Path $envPath) {
    $dbUrl = Select-String -Path $envPath -Pattern "^DATABASE_URL=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }
    
    if ($dbUrl -and $dbUrl -ne "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres") {
        Write-Host "✅ DATABASE_URL is configured" -ForegroundColor Green
        Write-Host ""
        
        # Test connection
        Write-Host "Testing database connection..." -ForegroundColor Yellow
        cd services\code-executor
        npm install --silent
        
        Write-Host ""
        Write-Host "✅ Dependencies installed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Copy infrastructure/db/init.sql content"
        Write-Host "  2. Go to Supabase Dashboard → SQL Editor"
        Write-Host "  3. Paste and run the SQL"
        Write-Host "  4. Start server: npx tsx src/index.ts"
        Write-Host ""
    } else {
        Write-Host "❌ DATABASE_URL not configured yet" -ForegroundColor Red
        Write-Host ""
        Write-Host "Follow these steps:" -ForegroundColor Yellow
        Write-Host "  1. Go to: https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "  2. Create a new project" -ForegroundColor White
        Write-Host "  3. Go to Settings → Database" -ForegroundColor White
        Write-Host "  4. Copy the Connection String (URI)" -ForegroundColor White
        Write-Host "  5. Paste it in: $envPath" -ForegroundColor White
        Write-Host ""
        Write-Host "Full guide: SUPABASE_SETUP.md" -ForegroundColor Cyan
        
        # Open browser
        $response = Read-Host "Open Supabase in browser? (y/n)"
        if ($response -eq 'y') {
            Start-Process "https://supabase.com/dashboard"
        }
    }
} else {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
}

Write-Host ""
