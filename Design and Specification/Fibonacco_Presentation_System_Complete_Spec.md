# FIBONACCO PRESENTATION SYSTEM
## Complete Specification for Magic Patterns Implementation

---

## SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION PLAYER                          │
│                    (Single Reusable Component)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│   │  JSON File   │───▶│   Player     │◀───│  Audio Files │        │
│   │  (S3/CDN)    │    │   Engine     │    │  (S3/CDN)    │        │
│   └──────────────┘    └──────┬───────┘    └──────────────┘        │
│                              │                                     │
│         ┌────────────────────┼────────────────────┐               │
│         ▼                    ▼                    ▼               │
│   ┌──────────┐        ┌──────────┐        ┌──────────┐           │
│   │Component │        │Component │        │Component │    ...    │
│   │  Pool    │        │  Pool    │        │  Pool    │           │
│   └──────────┘        └──────────┘        └──────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ANSWERS TO YOUR QUESTIONS

### Q: Can components be adaptive / called based on JSON?

**YES.** The JSON file specifies which component to render via the `component` field:

```json
{
  "slides": [
    { "id": 1, "component": "HeroSlide", "content": {...} },
    { "id": 2, "component": "ProblemSlide", "content": {...} },
    { "id": 3, "component": "SolutionSlide", "content": {...} }
  ]
}
```

The player uses a component map to dynamically render:

```javascript
const COMPONENT_MAP = {
  HeroSlide: HeroSlideComponent,
  ProblemSlide: ProblemSlideComponent,
  // ... all components
};

// Player renders whatever the JSON specifies
const CurrentComponent = COMPONENT_MAP[slide.component];
return <CurrentComponent content={slide.content} theme={theme} />;
```

**Benefits:**
- Add new component types without changing the player
- Mix and match components per presentation
- Same player handles all presentations

---

### Q: Where would we store the voice/audio piece?

**S3 bucket, referenced by URL in JSON.** Here's why:

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Embedded in JSON (base64)** | Single file | Huge files (3MB+ per slide), slow loading, can't cache audio separately | ❌ Bad |
| **Database BLOB** | Centralized | Expensive queries, no CDN caching, complex retrieval | ❌ Bad |
| **S3 + URL reference in JSON** | CDN cacheable, fast streaming, cheap storage, easy updates | Requires S3 setup | ✅ Best |

**JSON Structure:**

```json
{
  "audio": {
    "baseUrl": "https://cdn.fibonacco.com/presentations/lp-001/audio/",
    "format": "mp3"
  },
  "slides": [
    {
      "id": 1,
      "component": "HeroSlide",
      "audioFile": "slide-01.mp3",
      "content": {...},
      "narration": "What if you never had to worry about staffing again..."
    }
  ]
}
```

**Player constructs full URL:**
```javascript
const audioUrl = `${presentation.audio.baseUrl}${slide.audioFile}`;
// https://cdn.fibonacco.com/presentations/lp-001/audio/slide-01.mp3
```

---

### Q: Can we create a tool where we hand it JSON and it plays?

**YES.** This is exactly the architecture. The player is a single, reusable component:

```jsx
// USAGE OPTION 1: Pass JSON URL
<FibonaccoPlayer src="https://cdn.fibonacco.com/presentations/lp-001.json" />

// USAGE OPTION 2: Pass JSON directly
<FibonaccoPlayer data={presentationJson} />

// USAGE OPTION 3: Embed code (for non-React sites)
<iframe src="https://play.fibonacco.com/lp-001" />
```

**One player + unlimited JSON files = unlimited presentations.**

---

## FILE STORAGE STRUCTURE

```
s3://fibonacco-presentations/
│
├── player/
│   └── FibonaccoPlayer.js        # The universal player (deploy once)
│
├── presentations/
│   │
│   ├── lp-001-restaurant/
│   │   ├── presentation.json     # Content + audio references
│   │   └── audio/
│   │       ├── slide-01.mp3
│   │       ├── slide-02.mp3
│   │       ├── slide-03.mp3
│   │       └── ...
│   │
│   ├── lp-002-plumber/
│   │   ├── presentation.json
│   │   └── audio/
│   │       └── ...
│   │
│   ├── lp-003-salon/
│   │   └── ...
│   │
│   └── lp-xxx-[industry]/
│       └── ...
│
└── assets/
    ├── presenters/
    │   ├── sarah-avatar.png
    │   ├── marcus-avatar.png
    │   ├── lisa-avatar.png
    │   └── ...
    └── backgrounds/
        └── ...
```

