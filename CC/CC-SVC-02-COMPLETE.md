# CC-SVC-02: API Client Service - COMPLETE ✅

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-SVC-02 |
| Name | API Client Service |
| Phase | 2 - Core Services |
| Status | ✅ **COMPLETE** |
| Completion Date | January 20, 2026 |
| Dependencies | CC-CORE-03 (Auth Context) ✅ |

---

## Deliverables Created

### ✅ 1. API Types
**Location**: `src/command-center/services/api.types.ts`

**Types Defined**:
- `ApiResponse<T>` - Standardized API response wrapper
- `ApiError` - Error structure with code, message, details, status
- `ApiMeta` - Pagination and metadata
- `RequestConfig` - Request configuration options
- `PaginationParams` - Pagination parameters
- `RequestInterceptor`, `ResponseInterceptor`, `ErrorInterceptor` - Interceptor types

### ✅ 2. API Service Class
**Location**: `src/command-center/services/api.service.ts`

**Features**:
- ✅ GET, POST, PUT, PATCH, DELETE methods
- ✅ Query parameter encoding
- ✅ Automatic auth token injection from localStorage
- ✅ Request interceptors
- ✅ Response interceptors
- ✅ Error interceptors
- ✅ Timeout handling (default 30s, configurable)
- ✅ File upload support
- ✅ Pagination helper
- ✅ AbortController support for request cancellation
- ✅ Singleton pattern (apiService export)

**Key Methods**:
- `get<T>(path, config?)` - GET request
- `post<T>(path, data?, config?)` - POST request
- `put<T>(path, data?, config?)` - PUT request
- `patch<T>(path, data?, config?)` - PATCH request
- `delete<T>(path, config?)` - DELETE request
- `paginated<T>(path, pagination, config?)` - Paginated GET request
- `upload<T>(path, file, fieldName?, additionalData?, config?)` - File upload
- `addRequestInterceptor(interceptor)` - Add request interceptor
- `addResponseInterceptor(interceptor)` - Add response interceptor
- `addErrorInterceptor(interceptor)` - Add error interceptor
- `setTokenGetter(getter)` - Set custom token getter

### ✅ 3. useApi Hook
**Location**: `src/command-center/hooks/useApi.ts`

**Features**:
- ✅ Loading state management
- ✅ Error state management
- ✅ Data state management
- ✅ Automatic request cancellation on unmount
- ✅ Immediate execution option
- ✅ Success/error callbacks
- ✅ Reset function
- ✅ Abort function

**Hooks Provided**:
- `useApi<T>(apiCall, options?)` - Generic API hook
- `useApiGet<T>(path, config?, options?)` - GET request hook
- `useApiMutation<T, D>(method, path, options?)` - Mutation hook (POST/PUT/PATCH/DELETE)

**Return Values**:
- `data` - Response data (T | null)
- `error` - Error object (ApiError | null)
- `isLoading` - Loading state (boolean)
- `execute(...args)` - Execute the API call
- `reset()` - Reset state
- `abort()` - Abort current request

### ✅ 4. ApiErrorDisplay Component
**Location**: `src/command-center/components/errors/ApiErrorDisplay.tsx`

**Features**:
- ✅ User-friendly error messages
- ✅ Error code display
- ✅ Retry button (optional)
- ✅ Dark mode support
- ✅ Accessible design

**Error Messages**:
- Network errors
- Timeout errors
- 401 (Unauthorized)
- 403 (Forbidden)
- 404 (Not Found)
- 500 (Server Error)
- Generic errors

### ✅ 5. Tests
**Location**: `src/command-center/services/__tests__/api.service.test.ts`

**Test Coverage**:
- ✅ GET requests
- ✅ Error handling
- ✅ Request interceptors
- ✅ Auth token injection
- ✅ POST requests with data
- ✅ Query parameters
- ✅ Timeout handling
- ✅ File upload
- ✅ Paginated requests

---

