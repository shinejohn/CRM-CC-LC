# MODULE 3: LEARNING CENTER — GAP ANALYSIS

This compares the Module 3 plan in `ob/MODULE-3-LEARNING-CENTER.md` against the current codebase state.

## Completed (Evidence Found)

- **Core tables exist**: `content` table and fields defined, including slides, article_body, audio_base_url, personalization_fields, metadata, and is_active.  
```12:40:backend/database/migrations/2026_01_01_000009_create_content_table.php
        Schema::create('content', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('type', 50);
            $table->string('title');
            $table->string('campaign_id', 50)->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('slides')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('slides')->default('[]');
            }
            $table->text('article_body')->nullable();
            $table->string('audio_base_url')->nullable();
            $table->integer('duration_seconds')->default(60);
            $table->string('service_type', 100)->nullable();
            $table->string('approval_button_text')->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('personalization_fields')->default(DB::raw("'[]'::jsonb"));
                $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('personalization_fields')->default('[]');
                $table->json('metadata')->default('{}');
            }
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
```

- **Content model with casts exists** (slides, personalization_fields, metadata, is_active).  
```8:21:backend/app/Models/Content.php
class Content extends Model
{
    use HasFactory;

    protected $table = 'content';

    protected $guarded = [];

    protected $casts = [
        'slides' => 'array',
        'personalization_fields' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];
}
```

- **Content view tracking table/model exists** (including slides_viewed, approval_clicked, downloaded_pdf).  
```12:35:backend/database/migrations/2026_01_01_000010_create_content_views_table.php
        Schema::create('content_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('smb_id')->nullable()->constrained();
            $table->string('content_slug');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->integer('completion_percentage')->default(0);
            $table->string('source_campaign_id', 50)->nullable();
            $table->text('source_url')->nullable();
            $table->integer('time_on_page_seconds')->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('slides_viewed')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('slides_viewed')->default('[]');
            }
            $table->boolean('approval_clicked')->default(false);
            $table->boolean('downloaded_pdf')->default(false);
            $table->boolean('shared')->default(false);
            $table->timestamps();
        });
```
```8:21:backend/app/Models/ContentView.php
class ContentView extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'slides_viewed' => 'array',
        'approval_clicked' => 'boolean',
        'downloaded_pdf' => 'boolean',
        'shared' => 'boolean',
    ];
}
```

- **Events exist** for `ContentViewed` and `ContentCompleted`.  
```8:17:backend/app/Events/Content/ContentViewed.php
class ContentViewed
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $viewId,
        public int $smbId,
        public string $contentSlug
    ) {
    }
}
```
```8:17:backend/app/Events/Content/ContentCompleted.php
class ContentCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $viewId,
        public int $smbId,
        public string $contentSlug
    ) {
    }
}
```

- **Frontend slide presentation player exists** (React) with audio playback and slide components.  
```51:147:src/components/LearningCenter/Presentation/FibonaccoPlayer.tsx
interface FibonaccoPlayerProps {
  presentation: Presentation;
  autoPlay?: boolean;
  onSlideChange?: (slideId: number) => void;
  onComplete?: () => void;
}
...
  const slides = presentation.slides || [];
  const activeSlide = slides[currentSlide];
  const theme = presentation.meta.theme || 'blue';

  // Audio handling
  useEffect(() => {
    const audioUrl = activeSlide?.audio_url || activeSlide?.audioUrl;
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    ...
  }, [currentSlide, activeSlide?.audio_url, activeSlide?.audioUrl, isPlaying]);
```

## Partial / Divergent From Plan

- **Learning Center content delivery uses static JSON campaign files** instead of the planned `Content` API + personalization pipeline. This is a divergent implementation path.  
```155:232:src/services/learning/campaign-api.ts
// For now, load from static JSON files
// Later this can be migrated to API/database
...
async function loadMasterData(): Promise<{ landing_pages: CampaignLandingPage[] }> {
  if (campaignMasterData) return campaignMasterData;
  try {
    const response = await fetch('/campaigns/landing_pages_master.json');
    if (response.ok) {
      campaignMasterData = await response.json();
      return campaignMasterData!;
    }
  } catch (error) {
    console.error('Failed to load master campaign data:', error);
  }
  return { landing_pages: [] };
}
...
const response = await fetch(`/campaigns/campaign_${campaignId}.json`);
```

- **LearningCenterServiceInterface exists** but no implementation found or bound into the container (service layer missing).  
```8:19:backend/app/Contracts/LearningCenterServiceInterface.php
interface LearningCenterServiceInterface
{
    public function getContent(string $slug): ?Content;
    public function getContentByCampaign(string $campaignId): ?Content;
    public function personalize(Content $content, SMB $smb): array;
    public function trackViewStart(int $smbId, string $slug, array $context): int;
    public function trackSlideView(int $viewId, int $slideNumber): void;
    public function trackViewComplete(int $viewId): void;
    public function trackApprovalClick(int $viewId): void;
    public function trackDownload(int $viewId): void;
}
```

- **`/api/v1/content` routes are for Command Center content generation**, not Learning Center content delivery.  
```213:223:backend/routes/api.php
    // Command Center - Content Generation API
    Route::prefix('content')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ContentGenerationController::class, 'index']);
        Route::post('/generate', [\App\Http\Controllers\Api\ContentGenerationController::class, 'generate']);
        Route::post('/generate-from-campaign', [\App\Http\Controllers\Api\ContentGenerationController::class, 'generateFromCampaign']);
        Route::get('/templates', [\App\Http\Controllers\Api\ContentGenerationController::class, 'templates']);
        Route::post('/templates', [\App\Http\Controllers\Api\ContentGenerationController::class, 'createTemplate']);
        Route::get('/{id}', [\App\Http\Controllers\Api\ContentGenerationController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Api\ContentGenerationController::class, 'update']);
        Route::post('/{id}/status', [\App\Http\Controllers\Api\ContentGenerationController::class, 'updateStatus']);
    });
```

## Missing vs Plan (No Evidence Found)

- **Learning Center Content API**: `GET /api/v1/content`, `GET /api/v1/content/{slug}`, `GET /api/v1/content/{slug}/personalized/{smbId}` not implemented (no controller/routes found for Content delivery).
- **Personalization pipeline** in backend (slide replacements and approval URL generation) not implemented for `Content`.
- **Tracking endpoints** for start/slide/complete/approval-click/download not implemented (no controller or routes found).
- **Statistics endpoint** (`GET /api/v1/content/{slug}/stats`) not implemented.
- **Article endpoints** tied to `Content` (article body + PDF download) not implemented. The existing `ArticleController` manages standalone `Article` records, not `Content`-backed articles.
- **Frontend component spec** in plan is Vue-based (`SlidePresentation.vue`); current implementation is React-based and uses a different data source.
- **Unit tests (80% coverage)** for Learning Center module not found.

## Gap Summary by Acceptance Criteria

- Content CRUD API working — **Missing** (no Learning Center content controllers/routes).
- Personalization working — **Missing** (only client-side personalization for campaigns).
- View tracking (start, slides, complete) — **Missing** (tables exist, endpoints missing).
- Approval URL generation with tokens — **Missing**.
- Article content serving — **Missing** (content-based articles).
- PDF download generation — **Missing** (content-based PDF).
- Statistics API working — **Missing**.
- Frontend component specs documented — **Partial** (React player exists, not plan’s Vue spec).
- Unit tests: 80% coverage — **Missing** (no evidence for Learning Center content tests).