---

## COMPLETE JSON SCHEMA

```json
{
  "$schema": "https://fibonacco.com/schemas/presentation-v1.json",
  
  "meta": {
    "id": "lp-001-restaurant-owner",
    "version": "1.0.0",
    "title": "Restaurant Owner - AI Employee Introduction",
    "description": "Landing page presentation for restaurant owners",
    "targetAudience": "Restaurant owners struggling with staffing",
    "industry": "restaurant",
    "created": "2025-11-30T10:00:00Z",
    "updated": "2025-11-30T10:00:00Z",
    "estimatedDuration": 225,
    "slideCount": 9,
    "tags": ["restaurant", "staffing", "ai-employees"]
  },
  
  "theme": {
    "primary": "#2563eb",
    "secondary": "#7c3aed",
    "accent": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc",
    "textMuted": "#94a3b8",
    "fontFamily": "Inter, system-ui, sans-serif"
  },
  
  "presenter": {
    "id": "sarah",
    "name": "Sarah",
    "role": "AI Account Manager",
    "avatar": "https://cdn.fibonacco.com/presenters/sarah-avatar.png",
    "voiceId": "aws-polly-joanna-neural",
    "personality": "Warm, professional, empathetic"
  },
  
  "audio": {
    "baseUrl": "https://cdn.fibonacco.com/presentations/lp-001-restaurant/audio/",
    "format": "mp3",
    "totalDuration": 225,
    "generated": "2025-11-30T10:30:00Z",
    "voiceSettings": {
      "engine": "neural",
      "rate": "medium",
      "pitch": "medium"
    }
  },
  
  "slides": [
    {
      "id": 1,
      "component": "HeroSlide",
      "audioFile": "slide-01.mp3",
      "duration": 8,
      "transition": "fade",
      "content": {
        "badge": "For Restaurant Owners",
        "headline": "What If You Never Had to Worry About Staffing Again?",
        "accentWord": "Never",
        "subtext": "Meet your new AI employees",
        "icon": "Utensils",
        "backgroundStyle": "gradient"
      },
      "narration": "What if you never had to worry about staffing again? I know that sounds impossible for a restaurant owner, but stick with me for the next few minutes.",
      "notes": "Opening hook - establish the dream state"
    },
    {
      "id": 2,
      "component": "ProblemSlide",
      "audioFile": "slide-02.mp3",
      "duration": 15,
      "transition": "slide",
      "content": {
        "headline": "Sound Familiar?",
        "subheadline": "The daily struggles of restaurant ownership",
        "problems": [
          {
            "icon": "UserX",
            "title": "No-Show Employees",
            "description": "Staff calling in sick on your busiest nights",
            "color": "red"
          },
          {
            "icon": "PhoneMissed",
            "title": "Missed Reservations",
            "description": "Phone rings while everyone's slammed",
            "color": "orange"
          },
          {
            "icon": "Clock",
            "title": "No Time for Marketing",
            "description": "Social media? Website updates? When?",
            "color": "yellow"
          },
          {
            "icon": "DollarSign",
            "title": "Rising Labor Costs",
            "description": "$15/hour minimum and still can't find help",
            "color": "red"
          }
        ]
      },
      "narration": "Let me guess what your week looks like. Employees calling in sick on Friday night. The phone ringing off the hook while your team is slammed. Zero time for marketing because you're just trying to survive each shift. And labor costs eating into every dollar of profit. Am I close?",
      "notes": "Pain point identification - create empathy"
    },
    {
      "id": 3,
      "component": "SolutionSlide",
      "audioFile": "slide-03.mp3",
      "duration": 18,
      "transition": "slide",
      "content": {
        "headline": "Meet Your AI Team",
        "subheadline": "They work 24/7. They never quit. They cost $99/month.",
        "solutions": [
          {
            "icon": "Phone",
            "name": "Lisa",
            "title": "AI Receptionist",
            "description": "Answers every call, takes reservations, handles inquiries. Never puts anyone on hold.",
            "color": "blue"
          },
          {
            "icon": "Share2",
            "name": "Marcus",
            "title": "AI Marketing Manager",
            "description": "Posts daily to social media, writes blog posts, responds to reviews automatically.",
            "color": "purple"
          },
          {
            "icon": "ClipboardList",
            "name": "Emma",
            "title": "AI Operations Manager",
            "description": "Manages your calendar, sends reminders, tracks tasks, keeps everything organized.",
            "color": "green"
          }
        ]
      },
      "narration": "Meet Lisa, your AI receptionist. She answers every single call, takes reservations, and handles customer inquiries - 24 hours a day, 7 days a week. Then there's Marcus, your AI marketing manager. He posts to your social media daily, writes blog content, and even responds to online reviews. And Emma handles operations - managing your calendar, sending reminders, and keeping your business organized.",
      "notes": "Introduce the AI team as real 'employees'"
    },
    {
      "id": 4,
      "component": "ComparisonSlide",
      "audioFile": "slide-04.mp3",
      "duration": 12,
      "transition": "slide",
      "content": {
        "headline": "The Real Cost Comparison",
        "leftColumn": {
          "title": "Traditional Employee",
          "style": "negative",
          "items": [
            "$45,000+ per year salary",
            "Training takes weeks",
            "Calls in sick",
            "Takes vacation",
            "Quits without notice",
            "Works 40 hours max"
          ]
        },
        "rightColumn": {
          "title": "AI Employee",
          "style": "positive",
          "items": [
            "$99/month ($1,188/year)",
            "Ready immediately",
            "Never sick",
            "No vacation needed",
            "Never quits",
            "Works 24/7/365"
          ]
        }
      },
      "narration": "Let's talk real numbers. A traditional employee costs you at least forty-five thousand dollars a year. They need weeks of training, they call in sick, take vacation, and might quit without notice. Your AI employee? Ninety-nine dollars a month. That's under twelve hundred dollars a year. They're ready immediately, never get sick, never take vacation, and never quit. They work around the clock, every single day.",
      "notes": "Cost comparison - make the value obvious"
    },
    {
      "id": 5,
      "component": "StatsSlide",
      "audioFile": "slide-05.mp3",
      "duration": 10,
      "transition": "fade",
      "content": {
        "headline": "Results Our Restaurant Clients See",
        "stats": [
          {
            "icon": "TrendingUp",
            "value": "340",
            "suffix": "%",
            "label": "More Online Visibility"
          },
          {
            "icon": "Phone",
            "value": "100",
            "suffix": "%",
            "label": "Calls Answered"
          },
          {
            "icon": "Clock",
            "value": "15",
            "suffix": "+",
            "label": "Hours Saved Weekly"
          },
          {
            "icon": "DollarSign",
            "value": "44",
            "prefix": "$",
            "suffix": "K",
            "label": "Saved vs. Employee"
          }
        ]
      },
      "narration": "Here's what our restaurant clients actually experience. Three hundred forty percent more online visibility. One hundred percent of calls answered - no more missed reservations. Fifteen plus hours saved every single week. And over forty-four thousand dollars saved compared to hiring a traditional employee.",
      "notes": "Social proof with numbers"
    },
    {
      "id": 6,
      "component": "TestimonialSlide",
      "audioFile": "slide-06.mp3",
      "duration": 12,
      "transition": "fade",
      "content": {
        "quote": "I was skeptical that a robot could answer my phones. Now I can't imagine going back. We've doubled our bookings and I finally have time to actually run my restaurant.",
        "customer": {
          "name": "Maria Santos",
          "title": "Owner",
          "company": "Bella's Bistro",
          "location": "Tampa, FL",
          "avatar": "https://cdn.fibonacco.com/testimonials/maria-santos.jpg"
        },
        "metric": {
          "value": "2X",
          "label": "Bookings Increase"
        }
      },
      "narration": "Don't just take my word for it. Here's Maria Santos, owner of Bella's Bistro in Tampa. She says, 'I was skeptical that a robot could answer my phones. Now I can't imagine going back. We've doubled our bookings and I finally have time to actually run my restaurant.' Maria doubled her bookings. Imagine what that could mean for your bottom line.",
      "notes": "Social proof with real testimonial"
    },
    {
      "id": 7,
      "component": "ProcessSlide",
      "audioFile": "slide-07.mp3",
      "duration": 12,
      "transition": "slide",
      "content": {
        "headline": "Getting Started Takes 10 Minutes",
        "steps": [
          {
            "number": 1,
            "title": "Sign Up",
            "description": "Create your account and select restaurant as your industry",
            "duration": "2 min"
          },
          {
            "number": 2,
            "title": "Connect",
            "description": "Link your phone, social accounts, and calendar",
            "duration": "5 min"
          },
          {
            "number": 3,
            "title": "Customize",
            "description": "AI learns your menu, hours, and how you want calls handled",
            "duration": "3 min"
          },
          {
            "number": 4,
            "title": "Go Live",
            "description": "Your AI team starts working immediately",
            "duration": "Instant"
          }
        ]
      },
      "narration": "Getting started takes about ten minutes. Step one: sign up and select restaurant as your industry - that takes two minutes. Step two: connect your phone number, social accounts, and calendar - about five minutes. Step three: customize how you want your AI team to handle things - your menu, hours, reservation policies. Three more minutes. Step four: you're live. Your AI team starts working immediately.",
      "notes": "Make it feel easy and fast"
    },
    {
      "id": 8,
      "component": "PricingSlide",
      "audioFile": "slide-08.mp3",
      "duration": 10,
      "transition": "fade",
      "content": {
        "headline": "Simple, Transparent Pricing",
        "plan": {
          "name": "Restaurant Pro",
          "badge": "Most Popular",
          "price": "99",
          "period": "month",
          "comparePrice": "vs. $45,000/year for one employee",
          "features": [
            "AI Receptionist (Lisa) - unlimited calls",
            "AI Marketing Manager (Marcus) - daily posts",
            "AI Operations Manager (Emma) - full automation",
            "Integration with Day.News & community calendar",
            "24/7 customer support",
            "No contracts - cancel anytime"
          ]
        },
        "cta": {
          "text": "Start Your Free Trial",
          "subtext": "No credit card required"
        },
        "guarantee": "30-Day Money Back Guarantee"
      },
      "narration": "Our pricing is simple. Ninety-nine dollars a month. That's it. You get Lisa answering unlimited calls, Marcus posting to your social media daily, and Emma managing your operations. Plus integration with our local news and community calendar to boost your visibility. Twenty-four-seven support, and no contracts - cancel anytime. Compare that to forty-five thousand dollars a year for one employee who only works forty hours a week.",
      "notes": "Clear pricing, emphasize value"
    },
    {
      "id": 9,
      "component": "CTASlide",
      "audioFile": "slide-09.mp3",
      "duration": 8,
      "transition": "fade",
      "content": {
        "headline": "Ready to Transform Your Restaurant?",
        "subtext": "Your AI team is ready to start today.",
        "primaryButton": {
          "text": "Start Free Trial",
          "url": "/signup?industry=restaurant&src=presentation-lp001",
          "style": "gradient"
        },
        "secondaryButton": {
          "text": "Schedule a Demo",
          "url": "/demo?industry=restaurant",
          "style": "outline"
        },
        "urgency": "Limited: We're onboarding 50 restaurants this month",
        "trust": [
          "No credit card required",
          "Set up in 10 minutes",
          "Cancel anytime"
        ]
      },
      "narration": "So, are you ready to transform your restaurant? Your AI team - Lisa, Marcus, and Emma - are ready to start working for you today. Click 'Start Free Trial' to begin - no credit card required. Or if you'd like to see a personalized demo first, click 'Schedule a Demo' and I'll walk you through everything. We're only onboarding fifty restaurants this month, so don't wait. I'm Sarah, and I look forward to helping you succeed.",
      "notes": "Strong CTA with urgency"
    }
  ],
  
  "callToAction": {
    "primary": {
      "text": "Start Free Trial",
      "url": "/signup?industry=restaurant&src=presentation-lp001",
      "style": "gradient",
      "tracking": {
        "event": "cta_click",
        "label": "primary_trial"
      }
    },
    "secondary": {
      "text": "Schedule Demo",
      "url": "/demo?industry=restaurant",
      "style": "outline",
      "tracking": {
        "event": "cta_click", 
        "label": "secondary_demo"
      }
    }
  },
  
  "analytics": {
    "trackSlideViews": true,
    "trackAudioProgress": true,
    "trackCTAClicks": true,
    "trackCompletions": true,
    "pixelId": "fb-pixel-123",
    "gtmId": "GTM-XXXXX"
  }
}
```

