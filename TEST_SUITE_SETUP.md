# Complete Test Suite Setup

This document outlines the complete test suite for the Learning Center platform.

## Overview

The test suite includes:
- **Frontend Tests**: Vitest + React Testing Library for component and integration tests
- **Backend Tests**: PHPUnit for API and unit tests
- **Integration Tests**: End-to-end workflow tests
- **Coverage Reports**: Code coverage tracking for both frontend and backend

---

## Frontend Testing

### Setup

1. **Dependencies installed:**
   - `vitest` - Test runner
   - `@testing-library/react` - React component testing
   - `@testing-library/jest-dom` - DOM matchers
   - `@testing-library/user-event` - User interaction simulation
   - `jsdom` - DOM environment for tests

2. **Configuration:**
   - `vitest.config.ts` - Main test configuration
   - `src/test/setup.ts` - Test environment setup
   - `src/test/test-utils.tsx` - Custom render utilities

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once (CI mode)
npm run test:run
```

### Test Structure

```
src/
├── test/
│   ├── setup.ts              # Test environment setup
│   └── test-utils.tsx        # Custom render utilities
├── components/
│   ├── ComingSoon.tsx
│   └── ComingSoon.test.tsx   # Component tests
└── pages/
    └── [Page].test.tsx       # Page tests
```

### Test Coverage Goals

- **Components**: 80%+ coverage
- **Pages**: 70%+ coverage
- **Services**: 85%+ coverage
- **Utils**: 90%+ coverage

---

## Backend Testing

### Setup

PHPUnit is already configured in the backend with:
- `phpunit.xml` - PHPUnit configuration
- `tests/TestCase.php` - Base test case
- Existing tests in `tests/Feature/` and `tests/Unit/`

### Running Tests

```bash
cd backend
composer test

# Or directly
php artisan test
```

### Test Structure

```
backend/
└── tests/
    ├── TestCase.php                    # Base test case
    ├── Feature/                        # API integration tests
    │   ├── CustomerApiTest.php        # ✅ Existing
    │   ├── ConversationApiTest.php    # ✅ Existing
    │   ├── KnowledgeApiTest.php       # 📝 To create
    │   ├── SurveyApiTest.php          # 📝 To create
    │   ├── OrderApiTest.php           # 📝 To create
    │   └── ...
    └── Unit/                          # Unit tests
        ├── ExampleTest.php            # ✅ Existing
        ├── Services/                  # 📝 Service tests
        └── Models/                    # 📝 Model tests
```

---

## Test Categories

### 1. Frontend Component Tests

Tests for React components:
- ✅ ComingSoon component
- 📝 Header components
- 📝 Form components
- 📝 Navigation components
- 📝 Learning Center components

### 2. Frontend Page Tests

Tests for page components:
- 📝 Learning Center pages
- 📝 CRM pages
- 📝 Command Center pages
- 📝 Outbound pages
- 📝 AI Personalities pages

### 3. Frontend Service Tests

Tests for API service clients:
- 📝 Knowledge API client
- 📝 CRM API client
- 📝 Campaign API client
- 📝 Order API client
- 📝 All other service clients

### 4. Backend API Tests

Tests for Laravel API endpoints:
- ✅ Customer API (existing)
- ✅ Conversation API (existing)
- 📝 Knowledge/FAQ API
- 📝 Survey API
- 📝 Order API
- 📝 Campaign API
- 📝 CRM Analytics API
- 📝 Outbound Campaign API
- 📝 AI Personalities API
- 📝 Command Center API
- 📝 All other controllers

### 5. Backend Unit Tests

Tests for services, models, and utilities:
- 📝 Service classes
- 📝 Model relationships
- 📝 Validation rules
- 📝 Helper functions

### 6. Integration Tests

End-to-end workflow tests:
- 📝 User registration → Login → Dashboard
- 📝 Create customer → Add conversation → View analytics
- 📝 Create campaign → Generate content → Publish
- 📝 Create order → Payment → Confirmation
- 📝 Search knowledge → View FAQ → Mark helpful

---

## Next Steps

1. ✅ Frontend test infrastructure setup (DONE)
2. 📝 Create comprehensive component tests
3. 📝 Create service API client tests
4. 📝 Expand backend API tests
5. 📝 Create backend unit tests
6. 📝 Set up integration tests
7. 📝 Set up CI/CD test pipeline

---

## Testing Best Practices

1. **Write tests first** when adding new features (TDD)
2. **Keep tests isolated** - each test should be independent
3. **Use descriptive test names** - `it('should do X when Y')`
4. **Mock external dependencies** - APIs, database, etc.
5. **Test user interactions** - not just component rendering
6. **Maintain test coverage** - aim for 80%+ overall
7. **Run tests before commits** - catch issues early
8. **Keep tests fast** - use mocks for slow operations

---

## Continuous Integration

Tests should run automatically on:
- Pull requests
- Commits to main branch
- Before deployments

Configure in `.github/workflows/tests.yml` (to be created).