## Integration with AuthContext

The API service automatically reads tokens from localStorage using the key `cc_auth_tokens` (matching AuthContext). The token getter can be customized using `setTokenGetter()` if needed.

**Token Format Expected**:
```typescript
{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
```

---

## Usage Examples

### Basic GET Request

```typescript
import { apiService } from '@/command-center';

const response = await apiService.get('/v1/customers');
if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}
```

### Using useApi Hook

```typescript
import { useApiGet } from '@/command-center';

function CustomersList() {
  const { data, error, isLoading, execute } = useApiGet('/v1/customers');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <ApiErrorDisplay error={error} onRetry={execute} />;
  
  return <div>{/* Render customers */}</div>;
}
```

### POST Request with useApiMutation

```typescript
import { useApiMutation } from '@/command-center';

function CreateCustomer() {
  const { execute, isLoading, error } = useApiMutation('post', '/v1/customers');
  
  const handleSubmit = async (data: CustomerData) => {
    const response = await execute(data);
    if (response.success) {
      console.log('Created:', response.data);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### File Upload

```typescript
import { apiService } from '@/command-center';

const file = document.querySelector('input[type="file"]').files[0];
const response = await apiService.upload('/v1/files', file, 'file', {
  description: 'Profile picture'
});
```

### Paginated Request

```typescript
import { apiService } from '@/command-center';

const response = await apiService.paginated('/v1/customers', {
  page: 1,
  perPage: 20,
  sortBy: 'name',
  sortOrder: 'asc',
});
```

### Adding Interceptors

```typescript
import { apiService } from '@/command-center';

// Request interceptor - add custom header
apiService.addRequestInterceptor((config) => ({
  ...config,
  headers: {
    ...config.headers,
    'X-Request-ID': generateRequestId(),
  },
}));

// Response interceptor - log responses
apiService.addResponseInterceptor(async (response) => {
  console.log('Response:', response.status, response.url);
  return response;
});

// Error interceptor - handle 401 globally
apiService.addErrorInterceptor(async (error) => {
  if (error.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  }
  return error;
});
```

### Custom Token Getter

```typescript
import { apiService } from '@/command-center';
import { useAuth } from '@/command-center/core/AuthContext';

// In AuthProvider or similar
apiService.setTokenGetter(() => {
  const { tokens } = useAuth();
  return tokens?.accessToken || null;
});
```

---

## Configuration

### Environment Variables

The API service uses these environment variables (in order of precedence):
1. `VITE_API_URL`
2. `VITE_API_ENDPOINT`
3. Default: `/api`

**Example `.env`**:
```env
VITE_API_URL=https://api.example.com
```

### Default Timeout

Default timeout is 30 seconds. Can be overridden per request:

```typescript
await apiService.get('/slow-endpoint', { timeout: 60000 });
```

---

## Acceptance Criteria

- [x] GET, POST, PUT, PATCH, DELETE methods work
- [x] Query params are correctly encoded
- [x] Auth token is added to requests
- [x] Request interceptors modify outgoing requests
- [x] Response interceptors process responses
- [x] Error interceptors handle errors
- [x] Timeout works correctly
- [x] File upload works
- [x] Pagination helper works
- [x] useApi hook manages loading/error states
- [x] ApiErrorDisplay shows user-friendly messages

---

## Testing

Run tests with:
```bash
npm test api.service.test.ts
```

All tests passing ✅

---

## Next Steps

This module is ready for use by:
- All Phase 3 Feature Modules (CC-FT-01 through CC-FT-07)
- Other Phase 2 Services that need API access
- Any component that needs to make API calls

---

## Handoff

**Module Complete** ✅

Other agents can now import:
```typescript
import { apiService } from '@/command-center/services/api.service';
import { useApi, useApiGet, useApiMutation } from '@/command-center/hooks';
import { ApiErrorDisplay } from '@/command-center/components/errors';
```

**Status**: Ready for integration and use by other modules.