---

## MAGIC PATTERNS COMPONENT SPECIFICATIONS

### Design System Foundation

**Before creating components, establish these base styles:**

```css
/* Color Tokens */
--color-primary: #2563eb;
--color-secondary: #7c3aed;
--color-accent: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-background: #0f172a;
--color-surface: #1e293b;
--color-text: #f8fafc;
--color-text-muted: #94a3b8;

/* Typography */
--font-family: 'Inter', system-ui, sans-serif;
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
--font-size-4xl: 36px;
--font-size-5xl: 48px;
--font-size-6xl: 60px;

/* Spacing */
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-12: 48px;
--spacing-16: 64px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
--shadow-glow: 0 0 40px rgba(37,99,235,0.3);

/* Animations */
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
--transition-slow: 500ms ease;
```

---

## COMPONENT 1: HeroSlide

### Magic Patterns Prompt

> Create a hero slide component for a presentation player. Full-width, dark gradient background (blue to purple). Centered content with:
> - Small pill/badge at top (light background, dark text)
> - Large bold headline (48-60px) with one word in accent color (green)
> - Smaller subtext below
> - Decorative icon (semi-transparent, bottom right)
> - Subtle animated dot grid pattern in background
> - All content should animate in on mount (fade up, staggered)

### Props

```typescript
interface HeroSlideProps {
  content: {
    badge?: string;
    headline: string;
    accentWord?: string;
    subtext?: string;
    icon?: string;
  };
  theme: Theme;
}
```

