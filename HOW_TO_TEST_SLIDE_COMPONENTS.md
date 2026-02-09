# How to Test Slide Components in FibonaccoPlayer

## 🎯 Overview

The FibonaccoPlayer renders slides based on the `component` property in each slide. To test components properly, you need to ensure:

1. **Component names match available components**
2. **Content structure matches component requirements**
3. **Slides have actual content (not just metadata)**

---

## ✅ Available Slide Components

The player supports these components (defined in `FibonaccoPlayer.tsx`):

- `HeroSlide` - Hero/Title slide
- `ProblemSlide` - Problem/Challenge slide
- `SolutionSlide` - Solution/Benefits slide
- `StatsSlide` - Statistics/Numbers slide
- `ComparisonSlide` - Before/After comparison
- `ProcessSlide` - Step-by-step process
- `TestimonialSlide` - Customer testimonials
- `PricingSlide` - Pricing information
- `CTASlide` - Call-to-action slide

---

## 🔧 How Components Are Loaded

### Step 1: Campaign Data Loading
When you visit `/learn/seo-reality-check`, the `CampaignLandingPage` component:
1. Loads campaign data from `campaign_EDU-001.json`
2. Converts it to Presentation format using `campaignApi.convertToPresentation()`

### Step 2: Slide Content Resolution
The conversion function tries to get slides in this order:
1. **Presentation slides** (if they have content)
2. **Campaign slides array** (if they have content)
3. **Generated slides** (fallback - uses `generateCampaignSlides()`)

### Step 3: Component Rendering
The player looks up the component name in `slideComponents` mapping:
```typescript
const SlideComponent = slideComponents[activeSlide.component] || HeroSlide;
```

---

## ⚠️ Common Issues

### Issue 1: Component Name Mismatch

**Problem:** Campaign JSON uses component names that don't exist:
```json
{
  "component": "ConceptSlide",  // ❌ Doesn't exist
  "component": "DataSlide",     // ❌ Doesn't exist
  "component": "ActionSlide"    // ❌ Doesn't exist
}
```

**Solution:** Use valid component names or add a mapping function.

### Issue 2: Missing Content

**Problem:** Slides have component names but no `content` object:
```json
{
  "component": "HeroSlide",
  "content_type": "topic_intro",  // ❌ Not actual content
  // Missing: "content": { ... }
}
```

**Solution:** Add proper `content` objects matching component requirements.

### Issue 3: Empty Content Objects

**Problem:** Content exists but is empty:
```json
{
  "component": "HeroSlide",
  "content": {}  // ❌ Empty object
}
```

**Solution:** Ensure content has required properties.

---

## 📝 How to Fix Campaign JSON Files

### Option 1: Add Content to Existing Slides

Edit `public/campaigns/campaign_EDU-001.json` and add `content` objects:

```json
{
  "slides": [
    {
      "slide_num": 1,
      "component": "HeroSlide",
      "content": {
        "headline": "SEO is Dead for SMBs",
        "subheadline": "Google SEO is broken for small businesses - here's the truth"
      },
      "audio_file": "slide-01-intro.mp3"
    },
    {
      "slide_num": 2,
      "component": "SolutionSlide",  // Changed from "ConceptSlide"
      "content": {
        "title": "The Reality",
        "solution": "AI search is replacing traditional SEO. Small businesses need new strategies.",
        "benefits": [
          "AI search understands intent better",
          "No more keyword stuffing",
          "Focus on value, not tricks"
        ]
      },
      "audio_file": "slide-02-concept.mp3"
    },
    {
      "slide_num": 3,
      "component": "StatsSlide",  // Changed from "DataSlide"
      "content": {
        "headline": "The Numbers Don't Lie",
        "stats": [
          { "value": "40%", "label": "Search Queries", "sublabel": "Now use AI assistants" },
          { "value": "60%", "label": "SMBs", "sublabel": "Struggling with SEO" }
        ]
      },
      "audio_file": "slide-03-data.mp3"
    }
  ]
}
```

### Option 2: Use Presentation Slides

Add a `presentation` object with fully-formed slides:

```json
{
  "presentation": {
    "id": "EDU-001",
    "audio": {
      "baseUrl": "https://cdn.fibonacco.com/presentations/seo-reality-check/audio/",
      "format": "mp3"
    },
    "slides": [
      {
        "id": 1,
        "component": "HeroSlide",
        "content": {
          "headline": "SEO is Dead for SMBs",
          "subheadline": "The truth about Google SEO"
        },
        "audioFile": "slide-01.mp3",
        "requiresPersonalization": false
      },
      {
        "id": 2,
        "component": "SolutionSlide",
        "content": {
          "title": "What This Means",
          "solution": "AI search changes everything...",
          "benefits": ["Benefit 1", "Benefit 2"]
        },
        "audioFile": "slide-02.mp3",
        "requiresPersonalization": false
      }
    ]
  }
}
```

---

## 🧪 Testing Components

### Method 1: Test Individual Components

Create a test page to render individual components:

```typescript
// src/pages/LearningCenter/Campaign/TestSlide.tsx
import { HeroSlide, SolutionSlide, StatsSlide } from '@/components/LearningCenter/Presentation/slides';

export const TestSlidePage = () => {
  return (
    <div className="h-screen">
      <HeroSlide
        content={{
          headline: "Test Headline",
          subheadline: "Test Subheadline"
        }}
        isActive={true}
        theme="blue"
      />
    </div>
  );
};
```

### Method 2: Use Generated Content

The `generateCampaignSlides()` function automatically creates content. Ensure your campaign JSON triggers it:

1. Remove `content` from slides (or make them empty)
2. The converter will call `generateCampaignSlides()`
3. Generated slides use valid component names

### Method 3: Direct JSON Edit

Edit the campaign JSON file directly:

1. Open `public/campaigns/campaign_EDU-001.json`
2. Update `component` names to valid ones:
   - `ConceptSlide` → `SolutionSlide`
   - `DataSlide` → `StatsSlide`
   - `ActionSlide` → `ProcessSlide`
   - `ResourceSlide` → `SolutionSlide`
3. Add `content` objects matching component requirements
4. Save and refresh browser

---

## 📋 Component Content Requirements

### HeroSlide
```json
{
  "component": "HeroSlide",
  "content": {
    "headline": "Main Title",
    "subheadline": "Subtitle or description"
  }
}
```

### SolutionSlide
```json
{
  "component": "SolutionSlide",
  "content": {
    "title": "Solution Title",
    "solution": "Description of solution",
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
  }
}
```

### StatsSlide
```json
{
  "component": "StatsSlide",
  "content": {
    "headline": "Statistics Title",
    "stats": [
      { "value": "90%", "label": "Label", "sublabel": "Sub-label" },
      { "value": "3x", "label": "Label 2", "sublabel": "Sub-label 2" }
    ]
  }
}
```

### ComparisonSlide
```json
{
  "component": "ComparisonSlide",
  "content": {
    "headline": "Comparison Title",
    "before": {
      "title": "Before",
      "items": ["Item 1", "Item 2"]
    },
    "after": {
      "title": "After",
      "items": ["Item 1", "Item 2"]
    }
  }
}
```

### ProcessSlide
```json
{
  "component": "ProcessSlide",
  "content": {
    "headline": "Process Title",
    "subheadline": "Subtitle",
    "steps": [
      { "number": "1", "title": "Step 1", "description": "Description" },
      { "number": "2", "title": "Step 2", "description": "Description" }
    ]
  }
}
```

### CTASlide
```json
{
  "component": "CTASlide",
  "content": {
    "headline": "Ready to Get Started?",
    "subheadline": "Take action today",
    "primaryCTA": {
      "text": "Get Started",
      "action": "signup_free"
    },
    "secondaryCTA": {
      "text": "Learn More",
      "action": "schedule_demo"
    }
  }
}
```

---

## 🔍 Debugging Tips

### Check Browser Console
Look for:
- Component lookup failures
- Missing content warnings
- Rendering errors

### Check Network Tab
Verify:
- Campaign JSON loads successfully
- Audio files load (if applicable)

### Add Console Logging
In `FibonaccoPlayer.tsx`, add:
```typescript
console.log('Active slide:', activeSlide);
console.log('SlideComponent:', SlideComponent);
console.log('Content:', activeSlide?.content);
```

---

## ✅ Quick Fix for Testing

To quickly test components, edit one campaign file:

1. Open `public/campaigns/campaign_EDU-001.json`
2. Replace the `slides` array with this:

```json
"slides": [
  {
    "slide_num": 1,
    "component": "HeroSlide",
    "content": {
      "headline": "SEO is Dead for SMBs",
      "subheadline": "Google SEO is broken for small businesses"
    },
    "audio_file": "slide-01.mp3"
  },
  {
    "slide_num": 2,
    "component": "SolutionSlide",
    "content": {
      "title": "The Solution",
      "solution": "AI search is replacing traditional SEO",
      "benefits": [
        "Better understanding of intent",
        "No keyword stuffing needed",
        "Focus on value"
      ]
    },
    "audio_file": "slide-02.mp3"
  },
  {
    "slide_num": 3,
    "component": "StatsSlide",
    "content": {
      "headline": "The Numbers",
      "stats": [
        { "value": "40%", "label": "AI Queries", "sublabel": "Growing fast" },
        { "value": "60%", "label": "SMBs", "sublabel": "Struggling" }
      ]
    },
    "audio_file": "slide-03.mp3"
  },
  {
    "slide_num": 4,
    "component": "CTASlide",
    "content": {
      "headline": "Ready to Learn More?",
      "subheadline": "Download our guide",
      "primaryCTA": {
        "text": "Download Guide",
        "action": "download_guide"
      }
    },
    "audio_file": "slide-04.mp3"
  }
]
```

3. Save and refresh `/learn/seo-reality-check`
4. Components should now render properly!

---

## 🎯 Summary

**To test components properly:**
1. ✅ Use valid component names (HeroSlide, SolutionSlide, etc.)
2. ✅ Add `content` objects with required properties
3. ✅ Match content structure to component requirements
4. ✅ Save JSON file and refresh browser
5. ✅ Check browser console for errors

The player will automatically use the content from your JSON file if it's properly structured!






