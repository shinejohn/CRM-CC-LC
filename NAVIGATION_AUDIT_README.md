# Navigation Audit Automation

This Playwright script automatically tests all routes and navigation in the application to verify that all buttons, links, and navigation elements properly route to existing pages/components.

## Setup

1. **Install Playwright** (if not already installed):
```bash
npm install
npx playwright install
```

## Running the Audit

### Option 1: Headless Mode (Recommended)
```bash
npm run test:navigation
```

### Option 2: Headed Mode (See the browser)
```bash
npm run test:navigation:headed
```

## What It Does

The script will:

1. **Visit all routes** defined in `AppRouter.tsx`
2. **Find all links** on each page and test them
3. **Find all buttons** on each page and click them
4. **Log all navigation attempts** to the debug log endpoint
5. **Report broken links** and navigation errors

## Output

- **Console output**: Summary of routes tested and broken links
- **Debug logs**: Detailed logs sent to `http://127.0.0.1:7242/ingest/e5cb2706-be56-4bc4-8f83-3baa066ca0c9`
- **Log file**: Written to `.cursor/debug.log` in NDJSON format
- **HTML report**: Generated in `playwright-report/` directory

## Routes Tested

The script tests ~80+ routes including:
- Main application routes (`/`, `/login`, `/signup`, etc.)
- Marketing routes (`/community-influencer`, `/sponsors`, etc.)
- Action menu routes (`/article`, `/events`, etc.)
- CRM routes (`/crm/*`)
- Learning Center routes (`/learning/*`)
- Campaign landing pages (`/learn/*`)
- And many more...

## After Running

After the script completes:

1. Check the console output for a summary
2. Review the debug logs at `.cursor/debug.log`
3. Check the HTML report: `npx playwright show-report`
4. Analyze the logs to identify:
   - Routes that don't exist
   - Components/modals that are missing
   - API endpoints that fail
   - Navigation paths that break

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, the script will try to reuse the existing server. To force a new server:
```bash
BASE_URL=http://localhost:3000 npm run test:navigation
```

### Timeout Issues
If routes are timing out, increase the timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 30000, // 30 seconds
}
```

### Missing Routes
If you see routes that don't exist, they may be:
- Dynamic routes (require parameters)
- Routes that require authentication
- Routes that are conditionally rendered

These will be logged as errors and can be reviewed in the debug logs.


