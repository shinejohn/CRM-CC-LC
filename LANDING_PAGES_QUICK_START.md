# Landing Pages Review - Quick Start Guide

**Quick reference for reviewing and fixing landing pages**

---

## 🚀 GETTING STARTED

### 1. Start Local Development Server

```bash
cd /Users/johnshine/Dropbox/Fibonacco/Learning-Center
npm install  # Only needed first time
npm run dev
```

**Expected:** Server starts on `http://localhost:5173`

---

## 📊 OPEN REVIEW DASHBOARD

Navigate to:
```
http://localhost:5173/learning/campaigns/review
```

**Features:**
- See all 60 landing pages
- Track review status (Not Started, In Progress, Needs Fix, Complete)
- Add notes for each page
- Filter by type or status
- Quick navigation to any page

---

## 🔄 REVIEW WORKFLOW

### Step 1: Open Review Dashboard
- Go to `/learning/campaigns/review`
- See progress overview at top
- Browse all pages

### Step 2: Review a Page
1. Click **"View"** button on any campaign card
2. Page opens in new tab: `/learn/[slug]`
3. Review the page:
   - Does it load correctly?
   - Are slides displaying?
   - Do CTAs work?
   - Is content accurate?
   - Is it mobile responsive?

### Step 3: Update Status
1. Go back to Review Dashboard
2. Click **"Add Notes"** on the campaign card
3. Add any notes about issues or fixes needed
4. Select status:
   - **Not Started** - Haven't reviewed yet
   - **In Progress** - Currently reviewing
   - **Needs Fix** - Issues found, needs work
   - **Complete** - Reviewed and fixed

### Step 4: Make Fixes
1. Open the campaign JSON file:
   ```
   public/campaigns/campaign_[ID].json
   ```
2. Make necessary changes
3. Save file (Vite auto-reloads)
4. Refresh browser to see changes
5. Verify fix works
6. Update status to "Complete"

---

## 🎯 USING CURSOR EFFECTIVELY

### Recommended Layout:
```
┌─────────────────┬─────────────────┐
│   Campaign JSON │   Browser       │
│   (Left Panel)  │   (Right Panel) │
└─────────────────┴─────────────────┘
│   Terminal      │
│   (Bottom)      │
└─────────────────┘
```

### Quick Navigation:
- **Cmd+P** - Open file quickly
- **Cmd+Click** - Jump to definition
- **Cmd+F** - Search in file
- **Cmd+Shift+F** - Search across codebase

### Making Changes:
1. Edit JSON file in Cursor
2. Save (Cmd+S)
3. Vite hot-reloads automatically
4. Check browser for changes
5. Use DevTools (F12) to debug if needed

---

## 📝 COMMON FIXES

### Issue: Page doesn't load
**Check:**
- Campaign JSON file exists: `public/campaigns/campaign_[ID].json`
- Slug matches in `landing_pages_master.json`
- No console errors

**Fix:**
- Verify file exists
- Check JSON syntax
- Ensure slug is correct

### Issue: Slides not displaying
**Check:**
- Slides array exists in campaign JSON
- Slide components are valid
- Content structure is correct

**Fix:**
- Add/update slides array
- Verify component types
- Check content structure

### Issue: CTAs not working
**Check:**
- `primary_cta` and `secondary_cta` are set
- CTA types are valid
- Navigation routes exist

**Fix:**
- Update CTA values in JSON
- Verify CTA types match handler
- Check routing

### Issue: Content is wrong
**Check:**
- Campaign title/description
- Slide content
- Template matches purpose

**Fix:**
- Update content in JSON
- Verify template_id matches
- Check slide content

---

## 📊 TRACKING PROGRESS

### Status Indicators:
- ⚪ **Not Started** - Gray circle
- 🟡 **In Progress** - Yellow clock
- 🔴 **Needs Fix** - Red X
- 🟢 **Complete** - Green checkmark

### Progress Bar:
- Shows overall completion percentage
- Updates automatically as you mark pages complete

### Export Data:
- Click **"Export Review Data"** button
- Downloads JSON with all review status and notes
- Useful for backup or sharing progress

---

## 🎯 QUICK ACTIONS

### Review Next Page
- Click **"Review Next Page"** button
- Opens next unreviewed page in new tab

### Fix Next Issue
- Click **"Fix Next Issue"** button
- Opens next page marked "Needs Fix"

### Filter Pages
- Use search box to find specific pages
- Filter by type (Hook, Educational, How-To)
- Filter by status (Not Started, In Progress, etc.)

---

## ✅ REVIEW CHECKLIST

For each page, verify:
- [ ] Page loads without errors
- [ ] Presentation displays correctly
- [ ] All slides render properly
- [ ] CTA buttons function correctly
- [ ] Navigation works (back button)
- [ ] Content is accurate and complete
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance is acceptable

---

## 🔗 USEFUL LINKS

- **Review Dashboard:** `/learning/campaigns/review`
- **Campaign List:** `/learning/campaigns`
- **Landing Page:** `/learn/[slug]`
- **Master Data:** `public/campaigns/landing_pages_master.json`
- **Campaign Files:** `public/campaigns/campaign_*.json`

---

## 💡 TIPS

1. **Work in batches:** Review 5-10 pages at a time
2. **Take notes:** Document issues as you find them
3. **Test thoroughly:** Check mobile, desktop, different browsers
4. **Save frequently:** Your review status is saved automatically
5. **Use filters:** Focus on pages that need work
6. **Export regularly:** Backup your review data

---

## 🆘 TROUBLESHOOTING

### Dev server won't start
```bash
# Check Node version (need 20+)
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Changes not showing
- Hard refresh browser (Cmd+Shift+R)
- Check browser console for errors
- Verify file saved correctly
- Restart dev server

### Review status lost
- Status is stored in browser localStorage
- Export regularly to backup
- If lost, re-export from Review Dashboard

---

**Ready to start? Open the Review Dashboard and begin reviewing!**


