# FIBONACCO SLIDE COMPONENT SYSTEM
## Complete Technical Specification v2.0

---

## EXECUTIVE SUMMARY

This specification defines a **component-based presentation system** where each slide type is a distinct, reusable visual component that receives its content from a JSON data structure. The system enables:

1. **Volume generation** via Claude/Opus 4.5
2. **Visual consistency** across all presentations
3. **Rich aesthetics** without manual design work
4. **JSON-driven content** for easy automation
5. **Synchronized narration** with text-to-speech

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           JSON DATA FILE                                │
│  {                                                                      │
│    "slides": [                                                          │
│      { "component": "HeroSlide", "content": {...}, "narration": "..." }│
│      { "component": "StatsSlide", "content": {...}, "narration": "..."}│
│    ]                                                                    │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION PLAYER                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SLIDE RENDERER                                │   │
│  │    Reads "component" field → Loads matching component           │   │
│  │    Passes "content" as props → Component renders slide          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AI PRESENTER PANEL                            │   │
│  │    Shows avatar, name, role                                     │   │
│  │    Displays narration text (synced with audio)                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    CONTROL BAR                                   │   │
│  │    Progress • Play/Pause • Nav • Volume • CTA                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## SLIDE COMPONENT LIBRARY

### 1. HeroSlide
**Purpose:** Opening slide that creates immediate impact and sets the tone.

**Visual Design:**
- Full-bleed gradient background (customizable colors)
- Animated background effects (subtle particles, glows)
- Large centered headline with accent color treatment
- Badge/label at top (e.g., "FOR RESTAURANT OWNERS")
- Large decorative icon
- Grid pattern overlay for depth

**JSON Content Structure:**
```json
{
  "component": "HeroSlide",
  "content": {
    "badge": "FOR RESTAURANT OWNERS",
    "headline": "Your Restaurant Deserves",
    "headlineAccent": "an AI Team",
    "subheadline": "24/7 Reservations • Automated Marketing • Perfect Customer Service",
    "backgroundGradient": "from-blue-900 via-blue-800 to-indigo-900",
    "icon": "Utensils"
  }
}
```

**Use Cases:** Opening slides, section dividers, major announcements

---

### 2. ProblemSlide
**Purpose:** Establish empathy by highlighting pain points the audience faces.

**Visual Design:**
- Dark background with red/warning accent colors
- 2x2 grid of problem cards
- Each card has: icon, title, description
- Red pulsing indicator dots suggest urgency
- Subtle hover effects on cards

**JSON Content Structure:**
```json
{
  "component": "ProblemSlide",
  "content": {
    "headline": "Sound Familiar?",
    "subheadline": "The daily struggles every restaurant owner faces",
    "problems": [
      {
        "icon": "Phone",
        "title": "Missed Calls",
        "description": "Losing reservations when you can't answer the phone"
      },
      {
        "icon": "Clock",
        "title": "No Time",
        "description": "Too busy cooking to post on social media"
      }
    ]
  }
}
```

**Use Cases:** Pain point identification, challenge framing, "before" scenarios

---

### 3. SolutionSlide
**Purpose:** Present your solution/features as the answer to problems.

**Visual Design:**
- Light background (professional, clean)
- 3-column card layout
- Each card has colored top accent bar
- Icon with matching background tint
- Shadow and hover elevation effects

**JSON Content Structure:**
```json
{
  "component": "SolutionSlide",
  "content": {
    "headline": "Meet Your AI Team",
    "subheadline": "Employees that never sleep, never quit, never complain",
    "solutions": [
      {
        "icon": "Phone",
        "title": "AI Receptionist",
        "description": "Answers every call, 24/7. Books reservations, answers questions.",
        "color": "blue"
      },
      {
        "icon": "TrendingUp",
        "title": "AI Marketing Manager",
        "description": "Posts to social media daily. Creates promotions.",
        "color": "green"
      }
    ]
  }
}
```

**Use Cases:** Feature introductions, product highlights, service descriptions

---

### 4. StatsSlide
**Purpose:** Provide data-driven proof points that validate claims.

**Visual Design:**
- Rich purple/indigo gradient background
- 4-column stat card layout
- Large numbers with supporting labels
- Icon accents for each stat
- Glassmorphism effect on cards

**JSON Content Structure:**
```json
{
  "component": "StatsSlide",
  "content": {
    "headline": "The Numbers Don't Lie",
    "stats": [
      {
        "value": "$99",
        "label": "per month",
        "sublabel": "vs $45,000/year employee",
        "icon": "DollarSign"
      },
      {
        "value": "24/7",
        "label": "availability",
        "sublabel": "Never calls in sick",
        "icon": "Clock"
      }
    ]
  }
}
```

**Use Cases:** ROI justification, performance metrics, social proof numbers

---

### 5. ComparisonSlide
**Purpose:** Show before/after or us vs. them contrast.

**Visual Design:**
- Split panel layout (50/50)
- Left panel: red/negative treatment (problems)
- Right panel: green/positive treatment (solutions)
- Checkmark and X icons for visual clarity
- Clear visual separation between options

**JSON Content Structure:**
```json
{
  "component": "ComparisonSlide",
  "content": {
    "headline": "Before & After",
    "before": {
      "title": "Without Fibonacco",
      "items": [
        "Missed calls = lost revenue",
        "Inconsistent social media",
        "Manual reservation tracking"
      ]
    },
    "after": {
      "title": "With Fibonacco",
      "items": [
        "Every call answered instantly",
        "Daily posts, automatically",
        "Smart booking system"
      ]
    }
  }
}
```

**Use Cases:** Before/after scenarios, competitive comparisons, upgrade benefits

---

### 6. ProcessSlide
**Purpose:** Explain how something works in clear, numbered steps.

**Visual Design:**
- Light background with subtle gradient
- Horizontal step flow with connecting arrows
- Numbered circles (1, 2, 3) with gradient fill
- Icon for each step
- Card shadows for depth

**JSON Content Structure:**
```json
{
  "component": "ProcessSlide",
  "content": {
    "headline": "How It Works",
    "subheadline": "Up and running in 48 hours",
    "steps": [
      {
        "number": "1",
        "title": "Quick Setup",
        "description": "15-minute onboarding call. We learn your business.",
        "icon": "Calendar"
      },
      {
        "number": "2",
        "title": "AI Training",
        "description": "We configure your AI team with your menu, hours, policies.",
        "icon": "Zap"
      }
    ]
  }
}
```

**Use Cases:** Onboarding flows, product setup, service delivery process

---

### 7. TestimonialSlide
**Purpose:** Provide social proof through customer quotes.

**Visual Design:**
- Dark background for dramatic effect
- Large quote marks as decorative element
- Quote text prominently displayed
- Author info with avatar (initials or image)
- Highlighted metric/result badge

**JSON Content Structure:**
```json
{
  "component": "TestimonialSlide",
  "content": {
    "quote": "I was skeptical at first—AI for a family restaurant? But within a week, my phone anxiety was gone.",
    "author": "Maria Gonzalez",
    "title": "Owner, Casa Del Sol",
    "location": "Tampa, FL",
    "metric": {
      "value": "+47%",
      "label": "reservations in 3 months"
    }
  }
}
```

**Use Cases:** Customer success stories, reviews, case study highlights

---

### 8. PricingSlide
**Purpose:** Present pricing in a clear, compelling way.

**Visual Design:**
- Light background for clarity
- Centered pricing card with border accent
- "Most Popular" badge
- Large price with period
- Feature checklist with icons
- CTA button with hover effect
- Guarantee badge at bottom

**JSON Content Structure:**
```json
{
  "component": "PricingSlide",
  "content": {
    "headline": "Simple, Transparent Pricing",
    "price": "$99",
    "period": "/month",
    "description": "Everything you need to run a smarter restaurant",
    "features": [
      "AI Receptionist (unlimited calls)",
      "AI Marketing Manager",
      "AI Customer Service",
      "24/7 support"
    ],
    "cta": "Start Free Trial",
    "guarantee": "30-day money-back guarantee"
  }
}
```

**Use Cases:** Pricing pages, upgrade offers, plan comparisons

---

### 9. CTASlide
**Purpose:** Final call-to-action to drive conversions.

**Visual Design:**
- Vibrant gradient background
- Background blur/glow effects
- Large headline centered
- Dual button layout (primary + secondary)
- Urgency message with icon

**JSON Content Structure:**
```json
{
  "component": "CTASlide",
  "content": {
    "headline": "Ready to Transform Your Restaurant?",
    "subheadline": "Join 500+ restaurant owners who've already made the switch",
    "primaryCTA": {
      "text": "Start Free Trial",
      "icon": "ArrowRight"
    },
    "secondaryCTA": {
      "text": "Schedule a Demo",
      "icon": "Calendar"
    },
    "urgency": "Limited spots available for December onboarding"
  }
}
```

**Use Cases:** Closing slides, conversion points, action requests

---

## ADDITIONAL PLANNED COMPONENTS

### 10. FeaturesGridSlide
**Purpose:** Display multiple features in an organized grid.

### 11. TimelineSlide
**Purpose:** Show chronological progression or roadmap.

### 12. TeamSlide
**Purpose:** Introduce team members or AI agents.

### 13. FAQSlide
**Purpose:** Address common questions.

### 14. VideoSlide
**Purpose:** Embed video content within presentation.

### 15. DemoSlide
**Purpose:** Interactive form or live demo embed.

### 16. QuoteGallerySlide
**Purpose:** Multiple testimonials in carousel format.

### 17. ROICalculatorSlide
**Purpose:** Interactive savings/ROI calculator.

### 18. IntegrationSlide
**Purpose:** Show connected tools/platforms.

### 19. ChecklistSlide
**Purpose:** What's included or requirements list.

### 20. ContactSlide
**Purpose:** Contact information and form.

---

## ICON LIBRARY

The system uses Lucide React icons. Available icons include:

| Category | Icons |
|----------|-------|
| **Navigation** | ChevronLeft, ChevronRight, ArrowRight, ArrowLeft |
| **Actions** | Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw |
| **Status** | CheckCircle, XCircle, AlertCircle, Clock |
| **Business** | DollarSign, TrendingUp, Users, Building, Briefcase |
| **Communication** | Phone, Mail, MessageCircle, Calendar |
| **Industry** | Utensils (restaurant), Wrench (services), Home (real estate) |
| **UI** | Zap, Star, Shield, Heart |

---

## ANIMATION SYSTEM

Each component supports entry animations:

| Animation | CSS Class | Use Case |
|-----------|-----------|----------|
| **Fade In** | `animate-fade-in` | General content appearance |
| **Slide Up** | `animate-slide-up` | Headlines, important text |
| **Slide Right** | `animate-slide-right` | Left-side content |
| **Slide Left** | `animate-slide-left` | Right-side content |
| **Scale In** | `animate-scale-in` | Cards, stats |
| **Bounce In** | `animate-bounce-in` | CTAs, badges |

Animations are triggered when `isActive` prop is true (current slide).

---

## COLOR THEMES

### Primary Themes
```javascript
const themes = {
  blue: {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#f59e0b',
    gradient: 'from-blue-900 via-blue-800 to-indigo-900'
  },
  green: {
    primary: '#059669',
    secondary: '#047857',
    accent: '#f59e0b',
    gradient: 'from-emerald-900 via-emerald-800 to-teal-900'
  },
  purple: {
    primary: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#f59e0b',
    gradient: 'from-purple-900 via-purple-800 to-indigo-900'
  }
};
```

---

## COMPLETE JSON SCHEMA

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Fibonacco Presentation",
  "type": "object",
  "required": ["presentationId", "meta", "presenter", "slides"],
  "properties": {
    "presentationId": {
      "type": "string",
      "description": "Unique identifier (e.g., 'lp-001-restaurant-owner')"
    },
    "meta": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "targetAudience": { "type": "string" },
        "emailHook": { "type": "string" },
        "theme": { "type": "string", "enum": ["blue", "green", "purple", "orange"] },
        "version": { "type": "string" },
        "created": { "type": "string", "format": "date" },
        "estimatedDuration": { "type": "string" }
      }
    },
    "presenter": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "role": { "type": "string" },
        "avatarStyle": {
          "type": "string",
          "enum": ["professional-female", "professional-male", "friendly-female", "friendly-male"]
        },
        "voiceId": { "type": "string" }
      }
    },
    "slides": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "component", "content", "narration"],
        "properties": {
          "id": { "type": "integer" },
          "component": {
            "type": "string",
            "enum": [
              "HeroSlide",
              "ProblemSlide",
              "SolutionSlide",
              "StatsSlide",
              "ComparisonSlide",
              "ProcessSlide",
              "TestimonialSlide",
              "PricingSlide",
              "CTASlide"
            ]
          },
          "content": { "type": "object" },
          "narration": { "type": "string" }
        }
      }
    },
    "callToAction": {
      "type": "object",
      "properties": {
        "primaryButton": {
          "type": "object",
          "properties": {
            "text": { "type": "string" },
            "url": { "type": "string" }
          }
        },
        "secondaryButton": {
          "type": "object",
          "properties": {
            "text": { "type": "string" },
            "url": { "type": "string" }
          }
        }
      }
    }
  }
}
```

---

## GENERATION WORKFLOW

### Step 1: Create Presentation Brief
```yaml
target_industry: "Restaurants"
target_persona: "Restaurant Owner"
pain_points:
  - Managing reservations after hours
  - Social media is overwhelming
  - Staff turnover
