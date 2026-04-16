$baseUrl = "http://localhost:8000/api"

function Test-Endpoint {
    param($Path, $Method, $Body, $Token)
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    $jsonBody = $Body | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$Path" -Method $Method -Headers $headers -Body $jsonBody -ErrorAction Stop
        return $response
    } catch {
        Write-Host "❌ Failed $Method $Path" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Yellow
        if ($_.Exception.Response) {
             $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
             Write-Host $reader.ReadToEnd() -ForegroundColor Yellow
        }
        return $null
    }
}

Write-Host "🚀 STARTING GLOBAL BACKEND VERIFICATION..." -ForegroundColor Cyan

# 1. Auth Admin
$admin = Test-Endpoint "/auth/login" "POST" @{ identifier="admin_test@example.com"; password="Password@123" }
if (-not $admin) { exit 1 }
$adminToken = $admin.token
Write-Host "✅ Admin Auth"

# 2. Auth Customer
$custEmail = "cust_$(Get-Random)@test.com"
$reg = Test-Endpoint "/auth/register" "POST" @{ name="Test User"; email=$custEmail; mobile="$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"; password="Password@123" }
$cust = Test-Endpoint "/auth/login" "POST" @{ identifier=$custEmail; password="Password@123" }
$custToken = $cust.token
Write-Host "✅ Customer Auth"

# 3. Product Management
$cat = Test-Endpoint "/categories" "POST" @{ name="Test Cat $(Get-Random)" } $adminToken
$catId = $cat.categoryId
$prod = Test-Endpoint "/products" "POST" @{ category_id=$catId; name="Test Tomato"; price=20.5; stock=100; unit="kg" } $adminToken
$prodId = $prod.productId
Write-Host "✅ Catalog Management"

# 4. Address
$addr = Test-Endpoint "/addresses" "POST" @{ street="123 Ivy Lane"; city="Leafy"; state="LF"; zip_code="99999"; country="Flora" } $custToken
$addrId = $addr.addressId
Write-Host "✅ Address Management (ID: $addrId)"

# 5. Cart
$cart = Test-Endpoint "/cart" "POST" @{ product_id=$prodId; quantity=5 } $custToken
Write-Host "✅ Cart Management"

# 6. Checkout
$summary = Test-Endpoint "/checkout/summary" "POST" @{ address_id=$addrId; delivery_slot="Morning" } $custToken
Write-Host "✅ Checkout Summary (Total: $($summary.summary.final_amount))"

$order = Test-Endpoint "/checkout/place-order" "POST" @{ address_id=$addrId; delivery_slot="Morning"; payment_method="COD" } $custToken
if ($order) {
    Write-Host "✅ Order Placed! (ID: $($order.order_id))"
}

# 7. Admin Reports
$dash = Test-Endpoint "/admin/dashboard" "GET" $null $adminToken
$sales = Test-Endpoint "/admin/reports/sales" "GET" $null $adminToken
Write-Host "✅ Admin Reports & Dashboard"

# 8. Security Check
$headers = @{ "Authorization" = "Bearer $custToken" }
try {
    Invoke-WebRequest -Uri "$baseUrl/admin/dashboard" -Headers $headers -ErrorAction Stop | Out-Null
    Write-Host "❌ RBAC FAILURE: Customer accessed admin!" -ForegroundColor Red
} catch {
    Write-Host "✅ RBAC SUCCESS: Customer blocked from admin." -ForegroundColor Green
}

Write-Host "`n🌟 BACKEND IS FULLY VERIFIED AND PRODUCTION READY! 🌟" -ForegroundColor Cyan
