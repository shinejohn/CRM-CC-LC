# FIBONACCO AI-NARRATED PRESENTATION SYSTEM
## Technical Specification for Scalable, Template-Based Presentations

---

## EXECUTIVE SUMMARY

This document outlines a technical architecture for creating AI-generated, narrated presentations that can be:
1. **Generated in volume** by Claude/Opus 4.5
2. **Assembled into a common template** for landing pages
3. **Delivered with synchronized text-to-speech narration**
4. **Managed entirely through automation** without manual video editing

The system presents an "AI Account Manager" persona guiding prospects through ~50 email hooks and landing pages with personalized, slide-based presentations.

---

## ARCHITECTURAL APPROACH

### Why NOT Traditional Powerpoint/Video

| Approach | Pros | Cons |
|----------|------|------|
| **Video (MP4)** | Familiar format | Storage intensive, hard to update, requires encoding |
| **PowerPoint (PPTX)** | Rich formatting | Requires viewer/plugin, not web-native |
| **PDF** | Universal | Static, no narration sync |
| **HTML + JSON (Recommended)** | Web-native, lightweight, infinitely scalable | Requires custom player |

### Recommended Architecture: JSON-Driven Slide Player

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANDING PAGE TEMPLATE                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PRESENTATION CONTAINER                       │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  SLIDE DISPLAY AREA                                 │ │   │
│  │  │  (Renders current slide from JSON)                  │ │   │
│  │  │                                                     │ │   │
│  │  │  • Title                                            │ │   │
│  │  │  • Content (bullet points, images, stats)           │ │   │
│  │  │  • Visual elements                                  │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │  ┌──────────────┐  ┌──────────────────────────────────┐ │   │
│  │  │ AI AVATAR    │  │ NARRATION TEXT PANEL             │ │   │
│  │  │ (Static or   │  │ (Shows script, synced with audio)│ │   │
│  │  │  animated)   │  │                                  │ │   │
│  │  └──────────────┘  └──────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ ◄◄  ◄  ▶  ►►  │ Slide 3 of 12 │ 🔊 Volume │ ⚙️    │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [CTA BUTTON: Get Started]  [CTA BUTTON: Schedule Demo]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## DATA STRUCTURE

### Presentation JSON Schema

Each presentation is a single JSON file that contains all slides and narration scripts:

```json
{
  "presentationId": "lp-001-restaurant-owner",
  "meta": {
    "title": "AI Employees for Your Restaurant",
    "targetAudience": "Restaurant Owners",
    "emailHook": "hook-restaurant-marketing",
    "version": "1.0",
    "created": "2025-11-30",
    "estimatedDuration": "3:45"
  },
  "presenter": {
    "name": "Sarah",
    "role": "AI Account Manager",
    "avatarImage": "/assets/avatars/sarah-professional.png",
    "voiceId": "aws-polly-joanna-neural"
  },
  "slides": [
    {
      "id": 1,
      "type": "title",
      "layout": "centered",
      "content": {
        "headline": "Your Restaurant Deserves an AI Team",
        "subheadline": "24/7 Reservations • Automated Marketing • Perfect Customer Service"
      },
      "narration": {
        "text": "Hi, I'm Sarah, and I'm here to show you how AI employees can transform your restaurant's operations. In the next few minutes, I'll walk you through exactly what we can do for you.",
        "audioFile": "/audio/lp-001/slide-01.mp3",
        "duration": 12.5
      },
      "visualElements": {
        "backgroundImage": "/assets/backgrounds/restaurant-warm.jpg",
        "animation": "fade-in"
      }
    },
    {
      "id": 2,
      "type": "problem",
      "layout": "two-column",
      "content": {
        "headline": "The Challenge You Face",
        "leftColumn": {
          "title": "Without AI",
          "items": [
            "Missed reservation calls after hours",
            "Inconsistent customer follow-up",
            "Time-consuming social media management",
            "No-shows eating into profits"
          ]
        },
        "rightColumn": {
          "title": "With AI Employees",
          "items": [
            "24/7 reservation handling",
            "Automatic review responses",
            "Daily social posts generated",
            "Smart confirmation & reminders"
          ]
        }
      },
      "narration": {
        "text": "Let me show you what you're dealing with right now versus what's possible. On the left, the challenges every restaurant owner faces. On the right, what happens when you have AI employees working for you around the clock.",
        "audioFile": "/audio/lp-001/slide-02.mp3",
        "duration": 18.2
      }
    },
    {
      "id": 3,
      "type": "stats",
      "layout": "stat-cards",
      "content": {
        "headline": "The Numbers Don't Lie",
        "stats": [
          {
            "value": "$99",
            "label": "per month",
            "comparison": "vs $45,000/year for a human employee"
          },
          {
            "value": "24/7",
            "label": "availability",
            "comparison": "Never calls in sick"
          },
          {
            "value": "340%",
            "label": "visibility increase",
            "comparison": "Average customer reach improvement"
          }
        ]
      },
      "narration": {
        "text": "Here's what really matters: the economics. For ninety-nine dollars a month, you get what would cost forty-five thousand dollars a year in employee salary. And these AI employees work twenty-four-seven. They never need a day off. Our clients see an average three hundred forty percent increase in local visibility.",
        "audioFile": "/audio/lp-001/slide-03.mp3",
        "duration": 22.0
      }
    }
  ],
  "callToAction": {
    "primaryButton": {
      "text": "Start Your Free Trial",
      "url": "/signup?source=lp-001"
    },
    "secondaryButton": {
      "text": "Schedule a Demo Call",
      "url": "/demo?source=lp-001"
    }
  }
}
```

