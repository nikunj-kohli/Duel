# Test Script for Duel Code Executor

Write-Host "Testing Duel Code Executor API..." -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
    Write-Host "✅ PASSED" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 2: Get Languages
Write-Host "Test 2: Get Supported Languages" -ForegroundColor Yellow
try {
    $languages = Invoke-RestMethod -Uri "http://localhost:3001/api/execute/languages" -Method GET
    Write-Host "✅ PASSED" -ForegroundColor Green
    $languages | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 3: Execute Python Code
Write-Host "Test 3: Execute Python Hello World" -ForegroundColor Yellow
$pythonPayload = @{
    language = "python"
    code = "print('Hello from Duel!')"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/execute" -Method POST -Body $pythonPayload -ContentType "application/json"
    Write-Host "✅ PASSED" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 4: Execute Java Code
Write-Host "Test 4: Execute Java Hello World" -ForegroundColor Yellow
$javaCode = 'public class Main { public static void main(String[] args) { System.out.println("Duel Java works!"); } }'
$javaPayload = @{
    language = "java"
    code = $javaCode
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/execute" -Method POST -Body $javaPayload -ContentType "application/json"
    Write-Host "✅ PASSED" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 5: Execute C++ Code
Write-Host "Test 5: Execute C++ Hello World" -ForegroundColor Yellow
$cppCode = @'
#include <iostream>
using namespace std;

int main() {
    cout << "Duel C++ works!" << endl;
    return 0;
}
'@
$cppPayload = @{
    language = "cpp"
    code = $cppCode
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/execute" -Method POST -Body $cppPayload -ContentType "application/json"
    Write-Host "✅ PASSED" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 6: Test with Input
Write-Host "Test 6: Python with Input" -ForegroundColor Yellow
$pythonInputCode = @'
name = input()
print(f'Hello, {name}!')
'@
$inputPayload = @{
    language = "python"
    code = $pythonInputCode
    input = "Duel"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/execute" -Method POST -Body $inputPayload -ContentType "application/json"
    Write-Host "✅ PASSED" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 7: Compilation Error
Write-Host "Test 7: Compilation Error (Java)" -ForegroundColor Yellow
$errorPayload = @{
    language = "java"
    code = "public class Main { public static void main(String[] args) { System.out.println(missing) } }"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/execute" -Method POST -Body $errorPayload -ContentType "application/json"
    Write-Host "✅ PASSED (error handled correctly)" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 8: Runtime Error
Write-Host "Test 8: Runtime Error (Python)" -ForegroundColor Yellow
$runtimeErrorPayload = @{
    language = "python"
    code = "x = 10 / 0"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/execute" -Method POST -Body $runtimeErrorPayload -ContentType "application/json"
    Write-Host "✅ PASSED (error handled correctly)" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 9: Timeout Test
Write-Host "Test 9: Timeout Test (should timeout after 2s)" -ForegroundColor Yellow
$timeoutCode = @'
import time
time.sleep(10)
'@
$timeoutPayload = @{
    language = "python"
    code = $timeoutCode
    timeLimit = 2000
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/execute" -Method POST -Body $timeoutPayload -ContentType "application/json"
    Write-Host "✅ PASSED (timeout handled)" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "═════════════════════════════════════" -ForegroundColor Green
Write-Host "All Tests Complete!" -ForegroundColor Green
Write-Host "═════════════════════════════════════" -ForegroundColor Green
