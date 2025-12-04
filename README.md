# 🎓 Fibonacco Learning Center

**A comprehensive knowledge management and presentation platform for local businesses.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Railway](https://img.shields.io/badge/Railway-Ready-0B0D0E?logo=railway)](https://railway.app/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)

---

## 📋 TABLE OF CONTENTS

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🎯 OVERVIEW

The Fibonacco Learning Center is a comprehensive platform that combines:

- **Knowledge Management System** - FAQ database, articles, business profiles
- **AI-Powered Search** - Semantic vector search with pgvector
- **Dynamic Presentations** - 60 campaign landing pages with interactive presentations
- **Business Intelligence** - Survey system with 375 questions across 30 sections

### Key Statistics

- **60 Campaign Landing Pages** - Full presentation system
- **410+ FAQ Items** - Comprehensive knowledge base
- **375 Survey Questions** - 30 business profile sections
- **9 Presentation Slide Types** - Rich, interactive content
- **Vector Search** - Semantic search with 1536-dimension embeddings

---

## ✨ FEATURES

### 1. FAQ Management System
- Full CRUD operations
- Hierarchical category structure
- Industry-specific filtering
- Source tracking and validation
- Helpful/Not helpful voting
- Bulk import capabilities

### 2. Business Profile Survey
- 30 survey sections
- 375 questions
- 18 question types (text, select, scale, etc.)
- Conditional logic
- Progress tracking
- Industry-specific questions

### 3. Knowledge Articles
- Rich text article editor
- Category organization
- Industry codes assignment
- Tag management
- Usage analytics

### 4. Vector Search System
- Semantic search using pgvector
- Full-text search fallback
- Hybrid search capabilities
- Embedding status tracking
- Search playground interface

### 5. Presentation System
- JSON-driven slide rendering
- 9 slide component types
- Audio synchronization
- AI presenter panel
- Dynamic content generation
- Theme support

### 6. Campaign Landing Pages
- 60 campaign landing pages
- Dynamic route handling
- Presentation integration
- CTA button management
- UTM tracking support

---

## 🛠️ TECH STACK

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite 5.2** - Build tool
- **React Router 6.26** - Routing
- **Tailwind CSS 3.4** - Styling
- **Lucide React** - Icons

### Backend (Planned - Railway)
- **Laravel 11** - PHP framework
- **PHP 8.3** - Runtime
- **PostgreSQL** - Database (Railway)
- **Redis** - Cache/Queue (Railway)

### Infrastructure
- **Railway** - Backend hosting & database
- **Cloudflare Pages** - Frontend hosting
- **Cloudflare R2** - File storage
- **pgvector** - Vector similarity search

### External Services
- **ElevenLabs** - Text-to-speech
- **OpenRouter** - AI conversations
- **OpenAI** - Embeddings
- **Twilio** - SMS & Voice (planned)
- **AWS SES** - Email (planned)
- **Stripe** - Payments (planned)

---

## 📁 PROJECT STRUCTURE

```
fibonacco-learning-center/
├── src/
│   ├── components/          # React components (72 components)
│   │   ├── header/          # Header components
│   │   ├── LearningCenter/  # Learning Center modules
│   │   └── ...
│   ├── pages/               # Page components (26 pages)
│   │   └── LearningCenter/  # Learning Center pages
│   ├── services/            # API service modules (8 services)
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── hooks/               # Custom React hooks
├── public/
│   ├── campaigns/           # Campaign JSON files (61 files)
│   └── audio/               # Audio assets
├── infrastructure/
│   └── migrations/          # Database migrations (SQL)
├── scripts/                 # Utility scripts
├── docs/                    # Documentation
└── README.md
```

---

## 🚀 GETTING STARTED

### Prerequisites

- Node.js 20+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/fibonacco-learning-center.git
   cd fibonacco-learning-center
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

---

## 📊 DATABASE SCHEMA

### Core Tables

- `knowledge_base` - Knowledge articles and FAQs
- `faq_categories` - Hierarchical FAQ categories
- `industry_categories` - Industry categories
- `industry_subcategories` - Industry subcategories (56 expected)
- `survey_sections` - Survey sections (30 sections)
- `survey_questions` - Survey questions (375 questions)
- `presentation_templates` - Presentation templates
- `presenters` - AI presenter configurations
- `generated_presentations` - Cached presentations

### Features

- **Vector Search** - pgvector extension for semantic search
- **Full-Text Search** - PostgreSQL GIN indexes
- **JSONB Fields** - Flexible metadata storage
- **UUID Primary Keys** - Distributed system compatibility

See `infrastructure/migrations/` for complete schema.

---

## 🌐 DEPLOYMENT

### Railway (Backend)

```bash
# Set up Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to project
railway link

# Deploy
railway up
```

### Cloudflare Pages (Frontend)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist --project-name=learning-center
```

---

## 📚 DOCUMENTATION

### Key Documents

- **[COMPLETE_PROJECT_ANALYSIS.md](COMPLETE_PROJECT_ANALYSIS.md)** - Comprehensive project analysis
- **[IMPLEMENTATION_RECOMMENDATIONS.md](IMPLEMENTATION_RECOMMENDATIONS.md)** - Implementation roadmap
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - Complete project plan (Operations Platform)
- **[RAILWAY_MIGRATION_PLAN.md](RAILWAY_MIGRATION_PLAN.md)** - Railway migration guide
- **[CRM-EMAIL-COMMAND.md](CRM-EMAIL-COMMAND.md)** - Operations Platform specification

### API Documentation

API endpoints will be documented once backend is implemented.

---

## 🔧 DEVELOPMENT

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- TypeScript strict mode enabled
- ESLint configured
- Zero linter errors
- Production-ready code

---

## 📈 PROJECT STATUS

### ✅ Completed

- Frontend application (100%)
- Database schema (100%)
- Campaign landing pages (60/60)
- UI components (72 components)
- Routing (80+ routes)

### ⏳ In Progress

- Railway backend setup
- Database deployment
- API implementation

### 📋 Planned

- Backend API (Laravel)
- Authentication system
- File uploads
- Real-time features

---

## 🤝 CONTRIBUTING

This is a private project. Please contact the project maintainers for contribution guidelines.

---

## 📝 LICENSE

Private project - All rights reserved

---

## 🆘 SUPPORT

For issues or questions:
- Review documentation in `/docs`
- Check implementation recommendations
- Contact project maintainers

---

## 🔗 LINKS

- **Live Application:** (Deployment URL will be added)
- **API Documentation:** (Will be available after backend deployment)
- **Project Plan:** See `PROJECT_PLAN.md`

---

**Built with ❤️ for Fibonacco**