---

## COMPONENT ARCHITECTURE

### 1. Slide Renderer Component

A reusable Vue.js/React component that renders any slide type:

```javascript
// SlideRenderer.vue (simplified concept)
const slideLayouts = {
  'title': TitleSlideLayout,
  'problem': ProblemSlideLayout,
  'solution': SolutionSlideLayout,
  'stats': StatsSlideLayout,
  'comparison': ComparisonSlideLayout,
  'testimonial': TestimonialSlideLayout,
  'pricing': PricingSlideLayout,
  'cta': CTASlideLayout,
  'features': FeaturesSlideLayout,
  'process': ProcessSlideLayout
};

// Each layout is a template that receives content from JSON
```

### 2. Narration Engine

Options for text-to-speech delivery:

#### Option A: Pre-Generated Audio (Recommended for Production)
- Generate MP3 files during build time using AWS Polly or ElevenLabs
- Store in S3/CloudFlare
- Sync with slide transitions

```javascript
// Audio generation script (Node.js)
const AWS = require('aws-sdk');
const polly = new AWS.Polly();

async function generateNarration(text, outputPath) {
  const params = {
    Engine: 'neural',
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: 'Joanna', // or 'Matthew', 'Amy', etc.
    TextType: 'text'
  };
  
  const result = await polly.synthesizeSpeech(params).promise();
  // Save to file or S3
}
```

#### Option B: Browser-Based TTS (Fallback/Development)
- Uses Web Speech API
- No audio file storage needed
- Less consistent voice quality

```javascript
function speakNarration(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes('Google'));
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
}
```

### 3. Presentation Player Component

```javascript
// PresentationPlayer.vue
<template>
  <div class="presentation-container">
    <!-- Slide Display -->
    <div class="slide-area">
      <component 
        :is="currentSlideLayout" 
        :content="currentSlide.content"
        :visual="currentSlide.visualElements"
      />
    </div>
    
    <!-- AI Presenter Panel -->
    <div class="presenter-panel">
      <img :src="presenter.avatarImage" class="avatar" />
      <div class="narration-text">
        {{ currentSlide.narration.text }}
      </div>
    </div>
    
    <!-- Controls -->
    <div class="controls">
      <button @click="previousSlide">◄</button>
      <button @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
      <button @click="nextSlide">►</button>
      <span>Slide {{ currentIndex + 1 }} of {{ totalSlides }}</span>
      <input type="range" v-model="volume" />
    </div>
  </div>
</template>
```

---

## CONTENT GENERATION WORKFLOW

### How Claude/Opus 4.5 Generates Presentations

#### Step 1: Define Presentation Parameters

```yaml
# Presentation Brief (input to Claude)
presentation_type: landing_page
email_hook: "restaurant-marketing-automation"
target_industry: "Restaurants"
target_persona: "Restaurant Owner"
pain_points:
  - Managing reservations after hours
  - Social media is overwhelming
  - Staff turnover affects customer service
solution_focus: "AlphaSite.ai AI Employees"
desired_length: 8-12 slides
tone: "Friendly, professional, solution-focused"
cta_goal: "Free trial signup"
```

