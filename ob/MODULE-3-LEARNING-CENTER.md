# MODULE 3: LEARNING CENTER
## Content Delivery Platform

**Owner:** Agent 3
**Timeline:** Week 3-5
**Dependencies:** Module 0 (Core Infrastructure)
**Blocks:** None (parallel)

---

## OBJECTIVE

Build the Learning Center content delivery platform with slide-based presentations, audio narration, personalization, and integrated approval CTAs.

---

## TABLES OWNED

- `content`
- `content_views`

---

## INTERFACE TO IMPLEMENT

```php
// Implement: App\Contracts\LearningCenterServiceInterface
```

---

## FEATURES TO BUILD

### 1. Content Management

```php
// app/Models/Content.php

class Content extends Model
{
    protected $table = 'content';
    
    protected $fillable = [
        'slug',
        'type',  // 'edu', 'hook', 'howto', 'article'
        'title',
        'campaign_id',
        'slides',
        'article_body',
        'audio_base_url',
        'duration_seconds',
        'service_type',
        'approval_button_text',
        'personalization_fields',
        'metadata',
        'is_active',
    ];
    
    protected $casts = [
        'slides' => 'array',
        'personalization_fields' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];
    
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
    
    public function views(): HasMany
    {
        return $this->hasMany(ContentView::class, 'content_slug', 'slug');
    }
}
```

### 2. Content API

```php
// app/Http/Controllers/Api/V1/ContentController.php

class ContentController extends Controller
{
    // GET /api/v1/content
    public function index(Request $request)
    {
        return Content::query()
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->paginate();
    }
    
    // GET /api/v1/content/{slug}
    public function show(string $slug, Request $request)
    {
        $content = Content::where('slug', $slug)->firstOrFail();
        
        // If SMB ID provided, personalize content
        if ($smbId = $request->get('smb_id')) {
            $smb = SMB::find($smbId);
            if ($smb) {
                $content = $this->personalize($content, $smb);
            }
        }
        
        return $content;
    }
    
    // GET /api/v1/content/{slug}/personalized/{smbId}
    public function personalized(string $slug, int $smbId)
    {
        $content = Content::where('slug', $slug)->firstOrFail();
        $smb = SMB::findOrFail($smbId);
        
        return $this->personalize($content, $smb);
    }
    
    protected function personalize(Content $content, SMB $smb): array
    {
        $data = $content->toArray();
        
        // Personalize slides
        $data['slides'] = array_map(function ($slide) use ($smb) {
            return $this->personalizeSlide($slide, $smb);
        }, $data['slides']);
        
        // Add personalized approval URL
        $data['approval_url'] = $this->generateApprovalUrl($content, $smb);
        
        // Add personalized data
        $data['personalization'] = [
            'business_name' => $smb->business_name,
            'community' => $smb->community->name,
            'first_name' => explode(' ', $smb->primary_contact_name)[0] ?? '',
        ];
        
        return $data;
    }
    
    protected function personalizeSlide(array $slide, SMB $smb): array
    {
        // Replace placeholders in slide content
        $replacements = [
            '{{business_name}}' => $smb->business_name,
            '{{community}}' => $smb->community->name,
            '{{first_name}}' => explode(' ', $smb->primary_contact_name)[0] ?? 'there',
            '{{category}}' => $smb->category ?? 'business',
        ];
        
        if (isset($slide['content'])) {
            $slide['content'] = str_replace(
                array_keys($replacements),
                array_values($replacements),
                $slide['content']
            );
        }
        
        if (isset($slide['headline'])) {
            $slide['headline'] = str_replace(
                array_keys($replacements),
                array_values($replacements),
                $slide['headline']
            );
        }
        
        return $slide;
    }
    
    protected function generateApprovalUrl(Content $content, SMB $smb): string
    {
        $token = app(ApprovalServiceInterface::class)->generateToken(
            $smb->id,
            $content->service_type,
            $content->slug
        );
        
        return url("/approve?task={$content->service_type}&smb={$smb->id}&source={$content->slug}&token={$token}");
    }
}
```

### 3. Content View Tracking

