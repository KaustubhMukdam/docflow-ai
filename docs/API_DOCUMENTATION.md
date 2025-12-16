# DocFlow AI - API Documentation

## Base URL

```
http://localhost:3000
```

## Endpoints

### 1. Upload Document

Upload a document for AI processing

**Endpoint:** `POST /api/v1/documents/upload`

**Request Body:**
```json
{
  "filename": "loan_application.txt",
  "document_type": "loan_application",
  "content": "Document content here..."
}
```

**Document Types:**
- `loan_application`
- `legal_contract`
- `grant_application`
- `insurance_claim`

**Response (201 Created):**
```json
{
  "document_id": "doc_abc123",
  "filename": "loan_application.txt",
  "status": "uploaded",
  "message": "Document uploaded successfully. Processing started."
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/v1/documents/upload \
  -H "Content-Type: application/json" \
  -d @docs/payloads/upload_low_risk.json
```

---

### 2. Get Document

Retrieve document details by ID

**Endpoint:** `GET /api/v1/documents/:document_id`

**Response (200 OK):**
```json
{
  "document_id": "doc_abc123",
  "filename": "loan_application.txt",
  "document_type": "LOAN_APPLICATION",
  "status": "APPROVED",
  "extracted_text": "Document content...",
  "ai_summary": "Professional AI-generated summary...",
  "risk_score": 20,
  "uploaded_at": "2024-12-16T12:00:00.000Z",
  "processed_at": "2024-12-16T12:00:15.000Z",
  "reviewer_comments": "Auto-approved: Low risk"
}
```

**Example (curl):**
```bash
curl http://localhost:3000/api/v1/documents/doc_abc123
```

---

### 3. List Documents

Get all documents with optional filtering

**Endpoint:** `GET /api/v1/documents?status={status}&limit={limit}`

**Query Parameters:**
- `status` (optional): `uploaded`, `approved`, `pending_review`, `rejected`
- `limit` (optional): Number of documents (default: 50)

**Response (200 OK):**
```json
{
  "documents": [...],
  "total": 10,
  "filters_applied": {"status": "approved"}
}
```

**Example (curl):**
```bash
# Get all approved documents
curl "http://localhost:3000/api/v1/documents?status=approved"

# Get all documents
curl "http://localhost:3000/api/v1/documents"
```

---

### 4. Get Pending Reviews

Get documents requiring human review

**Endpoint:** `GET /api/v1/documents/pending-review`

**Response (200 OK):**
```json
{
  "documents": [
    {
      "document_id": "doc_xyz789",
      "filename": "high_risk_loan.txt",
      "risk_score": 92,
      "ai_summary": "...",
      "uploaded_at": "2024-12-16T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Example (curl):**
```bash
curl http://localhost:3000/api/v1/documents/pending-review
```

---

### 5. Review Document (Human-in-the-Loop)

Approve or reject a document

**Endpoint:** `POST /api/v1/documents/:document_id/review`

**Request Body:**
```json
{
  "decision": "approve",
  "reviewer_name": "John Smith",
  "comments": "All criteria met. Approved."
}
```

**Decision Values:**
- `approve` - Accept the document
- `reject` - Deny the document

**Response (200 OK):**
```json
{
  "document_id": "doc_xyz789",
  "decision": "approved",
  "message": "Document approved successfully"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/v1/documents/doc_xyz789/review \
  -H "Content-Type: application/json" \
  -d '{"decision":"approve","reviewer_name":"John Smith","comments":"Approved"}'
```

---

### 6. Delete Document

Remove a document from the system

**Endpoint:** `DELETE /api/v1/documents/:document_id`

**Response (200 OK):**
```json
{
  "message": "Document deleted successfully",
  "document_id": "doc_abc123"
}
```

**Example (curl):**
```bash
curl -X DELETE http://localhost:3000/api/v1/documents/doc_abc123
```

---

## Workflow

1. **Upload Document** → Status: `UPLOADED`
2. **AI Processing** (automatic):
   - Classification
   - Summarization
   - Risk Scoring
3. **Conditional Routing**:
   - Low Risk (score < 70) → Status: `APPROVED`
   - High Risk (score ≥ 70) → Status: `PENDING_REVIEW`
4. **Human Review** (if needed) → Status: `APPROVED` or `REJECTED`

---

## Processing Time

- Upload Response: < 1 second
- Full AI Processing: ~14 seconds
- Database Queries: < 100ms