#### Step 2: Claude Generates JSON Structure

Claude produces the complete presentation JSON including:
- All slide content
- Complete narration scripts
- Visual element suggestions
- Timing estimates

#### Step 3: Automated Audio Generation

```bash
# Build script generates audio for all narrations
node scripts/generate-audio.js presentations/lp-001.json

# Output:
# ✓ Generated /audio/lp-001/slide-01.mp3 (12.5s)
# ✓ Generated /audio/lp-001/slide-02.mp3 (18.2s)
# ... etc
```

#### Step 4: Deploy to Landing Page

The landing page template simply references the JSON file:

```html
<!-- Landing Page Template -->
<div id="app">
  <PresentationPlayer 
    presentation-src="/presentations/lp-001.json"
    theme="fibonacco-blue"
    auto-play="false"
  />
</div>
```

---

## SLIDE LAYOUT TEMPLATES

### Standard Layouts for Fibonacco

| Layout | Use Case | Visual Structure |
|--------|----------|------------------|
| `title` | Opening slides | Centered headline + tagline, background image |
| `problem` | Pain point slides | Two-column before/after comparison |
| `solution` | Feature highlights | Icon + headline + description list |
| `stats` | Data-driven persuasion | 3-4 stat cards with large numbers |
| `process` | How-it-works | Numbered steps with icons |
| `testimonial` | Social proof | Quote + attribution + optional photo |
| `pricing` | Value proposition | Price card with features list |
| `comparison` | Competitor analysis | Side-by-side table |
| `features` | Feature deep-dive | Grid of feature cards |
| `cta` | Closing slides | Large button(s) + urgency messaging |
| `demo` | Interactive elements | Embedded form or scheduler |

---

## STYLING & BRANDING

### CSS Variables for Consistency

```css
:root {
  /* Fibonacco Brand Colors */
  --fib-primary: #2563eb;        /* Blue */
  --fib-secondary: #1e40af;      /* Dark Blue */
  --fib-accent: #f59e0b;         /* Amber */
  --fib-success: #10b981;        /* Green */
  --fib-text-primary: #1f2937;
  --fib-text-secondary: #6b7280;
  --fib-bg-light: #f9fafb;
  --fib-bg-dark: #111827;
  
  /* Slide Dimensions */
  --slide-aspect-ratio: 16/9;
  --slide-max-width: 960px;
  
  /* Typography */
  --font-headline: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

---

## IMPLEMENTATION PHASES

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Create JSON schema specification
- [ ] Build base slide renderer component
- [ ] Implement 5 core layouts (title, problem, solution, stats, cta)
- [ ] Create presentation player with basic controls

### Phase 2: Audio Integration (Week 2-3)
- [ ] Set up AWS Polly integration
- [ ] Build audio generation pipeline
- [ ] Implement audio-slide synchronization
- [ ] Add volume and playback controls

### Phase 3: Content Generation (Week 3-4)
- [ ] Create presentation brief templates for each industry
- [ ] Generate initial 10 presentations via Claude
- [ ] Build validation/QA workflow
- [ ] Establish content versioning system

### Phase 4: Template Integration (Week 4-5)
- [ ] Integrate player into AlphaSite landing page template
- [ ] Create responsive layouts for mobile
- [ ] Add analytics tracking (slide views, completion rates)
- [ ] Implement A/B testing hooks

### Phase 5: Scale Production (Week 5+)
- [ ] Generate all 50 email hook presentations
- [ ] Build automated deployment pipeline
- [ ] Create content update workflow
- [ ] Monitor and optimize conversion metrics

---

## FILE STRUCTURE

```
/fibonacco-presentations/
├── /src/
│   ├── /components/
│   │   ├── PresentationPlayer.vue
│   │   ├── SlideRenderer.vue
│   │   └── /layouts/
│   │       ├── TitleSlide.vue
│   │       ├── ProblemSlide.vue
│   │       ├── SolutionSlide.vue
│   │       ├── StatsSlide.vue
│   │       └── CTASlide.vue
│   ├── /styles/
│   │   ├── presentation.css
│   │   └── slide-layouts.css
│   └── /utils/
│       └── audioManager.js
├── /presentations/
│   ├── lp-001-restaurant-owner.json
│   ├── lp-002-hvac-contractor.json
│   ├── lp-003-real-estate-agent.json
│   └── ... (50 total)
├── /audio/
│   ├── /lp-001/
│   │   ├── slide-01.mp3
│   │   ├── slide-02.mp3
│   │   └── ...
│   └── /lp-002/
│       └── ...
├── /assets/
│   ├── /avatars/
│   │   ├── sarah-professional.png
│   │   └── marcus-friendly.png
│   ├── /backgrounds/
│   └── /icons/
├── /scripts/
│   ├── generate-audio.js
│   ├── validate-presentation.js
│   └── deploy-presentations.js
└── /briefs/
    ├── restaurant-brief.yaml
    ├── hvac-brief.yaml
    └── ... (templates for Claude)