```php
// app/Http/Controllers/Api/V1/ContentTrackingController.php

class ContentTrackingController extends Controller
{
    // POST /api/v1/content/{slug}/track/start
    public function trackStart(string $slug, Request $request)
    {
        $request->validate([
            'smb_id' => 'nullable|exists:smbs,id',
            'source_campaign_id' => 'nullable|string',
            'source_url' => 'nullable|url',
        ]);
        
        $view = ContentView::create([
            'smb_id' => $request->smb_id,
            'content_slug' => $slug,
            'started_at' => now(),
            'source_campaign_id' => $request->source_campaign_id,
            'source_url' => $request->source_url,
        ]);
        
        if ($request->smb_id) {
            event(new ContentViewed($view->id, $request->smb_id, $slug));
        }
        
        return response()->json([
            'view_id' => $view->id,
        ]);
    }
    
    // POST /api/v1/content/{slug}/track/slide
    public function trackSlide(string $slug, Request $request)
    {
        $request->validate([
            'view_id' => 'required|exists:content_views,id',
            'slide_number' => 'required|integer',
        ]);
        
        $view = ContentView::findOrFail($request->view_id);
        
        $slidesViewed = $view->slides_viewed ?? [];
        if (!in_array($request->slide_number, $slidesViewed)) {
            $slidesViewed[] = $request->slide_number;
        }
        
        $content = Content::where('slug', $slug)->first();
        $totalSlides = count($content->slides ?? []);
        $completion = $totalSlides > 0 
            ? round((count($slidesViewed) / $totalSlides) * 100) 
            : 0;
        
        $view->update([
            'slides_viewed' => $slidesViewed,
            'completion_percentage' => $completion,
        ]);
        
        return response()->json(['completion' => $completion]);
    }
    
    // POST /api/v1/content/{slug}/track/complete
    public function trackComplete(string $slug, Request $request)
    {
        $request->validate([
            'view_id' => 'required|exists:content_views,id',
            'time_on_page_seconds' => 'nullable|integer',
        ]);
        
        $view = ContentView::findOrFail($request->view_id);
        
        $view->update([
            'completed_at' => now(),
            'completion_percentage' => 100,
            'time_on_page_seconds' => $request->time_on_page_seconds,
        ]);
        
        if ($view->smb_id) {
            event(new ContentCompleted($view->id, $view->smb_id, $slug));
        }
        
        return response()->json(['success' => true]);
    }
    
    // POST /api/v1/content/{slug}/track/approval-click
    public function trackApprovalClick(string $slug, Request $request)
    {
        $request->validate([
            'view_id' => 'required|exists:content_views,id',
        ]);
        
        ContentView::where('id', $request->view_id)->update([
            'approval_clicked' => true,
        ]);
        
        return response()->json(['success' => true]);
    }
    
    // POST /api/v1/content/{slug}/track/download
    public function trackDownload(string $slug, Request $request)
    {
        $request->validate([
            'view_id' => 'required|exists:content_views,id',
        ]);
        
        ContentView::where('id', $request->view_id)->update([
            'downloaded_pdf' => true,
        ]);
        
        return response()->json(['success' => true]);
    }
}
```

### 4. Content Renderer (Frontend Component Specs)

```javascript
// Frontend component specifications for Vue.js

/*
 * SlidePresentation.vue
 * 
 * Props:
 * - content: Object (from API)
 * - smbId: Number (optional, for tracking)
 * - autoPlay: Boolean (default: true)
 * 
 * Features:
 * - Slides render based on component type
 * - Audio plays automatically with each slide
 * - Progress bar shows completion
 * - Approval CTA appears after slide 4 (configurable)
 * - End screen shows approval CTA + related content
 * 
 * Events:
 * - @slide-change(slideNumber)
 * - @complete
 * - @approval-click
 * - @download
 */

// Slide component types:
const SLIDE_COMPONENTS = {
  'HeroSlide': {
    // Full-screen image/video with headline
    layout: 'full-screen',
    hasAudio: true,
  },
  'ConceptSlide': {
    // Text content with optional image
    layout: 'split',
    hasAudio: true,
  },
  'DataSlide': {
    // Statistics, charts, numbers
    layout: 'centered',
    hasAudio: true,
  },
  'StepSlide': {
    // Step-by-step instruction
    layout: 'numbered',
    hasAudio: true,
  },
  'ComparisonSlide': {
    // Before/after or comparison
    layout: 'side-by-side',
    hasAudio: true,
  },
  'CTASlide': {
    // Call to action
    layout: 'centered',
    hasApprovalButton: true,
    hasAudio: true,
  },
};
```

### 5. Article Content

```php
// app/Http/Controllers/Api/V1/ArticleController.php

class ArticleController extends Controller
{
    // GET /api/v1/content/{slug}/article
    public function show(string $slug, Request $request)
    {
        $content = Content::where('slug', $slug)->firstOrFail();
        
        if (!$content->article_body) {
            return response()->json(['error' => 'No article content'], 404);
        }
        
        $article = [
            'title' => $content->title,
            'body' => $content->article_body,
            'related_content' => $this->getRelatedContent($content),
        ];
        
        // Personalize if SMB provided
        if ($smbId = $request->get('smb_id')) {
            $smb = SMB::find($smbId);
            if ($smb) {
                $article['body'] = $this->personalizeArticle($article['body'], $smb);
                $article['approval_url'] = $this->generateApprovalUrl($content, $smb);
            }
        }
        
        return $article;
    }
    
    // GET /api/v1/content/{slug}/article/pdf
    public function downloadPdf(string $slug, Request $request)
    {
        $content = Content::where('slug', $slug)->firstOrFail();
        
        // Track download
        if ($viewId = $request->get('view_id')) {
            ContentView::where('id', $viewId)->update(['downloaded_pdf' => true]);
        }
        
        // Generate PDF
        $pdf = PDF::loadView('articles.pdf', [
            'content' => $content,
        ]);
        
        return $pdf->download($content->slug . '.pdf');
    }
    
    protected function getRelatedContent(Content $content): array
    {
        // Get related content based on service type or campaign
        return Content::query()
            ->where('slug', '!=', $content->slug)
            ->where(function ($q) use ($content) {
                $q->where('service_type', $content->service_type)
                  ->orWhere('type', $content->type);
            })
            ->where('is_active', true)
            ->limit(3)
            ->get(['slug', 'title', 'type', 'duration_seconds'])
            ->toArray();
    }
}
```

