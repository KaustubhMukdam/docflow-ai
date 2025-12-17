# 🏗️ DocFlow AI - System Architecture

> Detailed technical architecture and design decisions

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Details](#component-details)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [Event-Driven Workflow](#event-driven-workflow)
7. [AI Processing Pipeline](#ai-processing-pipeline)
8. [Conditional Routing Logic](#conditional-routing-logic)
9. [Technology Choices](#technology-choices)

---

## System Overview

DocFlow AI is built on a **multi-language, event-driven architecture** powered by Motia. The system processes documents through multiple AI stages and conditionally routes them based on risk assessment.

### **Key Architectural Principles:**

1. **Event-Driven Design** - Loose coupling between components
2. **Multi-Language** - TypeScript for APIs, Python for AI
3. **Single Responsibility** - Each step does one thing well
4. **Fail-Safe** - Human review as fallback for high risk
5. **Observable** - Built-in logging and tracing

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Upload    │  │  Document   │  │   Review    │            │
│  │  Interface  │  │    List     │  │    Queue    │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                     │
│                    REST API (HTTP)                              │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                      MOTIA RUNTIME                              │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────┐          │
│  │        TYPESCRIPT API ENDPOINTS (3)              │          │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │       │
│  │  │  Upload Text │  │  Upload File │  │  Review  │  │       │
│  │  │     (API)    │  │     (API)    │  │   (API)  │  │       │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  │       │
│  │         │                  │                │        │       │
│  │         └────────────────┴────────────────┘        │       │
│  │                           │                         │       │
│  │         emit('document.uploaded')                   │       │
│  └──────────────────────────┼────────────────────────┘        │
│                              │                                 │
│  ┌──────────────────────────▼────────────────────────┐        │
│  │         PYTHON EVENT HANDLERS (5)                 │        │
│  │  ┌─────────────────────────────────────────────┐  │        │
│  │  │  1. SaveDocument                            │  │        │
│  │  │     └─▶ Store in PostgreSQL                 │  │        │
│  │  └─────────────────────────────────────────────┘  │        │
│  │                       │                            │        │
│  │  ┌─────────────────────────────────────────────┐  │        │
│  │  │  2. ClassifyDocument                        │  │        │
│  │  │     ├─▶ Call Groq AI (Llama 3.3 70B)        │  │        │
│  │  │     ├─▶ Extract entities                    │  │        │
│  │  │     └─▶ emit('document.classified')         │  │        │
│  │  └─────────────────────────────────────────────┘  │        │
│  │                       │                            │        │
│  │  ┌─────────────────────────────────────────────┐  │        │
│  │  │  3. SummarizeDocument                       │  │        │
│  │  │     ├─▶ Call Groq AI                        │  │        │
│  │  │     ├─▶ Generate structured summary         │  │        │
│  │  │     └─▶ emit('document.summarized')         │  │        │
│  │  └─────────────────────────────────────────────┘  │        │
│  │                       │                            │        │
│  │  ┌─────────────────────────────────────────────┐  │        │
│  │  │  4. RiskScoreDocument                       │  │        │
│  │  │     ├─▶ Call Groq AI                        │  │        │
│  │  │     ├─▶ Calculate risk (0-100)              │  │        │
│  │  │     └─▶ CONDITIONAL ROUTING:                │  │        │
│  │  │         ├─ IF score < 70 → Auto-approve     │  │        │
│  │  │         └─ IF score >= 70 → Manual review   │  │        │
│  │  └─────────────────────────────────────────────┘  │        │
│  │                                                    │        │
│  └─────────────────────────────────────────────────────┘       │
│                                                                │
│  ┌─────────────────────────────────────────────────────┐       │
│  │         TYPESCRIPT API ENDPOINTS (5)                │       │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│    │
│  │  │ GetDocument  │  │ListDocuments │  │  GetPending  ││    │
│  │  │   (Query)    │  │   (Query)    │  │   Reviews    ││    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘│    │
│  │  ┌──────────────┐  ┌──────────────┐                  │    │
│  │  │  Review Doc  │  │  Delete Doc  │                  │    │
│  │  │   (Action)   │  │   (Action)   │                  │    │
│  │  └──────────────┘  └──────────────┘                  │    │
│  └─────────────────────────────────────────────────────┘     │
│                              │                                │
└─────────────────────────────┼─────────────────────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │   PostgreSQL     │
                      │    Database      │
                      │   (documents)    │
                      └──────────────────┘
```

---

## Component Details

### **1. Frontend Layer (React + TypeScript)**

**Location:** `frontend/src/`

**Components:**
- `UploadForm.tsx` - Document upload interface (text + file)
- `DocumentList.tsx` - List all documents with filters
- `DocumentDetail.tsx` - Show AI analysis + metadata
- `ReviewInterface.tsx` - HITL approval/rejection
- `StatusBadge.tsx` - Visual status indicators
- `Navbar.tsx` - Navigation and pending count

**Technologies:**
- React 19 with TypeScript
- TanStack Query v5 (data fetching + caching)
- Tailwind CSS (styling)
- Vite (build tool)

**Key Features:**
- Real-time polling (auto-refresh every 5 seconds)
- Optimistic UI updates
- Error boundaries
- Loading states

---

### **2. Backend Layer (Motia Multi-Language)**

#### **TypeScript API Endpoints** (3 steps)

**Location:** `src/steps/`

| Endpoint | Type | Purpose |
|----------|------|---------|
| `upload_document_step.ts` | API | Accept text content |
| `upload_file_step.ts` | API | Accept file upload (base64) |
| `review_document_step.ts` | API | Submit human review |

**Pattern:**
```typescript
export const config: ApiRouteConfig = {
  name: 'UploadDocument',
  type: 'api',
  path: '/api/v1/documents/upload',
  method: 'POST',
  emits: ['document.uploaded'],
  flows: ['document-processing-flow']
};

export const handler = async (req, { emit, logger }) => {
  // 1. Validate input
  // 2. Emit event
  // 3. Return response
};
```

#### **Python Event Handlers** (5 steps)

**Location:** `src/steps/`

| Step | Event | Purpose |
|------|-------|---------|
| `save_document_step.py` | `document.uploaded` | Save to database |
| `classify_document_step.py` | `document.uploaded` | Extract entities |
| `summarize_document_step.py` | `document.classified` | Generate summary |
| `risk_score_document_step.py` | `document.summarized` | Assess risk + route |
| `get_pending_reviews_step.py` | API | Get HITL queue |

**Pattern:**
```python
config = {
    'name': 'ClassifyDocument',
    'type': 'event',
    'subscribes': ['document.uploaded'],
    'emits': ['document.classified'],
    'flows': ['document-processing-flow']
}

async def handler(input_data, context):
    # 1. Get document
    # 2. Call Groq AI
    # 3. Save results
    # 4. Emit next event
```

---

### **3. Database Layer (PostgreSQL)**

**Location:** `src/utils/database.py`

**Schema:**
```python
class Document(Base):
    id: Integer (Primary Key)
    document_id: String (Unique, Indexed)
    filename: String
    document_type: Enum(LOAN_APPLICATION, LEGAL_CONTRACT, ...)
    status: Enum(UPLOADED, PROCESSING, PENDING_REVIEW, APPROVED, REJECTED)
    
    # File metadata
    file_path: String
    file_size: Integer
    file_type: String
    
    # AI results
    extracted_text: Text
    ai_summary: Text
    risk_score: Float
    classification: Text (JSON)
    
    # Review
    reviewer_id: String
    reviewer_comments: Text
    
    # Timestamps
    uploaded_at: DateTime
    processed_at: DateTime
    approved_at: DateTime
```

**Indexes:**
- `document_id` (unique)
- `status` (for queries)
- `uploaded_at` (for sorting)

---

## Data Flow

### **Scenario 1: Low-Risk Document (Auto-Approval)**

```
1. User uploads "loan_application.txt"
   └─▶ POST /api/v1/documents/upload

2. UploadDocument (TS)
   ├─▶ Validate input
   ├─▶ Generate document_id
   └─▶ emit('document.uploaded')

3. SaveDocument (Python)
   ├─▶ INSERT into documents
   └─▶ status = UPLOADED

4. ClassifyDocument (Python)
   ├─▶ Call Groq: "Extract entities"
   ├─▶ UPDATE classification
   ├─▶ status = PROCESSING
   └─▶ emit('document.classified')

5. SummarizeDocument (Python)
   ├─▶ Call Groq: "Generate summary"
   ├─▶ UPDATE ai_summary
   └─▶ emit('document.summarized')

6. RiskScoreDocument (Python)
   ├─▶ Call Groq: "Calculate risk"
   ├─▶ Risk = 25/100 (LOW)
   ├─▶ UPDATE risk_score = 25
   ├─▶ status = APPROVED ✅
   └─▶ approved_at = NOW()

7. Frontend polls GET /documents/{id}
   └─▶ Shows: ✅ APPROVED (15 seconds total)
```

---

### **Scenario 2: High-Risk Document (HITL)**

```
1-5. [Same as above]

6. RiskScoreDocument (Python)
   ├─▶ Call Groq: "Calculate risk"
   ├─▶ Risk = 85/100 (HIGH)
   ├─▶ UPDATE risk_score = 85
   ├─▶ status = PENDING_REVIEW ⏸️
   └─▶ reviewer_comments = "High risk detected: ..."

7. Document appears in Review Queue
   └─▶ GET /documents/pending-review

8. Human reviews document
   ├─▶ Reads AI summary
   ├─▶ Checks risk factors
   └─▶ Makes decision

9. Submit review
   └─▶ POST /documents/{id}/review
       {
         "decision": "approve",
         "reviewer_name": "John Doe",
         "comments": "Verified identity"
       }

10. ReviewDocument (Python)
    ├─▶ UPDATE status = APPROVED ✅
    ├─▶ UPDATE reviewer_id
    ├─▶ UPDATE reviewer_comments
    └─▶ approved_at = NOW()
```

---

## Event-Driven Workflow

### **Event Chain:**

```
document.uploaded
  ├─▶ SaveDocument (parallel)
  └─▶ ClassifyDocument
      └─▶ emit('document.classified')
          └─▶ SummarizeDocument
              └─▶ emit('document.summarized')
                  └─▶ RiskScoreDocument
                      ├─▶ IF low risk → APPROVED
                      └─▶ IF high risk → PENDING_REVIEW
```

### **Benefits of Event-Driven:**

✅ **Loose Coupling** - Steps don't know about each other  
✅ **Easy Testing** - Test each step independently  
✅ **Scalability** - Add new steps without changing existing  
✅ **Resilience** - Failed steps can retry  
✅ **Observability** - Every event logged  

---

## AI Processing Pipeline

### **Groq Integration (Llama 3.3 70B)**

All AI steps follow this pattern:

```python
from groq import Groq

groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))

response = groq_client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.1,  # Low for consistency
    max_tokens=500
)

result = response.choices[0].message.content
```

### **AI Step 1: Classification**

**Purpose:** Extract key entities and metadata

**Prompt:**
```
You are a document classification AI. Analyze this loan_application:
[document content]

Extract:
- confidence (0-1)
- key_entities (names, dates, amounts)
- document_category (personal_loan, business_loan, etc.)
- requires_review (boolean)
- completeness_score (0-1)

Return ONLY valid JSON.
```

**Output:**
```json
{
  "confidence": 0.95,
  "key_entities": ["Sarah Johnson", "$25,000", "TechCorp"],
  "document_category": "personal_loan",
  "requires_review": false,
  "completeness_score": 0.9
}
```

---

### **AI Step 2: Summarization**

**Purpose:** Generate executive summary

**Prompt:**
```
Create a structured summary:
- Overview (2-3 sentences)
- Key Details (amounts, dates, parties)
- Action Items (decisions needed)
- Red Flags (concerns)

Keep under 300 words. Use bullet points.
```

**Output:**
```
Overview
Personal loan application from Sarah Johnson...

Key Details
- Amount: $25,000
- Income: $95,000/year
- Credit: 780

Action Items
- Verify employment

Red Flags
- None detected
```

---

### **AI Step 3: Risk Scoring**

**Purpose:** Calculate risk (0-100) and route

**Prompt:**
```
Assign a risk score based on:
- Completeness (0-25)
- Compliance (0-25)
- Financial Viability (0-25)
- Red Flags (0-25)

Higher score = HIGHER risk (0 = safe, 100 = dangerous)

Return JSON:
{
  "total_score": 0-100,
  "risk_level": "low|medium|high|critical",
  "factors": {...},
  "concerns": [...],
  "recommendations": [...]
}
```

**Output:**
```json
{
  "total_score": 25,
  "risk_level": "low",
  "factors": {
    "completeness": 5,
    "compliance": 5,
    "financial_viability": 8,
    "red_flags": 7
  },
  "concerns": ["Minor: Missing secondary income"],
  "recommendations": ["Verify employment before approval"]
}
```

---

## Conditional Routing Logic

### **Risk Score Thresholds:**

```python
if total_score >= 70:  # HIGH RISK
    document.status = DocumentStatus.PENDING_REVIEW
    document.reviewer_comments = f"High risk detected: {concerns}"
    # Route to human review queue
    
else:  # LOW RISK
    document.status = DocumentStatus.APPROVED
    document.approved_at = datetime.utcnow()
    # Auto-approve
```

### **Why 70 as threshold?**

Based on typical financial institution risk tolerance:
- **0-30:** Very safe (auto-approve)
- **31-69:** Acceptable risk (auto-approve with logging)
- **70-89:** High risk (manual review required)
- **90-100:** Critical risk (manual review + escalation)

### **Configurable Routing:**

Can easily change to different thresholds:
```python
# Conservative (more human reviews)
if total_score >= 50: ...

# Aggressive (fewer human reviews)
if total_score >= 85: ...
```

---

## Technology Choices

### **Why Motia?**

✅ **Multi-Language** - TypeScript for APIs, Python for AI (best of both)  
✅ **Single Runtime** - No microservices complexity  
✅ **Event-Driven** - Natural fit for sequential processing  
✅ **Observability** - Built-in logging and tracing  
✅ **Developer Experience** - Hot reload, unified config  

### **Why Groq?**

✅ **Speed** - Fastest LLM inference (tokens/sec)  
✅ **Cost** - Free tier for development  
✅ **Quality** - Llama 3.3 70B is state-of-the-art  
✅ **API** - OpenAI-compatible, easy to use  

### **Why PostgreSQL?**

✅ **ACID** - Transaction safety for financial data  
✅ **JSON** - Store classification results flexibly  
✅ **Full-text search** - Can search documents later  
✅ **Battle-tested** - Production-ready  

### **Why React + TanStack Query?**

✅ **Type Safety** - TypeScript end-to-end  
✅ **Caching** - Smart refetching and polling  
✅ **React 19** - Latest features  
✅ **Tailwind** - Rapid UI development  

---

## Scalability Considerations

### **Current Architecture (Single Instance):**
- Handles: ~100 documents/hour
- Database: 10k+ documents
- AI calls: Rate-limited by Groq free tier

### **Future Scaling (Production):**

**Horizontal Scaling:**
```
Multiple Motia instances → Load Balancer
All share same PostgreSQL + Redis
```

**Database Optimization:**
- Read replicas for queries
- Partitioning by date
- Archived documents in cold storage

**AI Optimization:**
- Batch processing for multiple documents
- Cache common classifications
- Use smaller models for pre-screening

**Queue Management:**
- Add Redis for work queue
- Priority queue for urgent documents
- Dead letter queue for failures

---

## Security Considerations

### **Current Implementation:**

✅ Input validation on all endpoints  
✅ SQL injection prevention (SQLAlchemy ORM)  
✅ File size limits (10MB max)  
✅ File type validation (.txt only currently)  

### **Production Requirements:**

- [ ] Authentication (JWT tokens)
- [ ] Authorization (role-based access)
- [ ] Encryption at rest (database)
- [ ] Encryption in transit (HTTPS)
- [ ] Audit logging (who accessed what)
- [ ] Rate limiting (prevent abuse)
- [ ] PII redaction (before AI processing)

---

## Monitoring & Observability

### **Built-in (Motia):**

✅ **Logs** - Every step logs start/end/errors  
✅ **Workbench** - Visual workflow view  
✅ **Traces** - Follow document through pipeline  

### **Metrics to Track:**

- Processing time per document
- AI API latency
- Error rate by step
- Auto-approve vs HITL ratio
- Review queue depth
- Reviewer response time

---

## Disaster Recovery

### **Database Backup:**
```bash
# Daily backups
pg_dump docflow_db > backup_$(date +%Y%m%d).sql

# Point-in-time recovery enabled
```

### **Failure Scenarios:**

| Failure | Impact | Recovery |
|---------|--------|----------|
| AI API down | Processing pauses | Queue documents, retry later |
| Database down | System down | Restore from backup (<1 hour) |
| Single step fails | That document fails | Manual retry or review |
| File storage full | Upload fails | Add storage, resume |

---

## Future Enhancements

### **Phase 2 (Nice to Have):**
- PDF/DOCX file support
- OCR for scanned documents
- Multi-document comparison
- Fraud detection ML model
- Automated compliance checking

### **Phase 3 (Advanced):**
- Real-time collaboration
- Advanced analytics dashboard
- ML model for risk (replace Groq)
- Integration with external systems
- Mobile app

---

**This architecture is designed for:**
- ✅ Rapid development
- ✅ Easy maintenance
- ✅ Clear separation of concerns
- ✅ Production readiness