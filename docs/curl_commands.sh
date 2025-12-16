#!/bin/bash

# DocFlow AI - curl Test Commands

BASE_URL="http://localhost:3000"

echo "========================================="
echo "  DocFlow AI - API Testing with curl"
echo "========================================="
echo ""

# 1. Upload Low Risk Document
echo "1. Uploading LOW RISK document..."
LOW_RISK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/documents/upload" \
  -H "Content-Type: application/json" \
  -d @docs/payloads/upload_low_risk.json)

echo "$LOW_RISK_RESPONSE"
LOW_RISK_ID=$(echo "$LOW_RISK_RESPONSE" | grep -o '"document_id":"[^"]*' | grep -o 'doc_[^"]*')
echo "Low Risk Document ID: $LOW_RISK_ID"
echo ""

# 2. Upload High Risk Document
echo "2. Uploading HIGH RISK document..."
HIGH_RISK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/documents/upload" \
  -H "Content-Type: application/json" \
  -d @docs/payloads/upload_high_risk.json)

echo "$HIGH_RISK_RESPONSE"
HIGH_RISK_ID=$(echo "$HIGH_RISK_RESPONSE" | grep -o '"document_id":"[^"]*' | grep -o 'doc_[^"]*')
echo "High Risk Document ID: $HIGH_RISK_ID"
echo ""

# 3. Upload Legal Contract
echo "3. Uploading LEGAL CONTRACT..."
CONTRACT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/documents/upload" \
  -H "Content-Type: application/json" \
  -d @docs/payloads/upload_legal_contract.json)

echo "$CONTRACT_RESPONSE"
echo ""

# 4. Wait for processing
echo "4. Waiting 20 seconds for AI processing..."
sleep 20
echo ""

# 5. Get low risk document (should be auto-approved)
echo "5. Getting LOW RISK document status..."
curl -s "$BASE_URL/api/v1/documents/$LOW_RISK_ID"
echo ""
echo ""

# 6. Get pending reviews
echo "6. Getting PENDING REVIEWS..."
curl -s "$BASE_URL/api/v1/documents/pending-review"
echo ""
echo ""

# 7. Review high risk document
echo "7. Reviewing HIGH RISK document (ID: $HIGH_RISK_ID)..."
curl -s -X POST "$BASE_URL/api/v1/documents/$HIGH_RISK_ID/review" \
  -H "Content-Type: application/json" \
  -d @docs/payloads/review_approve.json
echo ""
echo ""

# 8. Get updated document
echo "8. Getting updated document status..."
curl -s "$BASE_URL/api/v1/documents/$HIGH_RISK_ID"
echo ""
echo ""

# 9. List all documents
echo "9. Listing all documents..."
curl -s "$BASE_URL/api/v1/documents"
echo ""
echo ""

echo "========================================="
echo "  Testing Complete!"
echo "========================================="