### 6. Content Statistics

```php
// GET /api/v1/content/{slug}/stats
public function stats(string $slug)
{
    $content = Content::where('slug', $slug)->firstOrFail();
    
    $views = ContentView::where('content_slug', $slug);
    
    return [
        'total_views' => $views->count(),
        'unique_smb_views' => $views->whereNotNull('smb_id')->distinct('smb_id')->count(),
        'completions' => $views->whereNotNull('completed_at')->count(),
        'completion_rate' => $this->calculateCompletionRate($views),
        'avg_time_on_page' => $views->avg('time_on_page_seconds'),
        'approval_clicks' => $views->where('approval_clicked', true)->count(),
        'downloads' => $views->where('downloaded_pdf', true)->count(),
        'by_source' => $this->getViewsBySource($slug),
    ];
}
```

---

## API ENDPOINTS

```
GET    /api/v1/content                           # List content
GET    /api/v1/content/{slug}                    # Get content
GET    /api/v1/content/{slug}/personalized/{smbId}  # Personalized content
GET    /api/v1/content/{slug}/stats              # Content statistics

POST   /api/v1/content/{slug}/track/start        # Track view start
POST   /api/v1/content/{slug}/track/slide        # Track slide view
POST   /api/v1/content/{slug}/track/complete     # Track completion
POST   /api/v1/content/{slug}/track/approval-click  # Track approval click
POST   /api/v1/content/{slug}/track/download     # Track download

GET    /api/v1/content/{slug}/article            # Get article body
GET    /api/v1/content/{slug}/article/pdf        # Download PDF
```

---

## CONTENT DATA STRUCTURE

```json
{
  "slug": "appointment-booking-setup",
  "type": "howto",
  "title": "Set Up Online Appointment Booking",
  "campaign_id": "HOWTO-004",
  "service_type": "appointment_booking",
  "approval_button_text": "Yes, set up online booking",
  "duration_seconds": 60,
  "audio_base_url": "https://cdn.fibonacco.com/audio/howto-004/",
  "slides": [
    {
      "id": 1,
      "component": "HeroSlide",
      "headline": "Never Miss a Booking Again",
      "subheadline": "Set up online scheduling in 5 minutes",
      "background_image": "hero-booking.jpg",
      "audio_file": "slide-01.mp3"
    },
    {
      "id": 2,
      "component": "ConceptSlide",
      "headline": "Why Online Booking Matters",
      "content": "Businesses with online booking see 30% more appointments...",
      "image": "concept-booking.jpg",
      "audio_file": "slide-02.mp3"
    },
    {
      "id": 3,
      "component": "StepSlide",
      "step_number": 1,
      "headline": "Connect Your Calendar",
      "content": "Sync with Google Calendar, Outlook, or use our built-in calendar...",
      "audio_file": "slide-03.mp3"
    },
    {
      "id": 4,
      "component": "StepSlide",
      "step_number": 2,
      "headline": "Set Your Availability",
      "content": "Choose which hours you're available for bookings...",
      "audio_file": "slide-04.mp3",
      "show_approval_cta": true
    },
    {
      "id": 5,
      "component": "CTASlide",
      "headline": "Ready to Get Started?",
      "approval_button": true,
      "audio_file": "slide-05.mp3"
    }
  ],
  "personalization_fields": ["business_name", "community", "first_name"],
  "metadata": {
    "upsells": ["sms_reminders", "calendar_sync"],
    "meeting_topic": "Optimize your booking flow"
  }
}
```

---

## EVENTS TO EMIT

```php
ContentViewed::class      // When view starts
ContentCompleted::class   // When view completes
```

---

## ACCEPTANCE CRITERIA

- [ ] Content CRUD API working
- [ ] Personalization working (business name, community, etc.)
- [ ] View tracking (start, slides, complete)
- [ ] Approval URL generation with tokens
- [ ] Article content serving
- [ ] PDF download generation
- [ ] Statistics API working
- [ ] Frontend component specs documented
- [ ] Unit tests: 80% coverage
