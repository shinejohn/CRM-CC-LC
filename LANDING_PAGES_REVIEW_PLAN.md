# Landing Pages Review & Correction Plan

**Date:** January 2025  
**Total Landing Pages:** 60  
**Status:** Planning Phase

---

## 🎯 OBJECTIVE

Systematically review and correct all 60 landing pages one-by-one, ensuring each page:
- Displays correctly
- Has proper content
- Functions as intended
- Meets quality standards
- Is accessible and user-friendly

---

## 📋 OVERVIEW

### Current State
- ✅ 60 landing pages defined in `landing_pages_master.json`
- ✅ 60 campaign JSON files exist in `public/campaigns/`
- ✅ Routing configured (`/learn/:slug`)
- ✅ Landing page component exists (`CampaignLandingPage.tsx`)
- ⚠️ Need to verify each page individually

### Landing Page Breakdown
- **Hook Campaigns:** 15 pages (HOOK-001 to HOOK-015)
- **Educational Campaigns:** 15 pages (EDU-001 to EDU-015)
- **How-To Campaigns:** 30 pages (HOWTO-001 to HOWTO-030)

---

## 🚀 SETUP PHASE

### Step 1: Local Development Environment

#### 1.1 Verify Prerequisites
```bash
# Check Node.js version (need 20+)
node --version

# Check npm
npm --version

# Verify project dependencies
cd /Users/johnshine/Dropbox/Fibonacco/Learning-Center
npm install
```

#### 1.2 Start Development Server
```bash
npm run dev
```

**Expected Output:**
- Server starts on `http://localhost:5173`
- No errors in console
- Application loads successfully

#### 1.3 Verify Basic Functionality
- Navigate to home page
- Check that routing works
- Test one landing page manually: `/learn/claim-your-listing`

---

### Step 2: Create Landing Page Review Dashboard

**Purpose:** Create a centralized page to view all landing pages with quick navigation

**Location:** `src/pages/LearningCenter/Campaign/ReviewDashboard.tsx`

**Features:**
- List all 60 landing pages
- Group by campaign type (Hook, Educational, How-To)
- Quick links to each page
- Status indicators (Reviewed, Needs Fix, Complete)
- Search/filter functionality
- Notes field for each page

**Benefits:**
- See all pages in one place
- Track review progress
- Quick navigation between pages
- Document issues and fixes

---

### Step 3: Create Review Checklist Component

**Purpose:** Standardized checklist for reviewing each page

**Checklist Items:**
- [ ] Page loads without errors
- [ ] Presentation displays correctly
- [ ] All slides render properly
- [ ] Audio/visual elements work (if applicable)
- [ ] CTA buttons function correctly
- [ ] Navigation works (back button)
- [ ] Content is accurate and complete
- [ ] Mobile responsive
- [ ] Accessibility (keyboard nav, screen readers)
- [ ] Performance (loads quickly)
- [ ] SEO metadata (if applicable)

---

## 📝 REVIEW WORKFLOW

### Phase 1: Initial Review (Discovery)

**Goal:** Identify which pages need work

1. **Open Review Dashboard**
   - Navigate to `/learning/campaigns/review` (to be created)
   - See all 60 pages listed

2. **Systematic Review**
   - Start with HOOK-001
   - Click link to view page
   - Check all checklist items
   - Document issues in notes
   - Mark status (Working / Needs Fix / Complete)
   - Move to next page

3. **Document Findings**
   - Create `LANDING_PAGES_REVIEW_NOTES.md`
   - List issues per page
   - Prioritize fixes

### Phase 2: Fix Implementation

**Goal:** Fix issues page by page

**Workflow:**
1. Open page in browser (`http://localhost:5173/learn/[slug]`)
2. Open corresponding campaign JSON file in Cursor
3. Make necessary corrections
4. Save file (Vite hot-reloads automatically)
5. Verify fix in browser
6. Mark as complete in dashboard
7. Move to next page

### Phase 3: Final Verification

**Goal:** Ensure all pages are production-ready

1. Review all pages one final time
2. Test on different screen sizes
3. Verify all CTAs work
4. Check accessibility
5. Performance audit

---

## 🛠️ TOOLS & RESOURCES

### Browser Tools
- **Chrome DevTools:** Inspect elements, check console errors
- **React DevTools:** Debug React components
- **Lighthouse:** Performance and accessibility audit
- **Mobile Device Emulation:** Test responsive design

### Cursor Features
- **Multi-file editing:** Edit JSON and component simultaneously
- **Code navigation:** Jump between related files
- **Search:** Find references across codebase
- **Git integration:** Track changes per page

