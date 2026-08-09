# Test Frontend-Backend Connection

Write-Host "`n=== Frontend-Backend Connection Test ===`n" -ForegroundColor Cyan

# 1. Check if both services are running
Write-Host "1. Service Status:" -ForegroundColor Yellow
try {
    $backend = Invoke-RestMethod "http://127.0.0.1:4000/api/v1/health" -TimeoutSec 3
    Write-Host "   Backend (4000): ✅ Running ($($backend.status))" -ForegroundColor Green
} catch {
    Write-Host "   Backend (4000): ❌ Not responding" -ForegroundColor Red
    exit 1
}

try {
    $frontend = Invoke-WebRequest "http://localhost:5173" -UseBasicParsing -TimeoutSec 3
    Write-Host "   Frontend (5173): ✅ Running (Status $($frontend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   Frontend (5173): ❌ Not responding" -ForegroundColor Red
}

# 2. Test CORS - Simulate frontend calling backend
Write-Host "`n2. CORS Test:" -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "GET"
    }
    $response = Invoke-RestMethod "http://127.0.0.1:4000/api/v1/products?limit=3" -Headers $headers -TimeoutSec 5
    Write-Host "   Products API: ✅ $($response.data.Count) products fetched" -ForegroundColor Green
    Write-Host "   Sample: $($response.data[0].name)" -ForegroundColor Gray
} catch {
    Write-Host "   Products API: ❌ CORS or Network error" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# 3. Test Featured Products endpoint (used by homepage)
Write-Host "`n3. Featured Products:" -ForegroundColor Yellow
try {
    $featured = Invoke-RestMethod "http://127.0.0.1:4000/api/v1/products?isFeatured=true&limit=5" -TimeoutSec 5
    Write-Host "   ✅ Found $($featured.data.Count) featured products" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to fetch featured products" -ForegroundColor Red
}

# 4. Test Best Sellers
Write-Host "`n4. Best Sellers:" -ForegroundColor Yellow
try {
    $bestsellers = Invoke-RestMethod "http://127.0.0.1:4000/api/v1/products?isBestSeller=true&limit=5" -TimeoutSec 5
    Write-Host "   ✅ Found $($bestsellers.data.Count) bestsellers" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to fetch bestsellers" -ForegroundColor Red
}

# 5. Test New Arrivals
Write-Host "`n5. New Arrivals:" -ForegroundColor Yellow
try {
    $newArrivals = Invoke-RestMethod "http://127.0.0.1:4000/api/v1/products?isNewArrival=true&limit=5" -TimeoutSec 5
    Write-Host "   ✅ Found $($newArrivals.data.Count) new arrivals" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to fetch new arrivals" -ForegroundColor Red
}

# 6. Test Categories
Write-Host "`n6. Categories:" -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod "http://127.0.0.1:4000/api/v1/categories" -TimeoutSec 5
    Write-Host "   ✅ Found $($categories.data.Count) categories" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to fetch categories" -ForegroundColor Red
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Backend API: http://127.0.0.1:4000/api/v1" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nIf all tests passed, frontend should be able to fetch data!" -ForegroundColor Green
Write-Host "Open browser console (F12) to check for any JavaScript errors.`n" -ForegroundColor Gray
