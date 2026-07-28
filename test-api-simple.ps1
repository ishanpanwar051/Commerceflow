# Simple API Testing Script
$baseUrl = "http://127.0.0.1:4000"

Write-Host "`n=== CommerceFlow API Tests ===`n" -ForegroundColor Cyan

# Test function
function Test-API {
    param([string]$Name, [string]$Url, [string]$Method = "GET", [hashtable]$Body = $null)
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $params = @{ Uri = "$baseUrl$Url"; Method = $Method; TimeoutSec = 5 }
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host " OK" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host " FAIL: $($_.Exception.Message.Split([Environment]::NewLine)[0])" -ForegroundColor Red
        return $null
    }
}

# Run Tests
Write-Host "=== Health ===" -ForegroundColor Yellow
$health = Test-API "Health Check" "/api/v1/health"

Write-Host "`n=== Products ===" -ForegroundColor Yellow
$products = Test-API "Get Products" "/api/v1/products?page=1&limit=5"
Test-API "Search Products" "/api/v1/products/search?query=laptop"

Write-Host "`n=== Categories ===" -ForegroundColor Yellow
$categories = Test-API "Get Categories" "/api/v1/categories"

Write-Host "`n=== Auth ===" -ForegroundColor Yellow
$loginBody = @{ email = "admin@commerceflow.dev"; password = "Admin@123" }
$login = Test-API "Login Admin" "/api/v1/auth/login" "POST" $loginBody

Write-Host "`n=== Cart (no auth) ===" -ForegroundColor Yellow
Test-API "Get Cart" "/api/v1/cart"

Write-Host "`n=== Orders (no auth) ===" -ForegroundColor Yellow
Test-API "Get Orders" "/api/v1/orders"

Write-Host "`nTests Complete!`n"