solution_focus: "AlphaSite.ai"
slide_count: 8-10
```

### Step 2: Claude Generates JSON
Claude produces complete JSON file with all slides and narration.

### Step 3: Generate Audio
```bash
node scripts/generate-audio.js presentations/lp-001.json
```

### Step 4: Deploy
Upload JSON and audio files; presentation auto-renders in template.

---

## FILE STRUCTURE

```
/presentations/
├── /json/
│   ├── lp-001-restaurant-owner.json
│   ├── lp-002-hvac-contractor.json
│   └── ...
├── /audio/
│   ├── /lp-001/
│   │   ├── slide-01.mp3
│   │   └── ...
│   └── /lp-002/
├── /components/
│   ├── PresentationPlayer.jsx
│   ├── AIPresenter.jsx
│   └── /slides/
│       ├── HeroSlide.jsx
│       ├── ProblemSlide.jsx
│       ├── SolutionSlide.jsx
│       ├── StatsSlide.jsx
│       ├── ComparisonSlide.jsx
│       ├── ProcessSlide.jsx
│       ├── TestimonialSlide.jsx
│       ├── PricingSlide.jsx
│       └── CTASlide.jsx
└── /styles/
    └── presentation.css
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Core Components ✓
- [x] HeroSlide
- [x] ProblemSlide  
- [x] SolutionSlide
- [x] StatsSlide
- [x] ComparisonSlide
- [x] ProcessSlide
- [x] TestimonialSlide
- [x] PricingSlide
- [x] CTASlide

### Phase 2: Player Features
- [x] Slide navigation
- [x] Play/pause controls
- [x] Progress indicators
- [x] AI presenter panel
- [x] Browser TTS (demo)
- [ ] AWS Polly integration (production)
- [ ] Audio sync with slides
- [ ] Keyboard shortcuts
- [ ] Fullscreen mode

### Phase 3: Advanced Components
- [ ] FeaturesGridSlide
- [ ] TimelineSlide
- [ ] TeamSlide
- [ ] FAQSlide
- [ ] VideoSlide
- [ ] DemoSlide
- [ ] ROICalculatorSlide

### Phase 4: Production
- [ ] Audio generation pipeline
- [ ] CDN deployment
- [ ] Analytics integration
- [ ] A/B testing hooks
- [ ] Mobile optimization

---

## COST ANALYSIS (50 Presentations)

| Item | Cost |
|------|------|
| Claude API (generation) | ~$7.50 |
| AWS Polly Neural (audio) | ~$40.00 |
| S3 Storage (annual) | ~$12.00 |
| **Total Initial** | **~$60** |
| **Monthly Storage** | ~$1 |

---

*Specification v2.0 | November 30, 2025*
*Fibonacco Technical Documentation*
