# Final API Test Suite
$base = "http://127.0.0.1:4000"
$pass = 0; $fail = 0

function Test {
    param($name, $url, $method="GET", $body=$null, $headers=$null)
    Write-Host "$name..." -NoNewline
    try {
        $params = @{Uri="$base$url"; Method=$method; TimeoutSec=5}
        if ($body) { $params.Body = ($body | ConvertTo-Json); $params.ContentType = "application/json" }
        if ($headers) { $params.Headers = $headers }
        $r = Invoke-RestMethod @params
        Write-Host " ✅" -ForegroundColor Green
        $script:pass++
        return $r
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        $script:fail++
        return $null
    }
}

Write-Host "`n=== CommerceFlow API Tests ===`n" -ForegroundColor Cyan

# Core
Test "Health" "/api/v1/health"
$prods = Test "Products" "/api/v1/products?limit=3"
Test "Search" "/api/v1/products/search?query=laptop"
$cats = Test "Categories" "/api/v1/categories"

# Category products
if ($cats -and $cats.data.Count -gt 0) {
    $catId = $cats.data[0].id
    Test "Category Products" "/api/v1/categories/$catId/products?limit=3"
}

# Product details
if ($prods -and $prods.data.Count -gt 0) {
    $pid = $prods.data[0].id
    Test "Product Details" "/api/v1/products/$pid"
}

# Auth
$login = Test "Login" "/api/v1/auth/login" "POST" @{email="admin@commerceflow.dev";password="Admin@123"}

if ($login -and $login.accessToken) {
    $h = @{Authorization="Bearer $($login.accessToken)"}
    Test "Cart (auth)" "/api/v1/cart" "GET" $null $h
    Test "Orders (auth)" "/api/v1/orders" "GET" $null $h
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $pass" -ForegroundColor Green
Write-Host "Failed: $fail" -ForegroundColor Red
Write-Host ""
