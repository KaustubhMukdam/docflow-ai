# Create sample document content
$content = "PERSONAL LOAN APPLICATION

Applicant Name: John Smith
Date of Birth: 01/15/1985
Loan Amount: 50000 USD
Purpose: Home Renovation
Annual Income: 120000 USD
Credit Score: 750

I certify that all information provided is accurate.
Signature: John Smith
Date: December 15, 2024"

Write-Host "`n=== 1. Uploading document (JSON) ===" -ForegroundColor Green

# Create JSON body
$jsonBody = @{
    filename = "sample_loan.txt"
    document_type = "loan_application"
    content = $content
} | ConvertTo-Json

# Save to temp file
$jsonBody | Out-File -FilePath temp_request.json -Encoding UTF8

# Upload
$response = curl.exe -s -X POST "http://localhost:3000/api/v1/documents/upload" `
  -H "Content-Type: application/json" `
  -d "@temp_request.json"

Write-Host "Response: $response"

if ($response -match '^\{') {
    $responseObj = $response | ConvertFrom-Json
    $responseObj | ConvertTo-Json -Depth 10
    
    if ($responseObj.document_id) {
        $docId = $responseObj.document_id
        
        # ADDED: Wait for AI processing
        Write-Host "`n⏳ Waiting 20 seconds for AI processing (Classify → Summarize → Risk Score)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 20
        
        Write-Host "`n=== 2. Getting document details (AFTER processing) ===" -ForegroundColor Cyan
        $getResponse = curl.exe -s "http://localhost:3000/api/v1/documents/$docId"
        Write-Host "Raw GET response: $getResponse"
        
        if ($getResponse -and $getResponse -match '^\{') {
            $getResponse | ConvertFrom-Json | ConvertTo-Json -Depth 10
        } else {
            Write-Host "Warning: GET request returned empty or invalid response" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=== 3. Listing all documents ===" -ForegroundColor Yellow
curl.exe -s "http://localhost:3000/api/v1/documents" | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Cleanup
Remove-Item temp_request.json -ErrorAction SilentlyContinue

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