```

---

## SAMPLE BRIEF TEMPLATE FOR CLAUDE

```yaml
# Use this template when asking Claude to generate a presentation

---
PRESENTATION GENERATION REQUEST
---

Target Audience: [Industry] owners/operators
Email Hook Reference: [hook-name]
Landing Page ID: lp-[number]

## Context
[Brief description of the target audience's situation and why they're receiving this presentation]

## Key Pain Points to Address
1. [Pain point 1]
2. [Pain point 2]
3. [Pain point 3]

## Solutions to Highlight
1. [AlphaSite.ai feature 1]
2. [AlphaSite.ai feature 2]
3. [Community platform benefit]

## Required Slides
1. Title slide (hook them in)
2. Problem slide (empathy)
3. Solution overview (high level)
4. [Feature-specific slide]
5. Stats/proof slide
6. How it works (simple)
7. Pricing/value slide
8. CTA slide

## Tone & Style
- Conversational but professional
- Empathetic to their challenges
- Solution-focused, not salesy
- Confident without being pushy

## Call to Action
Primary: [Start Free Trial / Schedule Demo / etc.]
Secondary: [Learn More / Watch Full Demo / etc.]

---
OUTPUT FORMAT: Complete JSON matching the presentation schema
---
```

---

## COST ANALYSIS

### Per-Presentation Generation Costs

| Component | Cost | Notes |
|-----------|------|-------|
| Claude API (content generation) | ~$0.15 | ~2000 tokens per presentation |
| AWS Polly Neural (audio) | ~$0.80 | ~3 minutes of audio @ $4/1M chars |
| S3 Storage (audio files) | ~$0.02/mo | ~5MB per presentation |
| **Total per presentation** | **~$1.00** | One-time generation |

### 50 Presentations Total
- Initial generation: ~$50
- Monthly storage: ~$1
- Updates (5/month estimate): ~$5/month

---

## ADVANTAGES OF THIS APPROACH

### For Fibonacco
✅ **Infinitely scalable** - Generate new presentations in minutes
✅ **Easy updates** - Change JSON, regenerate audio, deploy
✅ **Consistent branding** - All presentations use same templates
✅ **No video editing** - Pure automation pipeline
✅ **Analytics-ready** - Track engagement at slide level
✅ **A/B testable** - Swap presentations easily
✅ **SEO-friendly** - Text content is crawlable

### For Prospects
✅ **Fast loading** - No video buffering
✅ **Accessible** - Text narration visible for deaf/hard-of-hearing
✅ **User-controlled** - Pause, skip, replay at will
✅ **Mobile-friendly** - Responsive design
✅ **Professional** - Polished, consistent experience

---

## NEXT STEPS

1. **Approve architecture** - Confirm this approach meets requirements
2. **Build prototype** - Single presentation with 5 slides, working audio
3. **Test with team** - Get feedback on UX and presentation quality
4. **Generate content** - Create first 10 presentations via Claude
5. **Integrate into AlphaSite** - Embed in landing page template
6. **Scale production** - Generate remaining 40 presentations

---

## APPENDIX: SAMPLE COMPLETE PRESENTATION JSON

See attached file: `sample-presentation-complete.json`

---

*Document prepared by Claude | Fibonacco Technical Documentation*
*Version 1.0 | November 30, 2025*
