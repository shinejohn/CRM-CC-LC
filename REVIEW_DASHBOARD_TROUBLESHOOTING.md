# Review Dashboard Troubleshooting Guide

## Issue: Dashboard Not Displaying Information

If the Review Dashboard appears blank or doesn't show campaign data, follow these steps:

---

## 🔍 STEP 1: Check Browser Console

1. Open the Review Dashboard: `http://localhost:5173/learning/campaigns/review`
2. Open browser DevTools (F12 or Cmd+Option+I)
3. Check the **Console** tab for errors
4. Look for messages starting with "ReviewDashboard render:" - this shows the current state

**What to look for:**
- Red error messages
- "Failed to load campaigns" errors
- Network errors (404, CORS, etc.)

---

## 🔍 STEP 2: Check Network Tab

1. Open DevTools → **Network** tab
2. Refresh the page
3. Look for request to `/campaigns/landing_pages_master.json`
4. Check if it:
   - Returns 200 (success)
   - Returns 404 (file not found)
   - Fails with CORS error

**Expected:** Should see a successful request returning JSON data

---

## 🔍 STEP 3: Verify File Exists

Check that the master JSON file exists:

```bash
ls -la public/campaigns/landing_pages_master.json
```

**Expected:** File should exist and be readable

---

## 🔍 STEP 4: Check Dev Server

Ensure the dev server is running:

```bash
npm run dev
```

**Expected:** Should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🔍 STEP 5: Test Direct File Access

Try accessing the JSON file directly in browser:

```
http://localhost:5173/campaigns/landing_pages_master.json
```

**Expected:** Should see JSON data with 60 landing pages

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "No campaigns loaded" Warning

**Symptoms:**
- Page loads but shows yellow warning box
- Campaign count shows 0

**Fix:**
1. Check browser console for errors
2. Verify JSON file exists: `public/campaigns/landing_pages_master.json`
3. Check file is valid JSON (no syntax errors)
4. Restart dev server

### Issue 2: Blank Page / Nothing Renders

**Symptoms:**
- Page is completely blank
- No error messages visible

**Fix:**
1. Check browser console for JavaScript errors
2. Check if React is loading (look for React DevTools)
3. Verify route is correct: `/learning/campaigns/review`
4. Try hard refresh (Cmd+Shift+R)

### Issue 3: "Failed to load campaigns" Error

**Symptoms:**
- Red error message displayed
- Retry button shown

**Fix:**
1. Check network tab for failed request
2. Verify file path is correct
3. Check file permissions
4. Restart dev server

### Issue 4: Route Not Found (404)

**Symptoms:**
- Browser shows 404 page
- URL doesn't match route

**Fix:**
1. Verify route in `AppRouter.tsx`:
   ```tsx
   <Route path="/learning/campaigns/review" element={<ReviewDashboard />} />
   ```
2. Check import is correct
3. Restart dev server

---

## 🧪 DEBUGGING STEPS

### Add Console Logging

The component now includes debug logging. Check browser console for:

```
ReviewDashboard render: {
  loading: false,
  error: null,
  campaignsCount: 60,
  filteredCount: 60
}
```

### Test Data Loading Directly

Open browser console and run:

```javascript
fetch('/campaigns/landing_pages_master.json')
  .then(r => r.json())
  .then(data => console.log('Campaigns:', data.landing_pages.length))
  .catch(err => console.error('Error:', err));
```

**Expected:** Should log "Campaigns: 60"

---

## ✅ VERIFICATION CHECKLIST

- [ ] Dev server is running (`npm run dev`)
- [ ] Browser console shows no errors
- [ ] Network tab shows successful JSON request
- [ ] File exists: `public/campaigns/landing_pages_master.json`
- [ ] File contains valid JSON
- [ ] Route matches: `/learning/campaigns/review`
- [ ] Component imports are correct
- [ ] No TypeScript errors

---

## 🆘 STILL NOT WORKING?

If none of the above fixes work:

1. **Check Component Export:**
   ```bash
   grep "export.*ReviewDashboard" src/pages/LearningCenter/Campaign/ReviewDashboard.tsx
   ```
   Should show: `export const ReviewDashboard: React.FC`

2. **Check Route Import:**
   ```bash
   grep "ReviewDashboard" src/AppRouter.tsx
   ```
   Should show import and route

3. **Clear Browser Cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or clear browser cache completely

4. **Restart Everything:**
   ```bash
   # Stop dev server (Ctrl+C)
   # Clear node_modules cache
   rm -rf node_modules/.vite
   # Restart
   npm run dev
   ```

5. **Check for TypeScript Errors:**
   ```bash
   npm run lint
   ```

---

## 📞 GETTING HELP

If you're still stuck, provide:
1. Browser console errors (screenshot or copy)
2. Network tab errors (screenshot)
3. Terminal output from `npm run dev`
4. What you see in the browser (screenshot)

---

## 🎯 QUICK TEST

Run this in browser console to test data loading:

```javascript
// Test 1: Check if file is accessible
fetch('/campaigns/landing_pages_master.json')
  .then(r => r.json())
  .then(d => console.log('✅ File accessible, campaigns:', d.landing_pages.length))
  .catch(e => console.error('❌ File error:', e));

// Test 2: Check if API function works
// (This requires the component to be loaded)
```

---

**Remember:** The Review Dashboard should always show something - either loading state, error state, or the dashboard with campaigns. If it's completely blank, there's likely a JavaScript error preventing render.


