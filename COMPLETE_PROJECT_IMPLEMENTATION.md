# 🎯 Complete Project Implementation Plan

## Status: Implementing All Lambda Functions

### ✅ Completed
1. ✅ Database schema (migrations)
2. ✅ Infrastructure (CDK stacks)
3. ✅ Frontend components
4. ✅ API service definitions
5. ✅ Shared database client utility
6. ✅ Response utilities

### 🚧 In Progress
7. ⏳ Lambda function implementations

### 📋 Lambda Functions to Complete

#### 1. Knowledge/FAQ Handler ✅ (Next)
- GET /learning/knowledge - List articles with pagination
- GET /learning/knowledge/{id} - Get single article
- POST /learning/knowledge - Create article
- PUT /learning/knowledge/{id} - Update article
- DELETE /learning/knowledge/{id} - Delete article
- GET /learning/faqs - List FAQs with filters
- GET /learning/faqs/{id} - Get single FAQ
- POST /learning/faqs - Create FAQ
- PUT /learning/faqs/{id} - Update FAQ
- DELETE /learning/faqs/{id} - Delete FAQ
- POST /learning/faqs/bulk-import - Bulk import
- POST /learning/faqs/{id}/helpful - Mark helpful
- POST /learning/faqs/{id}/not-helpful - Mark not helpful
- GET /learning/categories - Get categories
- GET /learning/categories/tree - Get category tree

#### 2. Search Handler
- POST /learning/search - Semantic search with pgvector
- POST /learning/search/semantic - Vector similarity search

#### 3. Survey Handler
- GET /learning/survey/sections - List sections
- POST /learning/survey/sections - Create section
- PUT /learning/survey/sections/{id} - Update section
- DELETE /learning/survey/sections/{id} - Delete section
- POST /learning/survey/sections/reorder - Reorder sections
- GET /learning/survey/questions - List questions
- POST /learning/survey/questions - Create question
- PUT /learning/survey/questions/{id} - Update question
- DELETE /learning/survey/questions/{id} - Delete question
- POST /learning/survey/questions/reorder - Reorder questions
- GET /learning/survey/analytics - Get analytics

#### 4. Training Handler
- GET /learning/training/datasets - List datasets
- POST /learning/training/datasets - Create dataset
- PUT /learning/training/datasets/{id} - Update dataset
- DELETE /learning/training/datasets/{id} - Delete dataset
- POST /learning/training/datasets/{id}/train - Train dataset
- GET /learning/training/validation/queue - Get validation queue
- POST /learning/validation/{id}/approve - Approve validation
- POST /learning/validation/{id}/reject - Reject validation
- POST /learning/validation/{id}/merge - Merge validation
- GET /learning/training/agents - Get agent configs
- PUT /learning/training/agents/{id} - Update agent config

#### 5. Presentation Handler
- GET /learning/presentations - List presentations
- GET /learning/presentations/{id} - Get presentation
- POST /learning/presentations - Create presentation
- PUT /learning/presentations/{id} - Update presentation
- DELETE /learning/presentations/{id} - Delete presentation
- POST /learning/presentations/{id}/generate - Generate presentation
- GET /learning/presentations/{id}/conversation - Get conversation
- POST /learning/presentations/{id}/conversation - Add message

#### 6. AI Handler
- POST /learning/ai - Chat with AI
- POST /learning/ai/context - Get AI context
- POST /learning/ai/generate-faq - Generate FAQ from conversation
- POST /learning/ai/process-actions - Process AI actions

#### 7. TTS Worker (SQS)
- Process TTS generation requests from queue
- Call Eleven Labs API
- Upload audio to S3
- Update database with audio URL

#### 8. Embedding Worker (SQS)
- Process embedding generation requests
- Call OpenAI API for embeddings
- Store in pgvector
- Update embedding status

#### 9. TTS API Endpoints
- GET /learning/tts/voices - List Eleven Labs voices
- POST /learning/tts/generate - Request TTS generation
- GET /learning/tts/jobs/{id} - Get job status

#### 10. Embedding Status
- GET /learning/embeddings/status - Get embedding status
- POST /learning/embeddings/process - Trigger processing
- POST /learning/knowledge/{id}/embed - Generate embedding for item

---

## Implementation Order

1. **Knowledge/FAQ Handler** - Core functionality, most used
2. **Search Handler** - Critical for semantic search
3. **Survey Handler** - Business profile functionality
4. **AI Handler** - OpenRouter integration
5. **TTS Worker** - Background processing
6. **Embedding Worker** - Background processing
7. **Presentation Handler** - Presentation system
8. **Training Handler** - AI training features

---

**Starting implementation now...**


