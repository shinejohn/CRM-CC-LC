# Fibonacco Platform Ecosystem

## Overview

The Fibonacco platform consists of multiple interconnected projects, each serving different purposes and deployed on different infrastructure.

---

## 🏗️ Project Architecture

### 1. **Learning Center** (Current Project)
- **Repository:** This repository (`Learning-Center`)
- **Deployment:** AWS (via Pulumi)
- **Purpose:** Main learning platform with campaigns, content, and customer management
- **Infrastructure:** 
  - ECS Fargate (backend)
  - RDS PostgreSQL (database)
  - ElastiCache Redis (cache)
  - S3 + CloudFront (frontend)
  - Application Load Balancer
- **Status:** ✅ Production ready with Pulumi infrastructure

### 2. **Community Platform**
- **Repository:** https://github.com/shinejohn/Community-Platform
- **Deployment:** Railway
- **Purpose:** Community features, forums, discussions, user interactions
- **Infrastructure:** Railway managed infrastructure
- **Status:** Active on Railway

### 3. **Multisite Platform**
- **Repository:** https://github.com/Fibonacco-Inc/multisite
- **Deployment:** AWS
- **Purpose:** Multi-tenant site management, white-label solutions
- **Infrastructure:** AWS (specific setup TBD)
- **Status:** Active on AWS

---

## 🔗 Integration Points

### Learning Center ↔ Community Platform
- **Integration Type:** API-based
- **Communication:** REST API or GraphQL
- **Use Cases:**
  - User authentication/authorization
  - Sharing learning achievements to community
  - Community discussions about courses/content
  - User profiles synchronization

### Learning Center ↔ Multisite Platform
- **Integration Type:** Multi-tenant management
- **Communication:** API-based tenant configuration
- **Use Cases:**
  - White-label deployments
  - Tenant-specific branding
  - Cross-platform user management
  - Shared content libraries

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Infrastructure                    │
│  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │  Learning Center │  │    Multisite Platform     │   │
│  │                  │  │                          │   │
│  │  • ECS Fargate   │  │  • [AWS Resources]       │   │
│  │  • RDS PostgreSQL│  │                          │   │
│  │  • Redis Cache   │  │                          │   │
│  │  • S3 + CF       │  │                          │   │
│  └──────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Railway Infrastructure                  │
│  ┌──────────────────────────────────────────────┐     │
│  │         Community Platform                    │     │
│  │                                                │     │
│  │  • Railway Managed Services                   │     │
│  │  • Database (Railway PostgreSQL)             │     │
│  │  • Redis (Railway Redis)                      │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Infrastructure Summary

### AWS Projects
1. **Learning Center**
   - Infrastructure: Pulumi-managed
   - Components: ECS, RDS, Redis, S3, CloudFront, ALB
   - Status: ✅ Fully configured

2. **Multisite Platform**
   - Infrastructure: AWS (details TBD)
   - Components: [To be documented]
   - Status: Active

### Railway Projects
1. **Community Platform**
   - Infrastructure: Railway-managed
   - Components: Railway services
   - Status: Active

---

## 🔐 Authentication & Authorization

### Cross-Platform Auth
- **Shared Identity:** User accounts may be shared across platforms
- **SSO:** Single Sign-On between platforms (if implemented)
- **API Keys:** Service-to-service authentication

### Current Implementation
- Learning Center: Laravel authentication
- Community Platform: [To be documented]
- Multisite: [To be documented]

---

## 📊 Data Flow

### User Journey
1. User signs up on **Learning Center** or **Community Platform**
2. Profile syncs across platforms (if integrated)
3. User accesses content on **Learning Center**
4. User participates in **Community Platform** discussions
5. User may access white-label sites via **Multisite Platform**

### Content Flow
1. Content created in **Learning Center**
2. Shared to **Community Platform** for discussions
3. Available via **Multisite Platform** for white-label deployments

---

## 🛠️ Development Workflow

### Learning Center
- **Local Development:** Laravel backend + React frontend
- **Deployment:** Pulumi → AWS
- **CI/CD:** [To be configured]

### Community Platform
- **Local Development:** [To be documented]
- **Deployment:** Railway
- **CI/CD:** Railway auto-deploy

### Multisite Platform
- **Local Development:** [To be documented]
- **Deployment:** AWS
- **CI/CD:** [To be documented]

---

## 📝 Integration Requirements

### API Endpoints Needed

#### Learning Center → Community Platform
- `POST /api/community/achievements` - Share learning achievements
- `GET /api/community/user/{id}` - Get user profile
- `POST /api/community/discussions` - Create discussion from content

#### Learning Center → Multisite Platform
- `GET /api/multisite/tenants` - List available tenants
- `POST /api/multisite/tenants/{id}/deploy` - Deploy content to tenant
- `GET /api/multisite/config` - Get tenant configuration

#### Community Platform → Learning Center
- `GET /api/learning/content/{id}` - Get content details
- `GET /api/learning/user/{id}/progress` - Get user progress

---

## 🔄 Synchronization

### User Data Sync
- **Frequency:** Real-time or batch (TBD)
- **Method:** Webhooks or scheduled jobs
- **Data:** User profiles, progress, achievements

### Content Sync
- **Frequency:** On-demand or scheduled
- **Method:** API calls or message queue
- **Data:** Courses, lessons, campaigns

---

## 📚 Documentation Links

- **Learning Center:** This repository
- **Community Platform:** https://github.com/shinejohn/Community-Platform
- **Multisite Platform:** https://github.com/Fibonacco-Inc/multisite

---

## 🎯 Next Steps

### Integration Tasks
1. [ ] Document Community Platform API endpoints
2. [ ] Document Multisite Platform API endpoints
3. [ ] Implement cross-platform authentication
4. [ ] Set up webhook handlers for real-time sync
5. [ ] Create integration tests
6. [ ] Document API contracts

### Infrastructure Tasks
1. [ ] Document Multisite Platform AWS setup
2. [ ] Set up VPN/peering between AWS accounts (if needed)
3. [ ] Configure API gateway for cross-platform access
4. [ ] Set up monitoring across all platforms

---

## 📞 Support & Contacts

- **Learning Center:** [Contact info]
- **Community Platform:** [Contact info]
- **Multisite Platform:** [Contact info]

---

**Last Updated:** January 2026  
**Status:** Documentation in progress

