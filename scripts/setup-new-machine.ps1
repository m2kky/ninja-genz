# 🚀 Ninja Gen Z - Setup Script
# Run this on a new machine to configure all environment files

Write-Host "
╔══════════════════════════════════════════════════════════════════╗
║        🥷 NINJA GEN Z - NEW MACHINE SETUP                        ║
║        This script will configure all credentials                 ║
╚══════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Get the project root directory
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot) {
    $ProjectRoot = Get-Location
}

Write-Host "📁 Project Root: $ProjectRoot" -ForegroundColor Yellow
Write-Host ""

# ===== COLLECT CREDENTIALS =====
Write-Host "🔐 Please enter your credentials:" -ForegroundColor Green
Write-Host "   (Press Enter to use default/existing values)" -ForegroundColor Gray
Write-Host ""

# Supabase URL
$defaultSupabaseUrl = "https://rgbuxftjvqauqeqrqcsv.supabase.co"
$SupabaseUrl = Read-Host "Supabase URL [$defaultSupabaseUrl]"
if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) { $SupabaseUrl = $defaultSupabaseUrl }

# Supabase Anon Key
$defaultAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
Write-Host ""
Write-Host "Supabase Anon Key (press Enter for local dev key):"
$SupabaseAnonKey = Read-Host
if ([string]::IsNullOrWhiteSpace($SupabaseAnonKey)) { $SupabaseAnonKey = $defaultAnonKey }

# Supabase Access Token (for MCP)
Write-Host ""
Write-Host "🔴 Supabase Access Token (for MCP Server):" -ForegroundColor Red
$SupabaseAccessToken = Read-Host
if ([string]::IsNullOrWhiteSpace($SupabaseAccessToken)) {
    Write-Host "⚠️  No access token provided - MCP Supabase server won't work" -ForegroundColor Yellow
    $SupabaseAccessToken = "YOUR_SUPABASE_ACCESS_TOKEN"
}

# GitHub PAT
Write-Host ""
Write-Host "🔴 GitHub Personal Access Token:" -ForegroundColor Red
$GitHubPAT = Read-Host
if ([string]::IsNullOrWhiteSpace($GitHubPAT)) {
    Write-Host "⚠️  No GitHub PAT provided - GitHub MCP server won't work" -ForegroundColor Yellow
    $GitHubPAT = "YOUR_GITHUB_PAT"
}

# ===== CREATE .ENV FILES =====
Write-Host ""
Write-Host "📝 Creating environment files..." -ForegroundColor Green

# Frontend .env
$FrontendEnv = @"
VITE_SUPABASE_URL=http://127.0.0.1:58321
VITE_SUPABASE_ANON_KEY=$SupabaseAnonKey
VITE_API_URL=http://localhost:4000
VITE_ENV=development
"@

$FrontendEnvPath = Join-Path $ProjectRoot "frontend\.env"
$FrontendEnv | Out-File -FilePath $FrontendEnvPath -Encoding UTF8 -Force
Write-Host "   ✅ Created: frontend/.env" -ForegroundColor Green

# MCP Server .env
$McpServerEnv = @"
PORT=3000
NODE_ENV=development
SUPABASE_URL=$SupabaseUrl
SUPABASE_ANON_KEY=$SupabaseAnonKey
"@

$McpServerEnvPath = Join-Path $ProjectRoot "mcp-server\.env"
$McpServerEnv | Out-File -FilePath $McpServerEnvPath -Encoding UTF8 -Force
Write-Host "   ✅ Created: mcp-server/.env" -ForegroundColor Green

# ===== CREATE MCP CONFIG =====
Write-Host ""
Write-Host "📝 Creating Windsurf MCP config..." -ForegroundColor Green

# Determine Windsurf config path
$WindsurfConfigDir = "$env:USERPROFILE\.gemini\antigravity"
if (-not (Test-Path $WindsurfConfigDir)) {
    New-Item -ItemType Directory -Path $WindsurfConfigDir -Force | Out-Null
}

# Escape backslashes for JSON
$ProjectRootEscaped = $ProjectRoot -replace '\\', '\\\\'

$McpConfig = @"
{
  "mcpServers": {
    "supabase-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "$SupabaseAccessToken"
      ],
      "env": {}
    },
    "github-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GitHubPAT"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "$ProjectRootEscaped"
      ]
    },
    "ninja-genz-mcp": {
      "command": "node",
      "args": [
        "$ProjectRootEscaped\\\\mcp-server\\\\dist\\\\server.js"
      ],
      "env": {
        "PORT": "3000",
        "SUPABASE_URL": "http://127.0.0.1:58321",
        "SUPABASE_ANON_KEY": "$SupabaseAnonKey"
      }
    },
    "shadcn-ui": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"],
      "env": {}
    },
    "Playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"],
      "env": {}
    },
    "Memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {
        "MEMORY_FILE_PATH": "memory.json"
      }
    }
  }
}
"@

$McpConfigPath = Join-Path $WindsurfConfigDir "mcp_config.json"
$McpConfig | Out-File -FilePath $McpConfigPath -Encoding UTF8 -Force
Write-Host "   ✅ Created: $McpConfigPath" -ForegroundColor Green

# ===== INSTALL DEPENDENCIES =====
Write-Host ""
$InstallDeps = Read-Host "📦 Install npm dependencies? (Y/n)"
if ($InstallDeps -ne 'n' -and $InstallDeps -ne 'N') {
    Write-Host "   Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $ProjectRoot "frontend")
    npm install
    Pop-Location
    
    Write-Host "   Installing mcp-server dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $ProjectRoot "mcp-server")
    npm install
    npm run build
    Pop-Location
    
    Write-Host "   ✅ Dependencies installed!" -ForegroundColor Green
}

# ===== SUMMARY =====
Write-Host ""
Write-Host "
╔══════════════════════════════════════════════════════════════════╗
║                      ✅ SETUP COMPLETE!                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Files Created:                                                   ║
║  • frontend/.env                                                  ║
║  • mcp-server/.env                                                ║
║  • $McpConfigPath
║                                                                   ║
║  Next Steps:                                                      ║
║  1. cd frontend && npm run dev                                    ║
║  2. cd mcp-server && npm run dev (in another terminal)            ║
║  3. Open Windsurf and start coding!                               ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "🚀 Happy coding!" -ForegroundColor Cyan