### Review Dashboard Features
- **Quick navigation:** Click to view any page
- **Status tracking:** Visual indicators for progress
- **Notes:** Document issues and fixes
- **Filtering:** Show only pages needing work

---

## 📊 TRACKING PROGRESS

### Status Categories
- 🟢 **Complete:** Page reviewed and fixed
- 🟡 **In Progress:** Currently being worked on
- 🔴 **Needs Fix:** Issues identified, not yet fixed
- ⚪ **Not Started:** Not yet reviewed

### Progress Metrics
- Total pages: 60
- Reviewed: 0/60
- Fixed: 0/60
- Complete: 0/60

---

## 🔄 ITERATIVE PROCESS

### For Each Page:

1. **View Page**
   ```
   http://localhost:5173/learn/[slug]
   ```

2. **Open Campaign File**
   ```
   public/campaigns/campaign_[ID].json
   ```

3. **Review & Fix**
   - Check presentation content
   - Verify slides structure
   - Test CTAs
   - Fix any issues

4. **Verify**
   - Refresh browser
   - Test functionality
   - Check mobile view

5. **Document**
   - Update notes
   - Mark status
   - Commit changes (optional)

---

## 📁 FILE STRUCTURE

```
Learning-Center/
├── src/
│   └── pages/
│       └── LearningCenter/
│           └── Campaign/
│               ├── LandingPage.tsx (existing)
│               ├── ReviewDashboard.tsx (NEW)
│               └── ReviewChecklist.tsx (NEW)
├── public/
│   └── campaigns/
│       ├── landing_pages_master.json
│       ├── campaign_HOOK-001.json
│       ├── campaign_HOOK-002.json
│       └── ... (all 60 campaign files)
├── LANDING_PAGES_REVIEW_PLAN.md (this file)
└── LANDING_PAGES_REVIEW_NOTES.md (NEW - for tracking)
```

---

## 🎯 BEST PRACTICES FOR USING CURSOR

### 1. **Split View**
- Left: Campaign JSON file
- Right: Browser with page
- Bottom: Terminal (for dev server)

### 2. **Quick Navigation**
- Use Cmd+P to open files quickly
- Use Cmd+Click to jump to definitions
- Use search (Cmd+F) to find references

### 3. **Making Changes**
- Edit JSON file directly
- Vite hot-reloads automatically
- See changes immediately in browser
- Use browser DevTools to inspect

### 4. **Testing**
- Test each change immediately
- Use browser console to catch errors
- Test on different screen sizes
- Test keyboard navigation

### 5. **Documentation**
- Update notes as you go
- Commit frequently (small commits)
- Use clear commit messages

---

## 🚨 COMMON ISSUES TO WATCH FOR

### Content Issues
- Missing or incomplete slides
- Incorrect text content
- Broken image references
- Missing audio files

### Functional Issues
- CTAs not working
- Navigation broken
- Presentation not loading
- Errors in console

### Design Issues
- Layout problems
- Responsive issues
- Accessibility problems
- Performance issues

---

## ✅ SUCCESS CRITERIA

A page is considered **complete** when:
- ✅ Loads without errors
- ✅ All slides display correctly
- ✅ CTAs function properly
- ✅ Responsive on all devices
- ✅ Accessible (keyboard nav, screen readers)
- ✅ Content is accurate
- ✅ Performance is acceptable
- ✅ No console errors

---

## 📅 ESTIMATED TIMELINE

**Assumptions:**
- 5-10 minutes per page for review
- 10-20 minutes per page for fixes (if needed)
- Average 15 minutes per page total

**Timeline:**
- Setup: 1-2 hours
- Review Dashboard: 2-3 hours
- Initial Review (60 pages): 5-10 hours
- Fixes (varies): 10-20 hours
- Final Verification: 2-3 hours

**Total:** 20-38 hours (spread over multiple sessions)

---

## 🎬 NEXT STEPS

1. ✅ Create this plan
2. ⏳ Set up local dev environment
3. ⏳ Create Review Dashboard
4. ⏳ Create Review Checklist component
5. ⏳ Start systematic review
6. ⏳ Implement fixes
7. ⏳ Final verification

---

## 📝 NOTES

- Review can be done incrementally
- Focus on one campaign type at a time if preferred
- Can prioritize pages based on importance
- Use Git to track changes per page
- Document any patterns/issues found

---

**Ready to begin? Let's start with Step 1: Setting up the local development environment!**