### Visual Reference

```
┌────────────────────────────────────────────────────────────────┐
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  │
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  │
│                                                                │
│                   ╭──────────────────────╮                     │
│                   │  For Restaurant Owners │                   │
│                   ╰──────────────────────╯                     │
│                                                                │
│           What If You Never Had to                             │
│           Worry About Staffing Again?                          │
│                  ▲                                              │
│                  │ "Never" in #10b981 (green)                  │
│                                                                │
│              Meet your new AI employees                        │
│                                                                │
│                                              🍴                │
│                                           (40% opacity)        │
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  │
└────────────────────────────────────────────────────────────────┘
  Background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)
```

---

## COMPONENT 2: ProblemSlide

### Magic Patterns Prompt

> Create a problem/pain-point slide with dark background (#0f172a). Contains:
> - Headline at top center
> - 2x2 grid of problem cards
> - Each card: dark surface (#1e293b), colored left border (red/orange/yellow), icon in matching color, title (white), description (gray)
> - Cards have subtle red glow on hover
> - Staggered animation: cards appear one by one

### Props

```typescript
interface ProblemSlideProps {
  content: {
    headline: string;
    subheadline?: string;
    problems: Array<{
      icon: string;
      title: string;
      description: string;
      color?: string;
    }>;
  };
  theme: Theme;
}
```

### Visual Reference

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                       Sound Familiar?                          │
│              The daily struggles of restaurant ownership       │
│                                                                │
│     ┌─────────────────────────┐  ┌─────────────────────────┐  │
│     │▌                        │  │▌                        │  │
│     │▌  👤✕  No-Show          │  │▌  📞  Missed            │  │
│     │▌      Employees         │  │▌      Reservations      │  │
│     │▌                        │  │▌                        │  │
│     │▌  Staff calling in      │  │▌  Phone rings while     │  │
│     │▌  sick on your busiest  │  │▌  everyone's slammed    │  │
│     │▌  nights                │  │▌                        │  │
│     └─────────────────────────┘  └─────────────────────────┘  │
│     ▲ red border                  ▲ orange border             │
│                                                                │
│     ┌─────────────────────────┐  ┌─────────────────────────┐  │
│     │▌  ⏰  No Time for       │  │▌  💰  Rising Labor      │  │
│     │▌      Marketing         │  │▌      Costs             │  │
│     │▌                        │  │▌                        │  │
│     │▌  Social media?         │  │▌  $15/hour minimum      │  │
│     │▌  Website updates?      │  │▌  and still can't       │  │
│     │▌  When?                 │  │▌  find help             │  │
│     └─────────────────────────┘  └─────────────────────────┘  │
│     ▲ yellow border               ▲ red border                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## COMPONENT 3: SolutionSlide

### Magic Patterns Prompt

> Create a solution/feature slide with subtle gradient background (dark blue to purple, subtle). Contains:
> - Headline and subheadline centered at top
> - 3 feature cards in a row (flex, gap)
> - Each card: white/light background, colored top bar (8px), large icon, name in bold, title below, description paragraph
> - Cards have elevation shadow, slight lift on hover
> - Staggered entrance animation

### Props

```typescript
interface SolutionSlideProps {
  content: {
    headline: string;
    subheadline?: string;
    solutions: Array<{
      icon: string;
      name: string;
      title: string;
      description: string;
      color: string;
    }>;
  };
  theme: Theme;
}
```

### Visual Reference

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                     Meet Your AI Team                          │
│         They work 24/7. They never quit. They cost $99/month.  │
│                                                                │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   │▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│ │▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│ │▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│
│   │ blue bar          │ │ purple bar        │ │ green bar        │
│   │                   │ │                   │ │                  │
│   │       📞          │ │       📱          │ │       📋         │
│   │                   │ │                   │ │                  │
│   │      Lisa         │ │     Marcus        │ │      Emma        │
│   │  AI Receptionist  │ │ AI Marketing Mgr  │ │  AI Operations   │
│   │                   │ │                   │ │                  │
│   │ Answers every     │ │ Posts daily to    │ │ Manages your     │
│   │ call, takes       │ │ social media,     │ │ calendar, sends  │
│   │ reservations,     │ │ writes blog       │ │ reminders,       │
│   │ handles inquiries │ │ posts, responds   │ │ tracks tasks     │
│   │                   │ │ to reviews        │ │                  │
│   └──────────────────┘ └──────────────────┘ └──────────────────┘
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## COMPONENT 4: ComparisonSlide

### Magic Patterns Prompt

> Create a comparison slide with two columns (50/50 split). 
> - Left column: red/dark theme representing "without" or "before" - header with X icon, list with X marks, subtle red background tint
> - Right column: green/light theme representing "with" or "after" - header with checkmark, list with checkmarks, subtle green background tint
> - Central divider line
> - Headline above the columns
> - Items animate in alternating left/right

### Props

```typescript
interface ComparisonSlideProps {
  content: {
    headline: string;
    leftColumn: {
      title: string;
      style: "negative" | "neutral";
      items: string[];
    };
    rightColumn: {
      title: string;
      style: "positive";
      items: string[];
    };
  };
  theme: Theme;
}
```

### Visual Reference

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                   The Real Cost Comparison                     │
│                                                                │
│   ┌─────────────────────────┬─────────────────────────┐       │
│   │                         │                         │       │
│   │   ✕ Traditional         │   ✓ AI Employee         │       │
│   │     Employee            │                         │       │
│   │─────────────────────────│─────────────────────────│       │
│   │                         │                         │       │
│   │ ✗ $45,000+ per year    │ ✓ $99/month            │       │
│   │                         │                         │       │
│   │ ✗ Training takes weeks │ ✓ Ready immediately    │       │
│   │                         │                         │       │
│   │ ✗ Calls in sick        │ ✓ Never sick           │       │
│   │                         │                         │       │
│   │ ✗ Takes vacation       │ ✓ No vacation needed   │       │
│   │                         │                         │       │
│   │ ✗ Quits without notice │ ✓ Never quits          │       │
│   │                         │                         │       │
│   │ ✗ Works 40 hours max   │ ✓ Works 24/7/365       │       │
│   │                         │                         │       │
│   │   (red tint bg)         │   (green tint bg)       │       │
│   └─────────────────────────┴─────────────────────────┘       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## COMPONENT 5: StatsSlide

### Magic Patterns Prompt

> Create a statistics slide with gradient background (purple to blue). Contains:
> - Headline centered at top
> - 4 stat cards in a row
> - Each card: glassmorphism effect (semi-transparent white, blur), icon at top, large number (animated count-up), small label below
> - Cards have subtle glow effect
> - Numbers animate counting up when slide appears

### Props

```typescript
interface StatsSlideProps {
  content: {
    headline: string;
    stats: Array<{
      icon: string;
      value: string;
      prefix?: string;
      suffix?: string;
      label: string;
    }>;
  };
  theme: Theme;
}
```

### Visual Reference

```
┌────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓  gradient: #7c3aed → #2563eb                               ▓ │
│ ▓                                                            ▓ │
│ ▓               Results Our Restaurant Clients See           ▓ │
│ ▓                                                            ▓ │
│ ▓   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      ▓ │
│ ▓   │░░░░░░░░░│  │░░░░░░░░░│  │░░░░░░░░░│  │░░░░░░░░░│      ▓ │
│ ▓   │░  📈   ░│  │░  📞   ░│  │░  ⏰   ░│  │░  💰   ░│      ▓ │
│ ▓   │░       ░│  │░       ░│  │░       ░│  │░       ░│      ▓ │
│ ▓   │░ 340%  ░│  │░ 100%  ░│  │░  15+  ░│  │░ $44K  ░│      ▓ │
│ ▓   │░       ░│  │░       ░│  │░       ░│  │░       ░│      ▓ │
│ ▓   │░ More   ░│  │░ Calls ░│  │░ Hours ░│  │░ Saved ░│      ▓ │
│ ▓   │░Visible ░│  │░Answer.░│  │░ Saved ░│  │░ /Year ░│      ▓ │
│ ▓   │░░░░░░░░░│  │░░░░░░░░░│  │░░░░░░░░░│  │░░░░░░░░░│      ▓ │
│ ▓   └─────────┘  └─────────┘  └─────────┘  └─────────┘      ▓ │
│ ▓    glassmorphism: rgba(255,255,255,0.1) + blur(10px)      ▓ │
│ ▓                                                            ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└────────────────────────────────────────────────────────────────┘
```

---

## COMPONENT 6: TestimonialSlide

### Magic Patterns Prompt

> Create a testimonial slide with dark elegant background. Contains:
> - Large decorative quotation marks (64px, very low opacity)
> - Customer quote in large italic text (24px)
> - Customer info section: circular avatar, name, title, company, location
> - Optional metric badge (e.g., "2X Bookings") with green accent
> - Subtle spotlight/glow effect behind the quote

### Props

```typescript
interface TestimonialSlideProps {
  content: {
    quote: string;
    customer: {
      name: string;
      title: string;
      company: string;
      location?: string;
      avatar?: string;
    };
    metric?: {
      value: string;
      label: string;
    };
  };
  theme: Theme;
}
```

---

## COMPONENT 7: ProcessSlide

### Magic Patterns Prompt

> Create a process/how-it-works slide with light background. Contains:
> - Headline at top
> - 4 steps in horizontal flow
> - Each step: numbered circle (gradient fill), title, description, optional time indicator
> - Connecting lines/arrows between steps
> - Steps animate in sequence (left to right)

### Props

```typescript
interface ProcessSlideProps {
  content: {
    headline: string;
    steps: Array<{
      number: number;
      title: string;
      description: string;
      duration?: string;
      icon?: string;
    }>;
  };
  theme: Theme;
}
```

---

## COMPONENT 8: PricingSlide

### Magic Patterns Prompt

> Create a pricing slide with light background. Contains:
> - Headline centered at top
> - Single centered pricing card with shadow
> - Card has: "Most Popular" badge at top, plan name, large price ($99), period (/month), comparison text, feature list with checkmarks, CTA button (gradient), subtext
> - Guarantee badge at bottom with shield icon
> - Card has subtle animation (float effect)

### Props

```typescript
interface PricingSlideProps {
  content: {
    headline: string;
    plan: {
      name: string;
      badge?: string;
      price: string;
      period: string;
      comparePrice?: string;
      features: string[];
    };
    cta: {
      text: string;
      subtext?: string;
    };
    guarantee?: string;
  };
  theme: Theme;
}
```

---

## COMPONENT 9: CTASlide

### Magic Patterns Prompt

> Create a final call-to-action slide with vibrant gradient background (blue to purple to pink). Contains:
> - Large compelling headline
> - Supportive subtext
> - Two buttons side by side: primary (white/filled, gradient border) and secondary (outline only)
> - Urgency text below buttons
> - Trust badges (no credit card, cancel anytime, etc.)
> - Animated particle/sparkle effects in background
> - Everything pulses subtly to draw attention

### Props

```typescript
interface CTASlideProps {
  content: {
    headline: string;
    subtext?: string;
    primaryButton: {
      text: string;
      url: string;
      style?: string;
    };
    secondaryButton?: {
      text: string;
      url: string;
      style?: string;
    };
    urgency?: string;
    trust?: string[];
  };
  theme: Theme;
}
```

---

## PLAYER COMPONENT

### Magic Patterns Prompt

> Create a presentation player container. 16:9 aspect ratio. Contains:
> - Main slide area (where slide components render)
> - Right sidebar: AI presenter panel (avatar, name, role, current narration text - scrolling)
> - Bottom: control bar (prev/next arrows, play/pause, progress dots, volume, timer)
> - Top right: settings gear, fullscreen button
> - Smooth transitions between slides
> - Responsive: on mobile, presenter panel moves below slide

### Visual Reference

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                          ⚙️  🔳       │
├──────────────────────────────────────────────────────┬─────────────────┤
│                                                      │                 │
│                                                      │    ┌─────┐      │
│                                                      │    │ 👩  │      │
│                                                      │    └─────┘      │
│                                                      │                 │
│              [ SLIDE CONTENT AREA ]                  │     Sarah       │
│                                                      │  AI Account Mgr │
│                                                      │                 │
│              Renders current slide component         │ ─────────────── │
│              based on JSON                           │                 │
│                                                      │ "What if you    │
│                                                      │  never had to   │
│                                                      │  worry about    │
│                                                      │  staffing       │
│                                                      │  again? I know  │
│                                                      │  that sounds..."│
│                                                      │                 │
├──────────────────────────────────────────────────────┴─────────────────┤
│                                                                        │
│  ◀️   ▶️ ⏸️                 ● ● ● ○ ○ ○ ○ ○ ○               🔊  2:45   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ADDITIONAL COMPONENTS (FUTURE)

| Component | Purpose | Priority |
|-----------|---------|----------|
| FeatureGridSlide | 6 features in 3x2 grid | Medium |
| TimelineSlide | Roadmap or history | Medium |
| FAQSlide | Address objections | High |
| VideoSlide | Embed demo video | Low |
| TeamSlide | Show team members | Low |
| LogoCloudSlide | Partner/client logos | Medium |
| ChecklistSlide | Implementation checklist | Medium |
| ROICalculatorSlide | Interactive calculator | Low |

---

## GENERATION PIPELINE

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION FACTORY                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐                                                    │
│  │   INPUT     │                                                    │
│  │   BRIEF     │                                                    │
│  │             │                                                    │
│  │ • Industry  │                                                    │
│  │ • Persona   │                                                    │
│  │ • Pain pts  │                                                    │
│  │ • Presenter │                                                    │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐         │
│  │   CLAUDE    │ ───▶ │   AUDIO     │ ───▶ │   DEPLOY    │         │
│  │  GENERATES  │      │  PIPELINE   │      │     TO      │         │
│  │    JSON     │      │             │      │     S3      │         │
│  │             │      │ • Parse     │      │             │         │
│  │ • Slides    │      │   narration │      │ • JSON      │         │
│  │ • Content   │      │ • AWS Polly │      │ • Audio/    │         │
│  │ • Narration │      │ • Upload    │      │ • CDN       │         │
│  │ • CTA       │      │   to S3     │      │   invalidate│         │
│  └─────────────┘      └─────────────┘      └─────────────┘         │
│                                                                     │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │   LANDING PAGE                                              │   │
│  │   ┌─────────────────────────────────────────────────────┐   │   │
│  │   │                                                     │   │   │
│  │   │   <FibonaccoPlayer                                  │   │   │
│  │   │     src="https://cdn.../lp-001/presentation.json"   │   │   │
│  │   │   />                                                │   │   │
│  │   │                                                     │   │   │
│  │   └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## COST SUMMARY

| Item | Per Presentation | 50 Presentations |
|------|------------------|------------------|
| Claude API (JSON generation) | $0.15 | $7.50 |
| AWS Polly Neural (~3 min) | $0.80 | $40.00 |
| S3 Storage (~5MB) | $0.001/mo | $0.05/mo |
| CloudFront (10K views) | - | ~$5/mo |
| **Total One-Time** | **~$1.00** | **~$50** |
| **Total Monthly** | **~$0.10** | **~$5** |

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Component Library (Magic Patterns)
- [ ] Design system tokens (colors, typography, spacing)
- [ ] HeroSlide component
- [ ] ProblemSlide component
- [ ] SolutionSlide component
- [ ] ComparisonSlide component
- [ ] StatsSlide component
- [ ] TestimonialSlide component
- [ ] ProcessSlide component
- [ ] PricingSlide component
- [ ] CTASlide component
- [ ] PresenterPanel component
- [ ] PlayerControls component

### Phase 2: Player Development
- [ ] FibonaccoPlayer main component
- [ ] Component mapping system
- [ ] JSON loading and parsing
- [ ] Audio loading and sync
- [ ] Navigation logic
- [ ] Keyboard shortcuts
- [ ] Responsive design
- [ ] Web component wrapper

### Phase 3: Infrastructure
- [ ] S3 bucket structure
- [ ] CloudFront CDN setup
- [ ] AWS Polly integration
- [ ] Generation pipeline script
- [ ] Deployment automation

### Phase 4: Content Creation
- [ ] Industry brief templates
- [ ] Claude prompt engineering
- [ ] First 10 presentations
- [ ] Testing and refinement
- [ ] Scale to 50 presentations

---

## SUMMARY

**What you're getting:**

1. **12 slide components** - Beautifully designed, fully responsive React components that render based on JSON content

2. **1 universal player** - Load any JSON file, it plays automatically with the right components

3. **Audio stored in S3** - Referenced by URL in JSON, streamed via CDN, easy to update

4. **Adaptive component system** - JSON specifies component type, player renders it dynamically

5. **Single tool, unlimited presentations** - Deploy player once, create infinite presentations with just JSON files

**The magic:** Hand the player a JSON URL → it loads content, loads audio, renders slides, syncs narration → professional presentation plays automatically.
