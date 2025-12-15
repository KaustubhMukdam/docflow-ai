# docflow-ai

A Motia project created with the **multi-language** starter template (TypeScript + Python).

## What is Motia?

Motia is an open-source, unified backend framework that eliminates runtime fragmentation by bringing **APIs, background jobs, queueing, streaming, state, workflows, AI agents, observability, scaling, and deployment** into one unified system using a single core primitive, the **Step**.

## Polyglot Architecture

This template demonstrates Motia's polyglot capabilities by combining:

- **TypeScript**: API endpoint (`hello-api.step.ts`) - handles HTTP requests
- **Python**: Event processor (`process_greeting_step.py`) - handles background processing
- **JavaScript**: Logger (`log-greeting.step.js`) - handles workflow completion

This shows how you can use the best language for each task while keeping everything in a single unified system.

## Quick Start

```bash
# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

This starts the Motia runtime and the **Workbench** - a powerful UI for developing and debugging your workflows. By default, it's available at [`http://localhost:3000`](http://localhost:3000).

```bash
# Test your first endpoint
curl http://localhost:3000/hello
```

## How It Works

1. **TypeScript API Step** receives the HTTP request at `/hello`
2. It emits a `process-greeting` event with the request data
3. **Python Event Step** picks up the event, processes it, and stores the result in state
4. Python emits a `greeting-processed` event
5. **JavaScript Event Step** logs the completed workflow

## Step Types

Every Step has a `type` that defines how it triggers:

| Type | When it runs | Use case |
|------|--------------|----------|
| **`api`** | HTTP request | REST APIs, webhooks |
| **`event`** | Event emitted | Background jobs, workflows |
| **`cron`** | Schedule | Cleanup, reports, reminders |

## Development Commands

```bash
# Start Workbench and development server
npm run dev
# or
yarn dev
# or
pnpm dev

# Start production server (without hot reload)
npm run start
# or
yarn start
# or
pnpm start

# Generate TypeScript types from Step configs
npm run generate-types
# or
yarn generate-types
# or
pnpm generate-types

# Build project for deployment
npm run build
# or
yarn build
# or
pnpm build
```

## Project Structure

```
steps/                           # Your Step definitions
├── hello/
│   ├── hello-api.step.ts       # TypeScript API endpoint
│   ├── process_greeting_step.py # Python event processor
│   └── log-greeting.step.js    # JavaScript logger
motia.config.ts                  # Motia configuration
requirements.txt                 # Python dependencies
```

Steps are auto-discovered from your `steps/` or `src/` directories - no manual registration required.

## Learn More

- [Documentation](https://motia.dev/docs) - Complete guides and API reference
- [Quick Start Guide](https://motia.dev/docs/getting-started/quick-start) - Detailed getting started tutorial
- [Core Concepts](https://motia.dev/docs/concepts/overview) - Learn about Steps and Motia architecture
- [Discord Community](https://discord.gg/motia) - Get help and connect with other developers

---

# DocFlow AI - Durable Document Processing with Motia

[![MotiaHack25](https://img.shields.io/badge/Hackathon-MotiaHack25-blue)](https://www.wemakedevs.org/hackathons/motiahack25)
[![Built with Motia](https://img.shields.io/badge/Built%20with-Motia-brightgreen)](https://motia.dev)

DocFlow AI is a production-grade backend system for processing and analyzing documents using AI-powered workflows. Built with [Motia](https://motia.dev) for the **MotiaHack25 Backend Reloaded** hackathon.

## 🌟 Features

- **Document Upload API** - Upload documents via JSON/REST API
- **Automatic Processing** - Event-driven workflow that processes documents asynchronously
- **AI-Powered Analysis** - Classification, summarization, and risk scoring using Groq AI
- **Durable Workflows** - Resilient multi-step processing with Motia's built-in state management
- **PostgreSQL Storage** - Persistent storage for document metadata and AI results
- **Real-time Observability** - Monitor workflows with Motia Workbench UI

## 🏗️ Architecture

```
Upload API (TS) → SaveDocument (Python) → Classify (Python + AI) 
                                        → Summarize (Python + AI) 
                                        → Risk Score (Python + AI) 
                                        → Conditional Routing
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Python 3.11+
- Docker (for PostgreSQL)
- Groq API Key ([Get one free](https://console.groq.com))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/KaustubhMukdam/docflow-ai.git
cd docflow-ai
```

2. **Install dependencies**

```bash
npm install
pip install -r requirements.txt
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

4. **Start PostgreSQL**

```bash
docker-compose up -d
```

5. **Create database tables**

```bash
python src/utils/database.py
```

6. **Start Motia development server**

```bash
npm run dev
```

7. **Open Workbench UI**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Upload Document

```http
POST /api/v1/documents/upload
Content-Type: application/json

{
  "filename": "loan_application.txt",
  "document_type": "loan_application",
  "content": "Document content here..."
}
```

### Get Document

```http
GET /api/v1/documents/:document_id
```

### List Documents

```http
GET /api/v1/documents?status=uploaded&limit=50
```

## 🔧 Tech Stack

- **Backend Framework**: [Motia](https://motia.dev) (TypeScript + Python)
- **AI/LLM**: Groq API (llama-3.1-70b-versatile)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy (Python)
- **Validation**: Zod (TypeScript)
- **Observability**: Motia Workbench

## 📂 Project Structure

```
docflow-ai/
├── src/
│   ├── steps/                    # Motia Steps (API + Event)
│   │   ├── upload_document_step.ts
│   │   ├── get_document_step.ts
│   │   ├── list_documents_step.py
│   │   ├── save_document_step.py
│   │   └── [AI processing steps...]
│   └── utils/
│       └── database.py           # Database schema
├── docker-compose.yml            # PostgreSQL container
├── motia.config.ts               # Motia configuration
├── requirements.txt              # Python dependencies
└── package.json                  # Node dependencies
```

## 🧪 Testing

Run test script:

```powershell
./test_upload.ps1  # Windows PowerShell
```

Or manually test endpoints:

```bash
curl -X POST http://localhost:3000/api/v1/documents/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename":"test.txt",
    "document_type":"loan_application",
    "content":"Test content"
  }'
```

## 🎯 MotiaHack25 Alignment

This project demonstrates all core Motia capabilities:

- ✅ **APIs**: REST endpoints for document management
- ✅ **Background Jobs**: Async event-driven processing
- ✅ **Workflows**: Multi-step document analysis pipeline
- ✅ **AI Agents**: Groq-powered classification, summarization, risk scoring
- ✅ **State Management**: Durable workflows with automatic state persistence
- ✅ **Observability**: Built-in tracing and logging via Workbench

## 🏆 Hackathon Judging Criteria

1. **Real-world Impact**: Solves document processing for regulated industries (fintech, legal, healthcare)
2. **Creative Motia Use**: Event-driven Steps + conditional workflows + AI integration
3. **Technical Excellence**: Type-safe APIs, database persistence, error handling
4. **Developer Experience**: Clean APIs, observability dashboard, easy deployment

## 📝 License

MIT

## 👥 Authors

- **Kaustubh Mukdam** - [GitHub](https://github.com/KaustubhMukdam)

## 🙏 Acknowledgments

- Built for [MotiaHack25](https://www.wemakedevs.org/hackathons/motiahack25) by [WeMakeDevs](https://wemakedevs.org)
- Powered by [Motia](https://motia.dev)