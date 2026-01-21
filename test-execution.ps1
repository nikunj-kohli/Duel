# Test code execution endpoint

Write-Host "`n=== Testing Python Execution ===" -ForegroundColor Cyan
$pythonBody = @{
    language = "python"
    code = "print('Hello from Docker!')"
} | ConvertTo-Json

$response = Invoke-WebRequest -Method POST -Uri "http://localhost:3002/api/execute" `
    -ContentType "application/json" -Body $pythonBody -UseBasicParsing
Write-Host $response.Content -ForegroundColor Green

Write-Host "`n=== Testing Java Execution ===" -ForegroundColor Cyan
$javaCode = @"
public class Main {
    public static void main(String[] args) {
        System.out.println("Java is running in Docker!");
    }
}
"@

$javaBody = @{
    language = "java"
    code = $javaCode
} | ConvertTo-Json

$response = Invoke-WebRequest -Method POST -Uri "http://localhost:3002/api/execute" `
    -ContentType "application/json" -Body $javaBody -UseBasicParsing
Write-Host $response.Content -ForegroundColor Green

Write-Host "`n=== Testing C++ Execution ===" -ForegroundColor Cyan
$cppCode = @"
#include <iostream>
int main() {
    std::cout << "C++ is working!" << std::endl;
    return 0;
}
"@

$cppBody = @{
    language = "cpp"
    code = $cppCode
} | ConvertTo-Json

$response = Invoke-WebRequest -Method POST -Uri "http://localhost:3002/api/execute" `
    -ContentType "application/json" -Body $cppBody -UseBasicParsing
Write-Host $response.Content -ForegroundColor Green

Write-Host "`n=== Testing JavaScript Execution ===" -ForegroundColor Cyan
$jsBody = @{
    language = "javascript"
    code = "console.log('JavaScript is running!');"
} | ConvertTo-Json

$response = Invoke-WebRequest -Method POST -Uri "http://localhost:3002/api/execute" `
    -ContentType "application/json" -Body $jsBody -UseBasicParsing
Write-Host $response.Content -ForegroundColor Green

Write-Host "`n=== All Tests Complete! ===" -ForegroundColor Cyan
