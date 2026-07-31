# CommerceFlow API Testing Script
$baseUrl = "http://127.0.0.1:4000"
$results = @()

Write-Host "`n=== CommerceFlow API Test Suite ===" -ForegroundColor Cyan
Write-Host "Testing backend at: $baseUrl`n" -ForegroundColor Gray

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $params = @{
            Uri = "$baseUrl$Url"
            Method = $Method
            TimeoutSec = 5
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host " ✅ PASS" -ForegroundColor Green
        
        $script:results += [PSCustomObject]@{
            Endpoint = $Name
            Status = "PASS"
            Method = $Method
            Url = $Url
        }
        
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host " ⚠️  HTTP $statusCode" -ForegroundColor Yellow
        } else {
            Write-Host " ❌ FAIL" -ForegroundColor Red
        }
        
        $script:results += [PSCustomObject]@{
            Endpoint = $Name
            Status = "FAIL"
            Method = $Method
            Url = $Url
            Error = $_.Exception.Message
        }
        
        return $null
    }
}

# 1. Health Check
Write-Host "`n--- Health & Status ---" -ForegroundColor Yellow
$health = Test-Endpoint "Health Check" "/api/v1/health"
if ($health) {
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
    Write-Host "  Database: $($health.checks.database.status)" -ForegroundColor Gray
    Write-Host "  Redis: $($health.checks.redis.status)" -ForegroundColor Gray
}

Test-Endpoint "Root Endpoint" "/"

# 2. Products
Write-Host "`n--- Products ---" -ForegroundColor Yellow
$products = Test-Endpoint "Get Products (paginated)" "/api/v1/products?page=1&limit=5"
if ($products) {
    Write-Host "  Returned: $($products.data.Count) products" -ForegroundColor Gray
}

Test-Endpoint "Get Products (filtered)" "/api/v1/products?minPrice=10&maxPrice=100"
Test-Endpoint "Search Products" "/api/v1/products/search?query=laptop"

# Get a product ID for detail test
if ($products -and $products.data.Count -gt 0) {
    $productId = $products.data[0].id
    Test-Endpoint "Get Product Details" "/api/v1/products/$productId"
}

# 3. Categories
Write-Host "`n--- Categories ---" -ForegroundColor Yellow
$categories = Test-Endpoint "Get All Categories" "/api/v1/categories"
if ($categories) {
    Write-Host "  Returned: $($categories.data.Count) categories" -ForegroundColor Gray
}

# Get a category ID and slug for tests
if ($categories -and $categories.data.Count -gt 0) {
    $categoryId = $categories.data[0].id
    $categorySlug = $categories.data[0].slug
    
    Test-Endpoint "Get Category by ID" "/api/v1/categories/$categoryId"
    Test-Endpoint "Get Category by Slug" "/api/v1/categories/slug/$categorySlug"
    Test-Endpoint "Get Category Products" "/api/v1/categories/$categoryId/products?page=1&limit=5"
}

# 4. Authentication
Write-Host "`n--- Authentication ---" -ForegroundColor Yellow
Test-Endpoint "Register (no body)" "/api/v1/auth/register" "POST"

$registerBody = @{
    name = "Test User $(Get-Random)"
    email = "test$(Get-Random)@example.com"
    password = "Test@123456"
}
$registerResult = Test-Endpoint "Register (valid)" "/api/v1/auth/register" "POST" $registerBody

$loginBody = @{
    email = "admin@commerceflow.dev"
    password = "Admin@123"
}
$loginResult = Test-Endpoint "Login (admin)" "/api/v1/auth/login" "POST" $loginBody

if ($loginResult -and $loginResult.accessToken) {
    Write-Host "  Access Token: Received ✓" -ForegroundColor Gray
    $token = $loginResult.accessToken
}

# 5. Cart (requires auth)
Write-Host "`n--- Cart (Auth Required) ---" -ForegroundColor Yellow
Test-Endpoint "Get Cart (no auth)" "/api/v1/cart"

# 6. Orders (requires auth)
Write-Host "`n--- Orders (Auth Required) ---" -ForegroundColor Yellow
Test-Endpoint "Get Orders (no auth)" "/api/v1/orders"

# 7. Admin (requires admin auth)
Write-Host "`n--- Admin Endpoints (Admin Auth Required) ---" -ForegroundColor Yellow
Test-Endpoint "Get All Users (no auth)" "/api/v1/admin/users"
Test-Endpoint "Get Dashboard Stats (no auth)" "/api/v1/admin/dashboard/stats"

# 8. Reviews
Write-Host "`n--- Reviews ---" -ForegroundColor Yellow
if ($productId) {
    Test-Endpoint "Get Product Reviews" "/api/v1/products/$productId/reviews"
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $results.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passed/$total)*100, 1))%" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

# Show failed tests
if ($failed -gt 0) {
    Write-Host "`n--- Failed Tests ---" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | Format-Table Endpoint, Method, Url -AutoSize
}

Write-Host ""
