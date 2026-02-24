# ADDENDUM: Social Platform Syndication
### Supplement to: Fibonacco Monetization & Commerce — Multi-Agent Cursor Implementation Guide

---

## OVERVIEW

Day.News and GoEventCity both operate native social platforms with feeds, groups, and activity streams. This addendum extends Agent 10 (Cross-Platform Content Syndication) to include these social layers as first-class syndication targets.

When paid commercial content is published, it automatically creates a formatted **social post** on the author's Day.News and/or GoEventCity social profile — driving organic discovery, follower engagement, and viral distribution through the existing social graph.

**Key principle:** Social syndication is an *amplification layer* on top of platform syndication. A coupon gets listed in the DowntownGuide directory (Agent 10 platform syndication) AND generates a social post in the author's Day.News feed (this addendum). Both happen from the same `SyndicateContentJob`.

---

## AGENT 12: Social Platform Syndication

**Depends on:** Agent 10 (ContentSyndicationService and SyndicatedContent model must exist)

**Run after Agent 10 completes.**

---

### Syndication Target Map (UPDATED)

Replace the `SYNDICATION_MAP` constant in `ContentSyndicationService` with this expanded version that adds social targets:

```php
private const SYNDICATION_MAP = [
    'announcement' => [
        'platforms' => ['daynews'],
        'social'    => ['daynews_social'],
        // Announcements are personal milestones — great social content, Day.News only
    ],
    'classified' => [
        'platforms' => ['daynews', 'downtownguide'],
        'social'    => ['daynews_social'],
        // Classifieds appear in directory + one social post to announce the listing
    ],
    'coupon' => [
        'platforms' => ['daynews', 'downtownguide', 'goeventcity'],
        'social'    => ['daynews_social', 'goeventcity_social'],
        // Coupons are promotional — max social reach across both platforms
    ],
    'legal_notice' => [
        'platforms' => ['daynews'],
        'social'    => [],
        // Legal notices are never social — formal publication only
    ],
    'ad_campaign' => [
        'platforms' => [],
        'social'    => [],
        // Ad serving handles its own delivery; no social post for ad campaigns
    ],
    'event' => [
        'platforms' => ['daynews', 'goeventcity'],
        'social'    => ['daynews_social', 'goeventcity_social'],
        // Events get full cross-platform treatment
    ],
];
```

Also update the `syndicate()` method signature to route social separately:

```php
public function syndicate(string $contentType, string $contentId): void
{
    $rules = self::SYNDICATION_MAP[$contentType] ?? [];

    $content = $this->loadContent($contentType, $contentId);
    if (! $content) {
        Log::warning('SyndicationService: Content not found', compact('contentType', 'contentId'));
        return;
    }

    // Platform syndication (existing logic)
    foreach ($rules['platforms'] ?? [] as $platform) {
        try {
            $this->syndicateToPlatform($contentType, $content, $platform);
        } catch (\Exception $e) {
            Log::error("SyndicationService: Platform syndication failed to {$platform}", [
                'content_type' => $contentType, 'content_id' => $contentId, 'error' => $e->getMessage(),
            ]);
        }
    }

    // Social syndication (new)
    $socialPlatforms = $rules['social'] ?? [];
    if (! empty($socialPlatforms)) {
        app(SocialSyndicationService::class)->syndicateToSocial($contentType, $content, $socialPlatforms);
    }
}
```

---

### Task 12.1: Migration — Social Syndication Tracking & User Preferences

**File:** `database/migrations/2026_02_20_000008_create_social_syndication_tables.php`

```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Track social posts created by syndication (links back to the source social_posts record)
        Schema::table('syndicated_content', function (Blueprint $table) {
            $table->uuid('social_post_id')->nullable()->after('target_platform');
            // FK to social_posts.id — the actual social post record created
            $table->boolean('is_social')->default(false)->after('social_post_id');
            // Distinguishes social syncs from platform directory syncs
        });

        // Per-user social syndication preferences
        Schema::create('social_syndication_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->boolean('auto_post_announcements')->default(true);
            $table->boolean('auto_post_classifieds')->default(true);
            $table->boolean('auto_post_coupons')->default(true);
            $table->boolean('auto_post_events')->default(true);
            // Social targets the user wants to post to
            $table->boolean('post_to_daynews_social')->default(true);
            $table->boolean('post_to_goeventcity_social')->default(true);
            // Group broadcast: push posts to relevant community groups the user belongs to
            $table->boolean('broadcast_to_groups')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_syndication_preferences');
        Schema::table('syndicated_content', function (Blueprint $table) {
            $table->dropColumn(['social_post_id', 'is_social']);
        });
    }
};
```

**Run:** `php artisan migrate`

---

### Task 12.2: SocialSyndicationPreferences Model

**File:** `app/Models/SocialSyndicationPreferences.php`

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SocialSyndicationPreferences extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'auto_post_announcements',
        'auto_post_classifieds',
        'auto_post_coupons',
        'auto_post_events',
        'post_to_daynews_social',
        'post_to_goeventcity_social',
        'broadcast_to_groups',
    ];

    protected $casts = [
        'auto_post_announcements'     => 'boolean',
        'auto_post_classifieds'       => 'boolean',
        'auto_post_coupons'           => 'boolean',
        'auto_post_events'            => 'boolean',
        'post_to_daynews_social'      => 'boolean',
        'post_to_goeventcity_social'  => 'boolean',
        'broadcast_to_groups'         => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create default preferences for a user.
     */
    public static function forUser(string $userId): self
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            [
                'auto_post_announcements'    => true,
                'auto_post_classifieds'      => true,
                'auto_post_coupons'          => true,
                'auto_post_events'           => true,
                'post_to_daynews_social'     => true,
                'post_to_goeventcity_social' => true,
                'broadcast_to_groups'        => false,
            ]
        );
    }

    public function wantsAutoPost(string $contentType): bool
    {
        return match ($contentType) {
            'announcement' => $this->auto_post_announcements,
            'classified'   => $this->auto_post_classifieds,
            'coupon'       => $this->auto_post_coupons,
            'event'        => $this->auto_post_events,
            default        => false,
        };
    }

    public function wantsPlatform(string $socialPlatform): bool
    {
        return match ($socialPlatform) {
            'daynews_social'     => $this->post_to_daynews_social,
            'goeventcity_social' => $this->post_to_goeventcity_social,
            default              => false,
        };
    }
}
```

---

### Task 12.3: SocialPostFormatter

This service transforms each commerce content type into a properly structured social post. Each format is designed to be native to the social feed — not a raw dump of the content, but a social-native card with a link back to the full content.

**File:** `app/Services/Social/SocialPostFormatter.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\Social;

use App\Models\Announcement;
use App\Models\Classified;
use App\Models\Coupon;

final class SocialPostFormatter
{
    /**
     * Format any commerce content type into a social post payload.
     * Returns the array needed for POST /social/posts.
     */
    public function format(string $contentType, object $content, string $targetPlatform): array
    {
        return match ($contentType) {
            'announcement' => $this->formatAnnouncement($content, $targetPlatform),
            'classified'   => $this->formatClassified($content, $targetPlatform),
            'coupon'       => $this->formatCoupon($content, $targetPlatform),
            'event'        => $this->formatEvent($content, $targetPlatform),
            default        => throw new \InvalidArgumentException("Unknown content type: {$contentType}"),
        };
    }

    /**
     * Announcements → warm, celebratory social post
     * Example: "🎓 Big news! [Name] just graduated from [School]. Join us in celebrating!"
     */
    private function formatAnnouncement(object $content, string $platform): array
    {
        $emoji = $this->announcementEmoji($content->category ?? 'other');

        $body = "{$emoji} {$content->title}";

        if ($content->content) {
            // First sentence only for the social teaser
            $firstSentence = $this->firstSentence($content->content);
            $body .= "\n\n{$firstSentence}";
        }

        $body .= "\n\n→ Read the full announcement";

        return [
            'content'       => $body,
            'post_type'     => 'announcement_share',
            'linked_type'   => 'announcement',
            'linked_id'     => $content->id,
            'region_id'     => $content->region_id,
            'image_url'     => $content->photo_url ?? null,
            'is_syndicated' => true,
        ];
    }

    /**
     * Classifieds → marketplace-style social card
     * Example: "🏷️ For Sale: 2018 Honda Civic — $12,000 | Clearwater, FL"
     */
    private function formatClassified(object $content, string $platform): array
    {
        $emoji = $this->classifiedEmoji($content->category ?? 'other');
        $priceDisplay = $content->price ? ' — ' . $this->formatPrice($content->price) : '';

        $body = "{$emoji} {$content->title}{$priceDisplay}";

        if ($content->description) {
            $body .= "\n\n" . $this->truncate($content->description, 120);
        }

        $body .= "\n\n→ View listing";

        return [
            'content'       => $body,
            'post_type'     => 'classified_share',
            'linked_type'   => 'classified',
            'linked_id'     => $content->id,
            'region_id'     => $content->region_id,
            'image_url'     => $content->primary_image ?? null,
            'is_syndicated' => true,
        ];
    }

    /**
     * Coupons → deal-focused social post with urgency
     * Example: "🎟️ DEAL: 20% off all haircuts this weekend at Maria's Salon | Expires Sun"
     */
    private function formatCoupon(object $content, string $platform): array
    {
        $expiry = $content->expires_at
            ? 'Expires ' . \Carbon\Carbon::parse($content->expires_at)->format('M j')
            : 'Limited time';

        $body = "🎟️ DEAL: {$content->title}";

        if ($content->discount_description ?? $content->terms) {
            $body .= "\n\n" . $this->truncate($content->discount_description ?? $content->terms, 100);
        }

        $body .= "\n\n{$expiry} · Use code: {$content->promo_code}";
        $body .= "\n\n→ Claim this deal";

        return [
            'content'       => $body,
            'post_type'     => 'coupon_share',
            'linked_type'   => 'coupon',
            'linked_id'     => $content->id,
            'region_id'     => $content->region_id,
            'image_url'     => $content->image_url ?? null,
            'is_syndicated' => true,
        ];
    }

    /**
     * Events → event card with date/time/location
     * Example: "📅 Tonight: Jazz on the Waterfront | 7pm · Coachman Park, Clearwater"
     */
    private function formatEvent(object $content, string $platform): array
    {
        $when = $this->formatEventTime($content->date_time_start ?? null);
        $where = $content->location['venue'] ?? $content->location['city'] ?? null;

        $body = "📅 {$content->title}";
        $body .= "\n\n{$when}";

        if ($where) {
            $body .= " · {$where}";
        }

        if ($content->short_description ?? $content->full_description) {
            $body .= "\n\n" . $this->truncate($content->short_description ?? $content->full_description, 120);
        }

        $body .= "\n\n→ Details & RSVP";

        // GoEventCity posts link back to the event; Day.News posts link to the event coverage article
        $linkedType = $platform === 'goeventcity_social' ? 'event' : 'event';

        return [
            'content'       => $body,
            'post_type'     => 'event_share',
            'linked_type'   => $linkedType,
            'linked_id'     => $content->id,
            'region_id'     => $content->region_id ?? $content->event_region[0] ?? null,
            'image_url'     => $content->main_image ?? null,
            'is_syndicated' => true,
        ];
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function announcementEmoji(string $category): string
    {
        return match ($category) {
            'birth'           => '👶',
            'engagement'      => '💍',
            'marriage'        => '💒',
            'anniversary'     => '💝',
            'graduation'      => '🎓',
            'promotion'       => '📈',
            'retirement'      => '🎉',
            'achievement'     => '🏆',
            'business_opening'=> '🏪',
            'award'           => '🥇',
            'memorial'        => '🕊️',
            default           => '📣',
        };
    }

    private function classifiedEmoji(string $category): string
    {
        return match ($category) {
            'jobs'        => '💼',
            'real_estate' => '🏠',
            'for_sale'    => '🏷️',
            'services'    => '🔧',
            'vehicles'    => '🚗',
            'rentals'     => '🔑',
            'community'   => '🤝',
            default       => '📌',
        };
    }

    private function formatPrice(float|string $price): string
    {
        if (is_numeric($price)) {
            return '$' . number_format((float) $price, 0);
        }
        return (string) $price;
    }

    private function formatEventTime(?string $dateTimeStr): string
    {
        if (! $dateTimeStr) {
            return 'Upcoming';
        }
        $dt = \Carbon\Carbon::parse($dateTimeStr);
        $today    = $dt->isToday();
        $tomorrow = $dt->isTomorrow();
        $thisWeek = $dt->isCurrentWeek();

        $prefix = match (true) {
            $today    => 'Tonight',
            $tomorrow => 'Tomorrow',
            $thisWeek => $dt->format('l'),   // "Friday"
            default   => $dt->format('M j'), // "Mar 15"
        };

        return "{$prefix} at {$dt->format('g:i A')}";
    }

    private function firstSentence(string $text): string
    {
        preg_match('/^[^.!?]*[.!?]/', strip_tags($text), $matches);
        return $matches[0] ?? $this->truncate($text, 150);
    }

    private function truncate(string $text, int $length): string
    {
        $text = strip_tags($text);
        if (mb_strlen($text) <= $length) {
            return $text;
        }
        return mb_substr($text, 0, $length - 3) . '...';
    }
}
```

---

### Task 12.4: SocialSyndicationService

This is the core service that creates actual `social_posts` records for each target platform and optionally broadcasts to relevant groups.

**File:** `app/Services/Social/SocialSyndicationService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\Social;

use App\Models\SocialSyndicationPreferences;
use App\Models\SyndicatedContent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class SocialSyndicationService
{
    public function __construct(
        private readonly SocialPostFormatter $formatter
    ) {}

    /**
     * Create social posts for a piece of content on one or more social platforms.
     * Respects user preferences — if the user has opted out, skip silently.
     */
    public function syndicateToSocial(
        string $contentType,
        object $content,
        array $targetPlatforms
    ): void {
        $userId = $content->user_id ?? null;

        if (! $userId) {
            Log::warning('SocialSyndicationService: No user_id on content', [
                'content_type' => $contentType,
                'content_id'   => $content->id,
            ]);
            return;
        }

        $prefs = SocialSyndicationPreferences::forUser($userId);

        // Check if user wants auto-posting for this content type
        if (! $prefs->wantsAutoPost($contentType)) {
            Log::info("SocialSyndicationService: User opted out of auto-post for {$contentType}", [
                'user_id' => $userId,
            ]);
            return;
        }

        foreach ($targetPlatforms as $platform) {
            // Check per-platform preference
            if (! $prefs->wantsPlatform($platform)) {
                continue;
            }

            // Skip if already syndicated to this platform
            $alreadySyndicated = SyndicatedContent::where('source_type', $contentType)
                ->where('source_id', $content->id)
                ->where('target_platform', $platform)
                ->where('is_social', true)
                ->exists();

            if ($alreadySyndicated) {
                continue;
            }

            try {
                $this->postToSocialPlatform($contentType, $content, $platform, $prefs);
            } catch (\Exception $e) {
                Log::error("SocialSyndicationService: Failed to post to {$platform}", [
                    'content_type' => $contentType,
                    'content_id'   => $content->id,
                    'error'        => $e->getMessage(),
                ]);
            }
        }
    }

    private function postToSocialPlatform(
        string $contentType,
        object $content,
        string $platform,
        SocialSyndicationPreferences $prefs
    ): void {
        $payload = $this->formatter->format($contentType, $content, $platform);

        DB::transaction(function () use ($contentType, $content, $platform, $payload, $prefs) {
            // Create the social_posts record
            $socialPost = \App\Models\SocialPost::create([
                'user_id'       => $content->user_id,
                'region_id'     => $payload['region_id'] ?? null,
                'content'       => $payload['content'],
                'post_type'     => $payload['post_type'],
                'linked_type'   => $payload['linked_type'],
                'linked_id'     => $payload['linked_id'],
                'image_url'     => $payload['image_url'],
                'platform'      => $this->platformToSlug($platform),
                'is_syndicated' => true,
                'status'        => 'published',
            ]);

            // Record the syndication
            SyndicatedContent::create([
                'source_type'     => $contentType,
                'source_id'       => $content->id,
                'target_platform' => $platform,
                'social_post_id'  => $socialPost->id,
                'is_social'       => true,
                'region_id'       => $payload['region_id'] ?? null,
                'status'          => 'active',
                'syndicated_at'   => now(),
            ]);

            // Group broadcast — if opted in, also post to relevant community groups
            if ($prefs->broadcast_to_groups) {
                $this->broadcastToGroups($socialPost, $content, $platform);
            }

            Log::info("SocialSyndicationService: Posted to {$platform}", [
                'social_post_id' => $socialPost->id,
                'content_type'   => $contentType,
                'content_id'     => $content->id,
            ]);
        });
    }

    /**
     * Post to community groups that match the content's region and category.
     * Only groups the user is a member of, and only groups marked as 'community' type.
     */
    private function broadcastToGroups(
        \App\Models\SocialPost $socialPost,
        object $content,
        string $platform
    ): void {
        $regionId = $content->region_id ?? null;

        // Find groups the user is a member of, in the same region, that allow syndicated posts
        $groups = \App\Models\SocialGroup::whereHas('members', function ($q) use ($socialPost) {
            $q->where('user_id', $socialPost->user_id);
        })
        ->when($regionId, fn($q) => $q->where('region_id', $regionId))
        ->where('allows_syndicated_posts', true)
        ->where('platform', $this->platformToSlug($platform))
        ->limit(5) // Cap at 5 groups to prevent spam
        ->get();

        foreach ($groups as $group) {
            \App\Models\SocialGroupPost::create([
                'group_id'      => $group->id,
                'user_id'       => $socialPost->user_id,
                'social_post_id'=> $socialPost->id,
                'is_syndicated' => true,
            ]);
        }
    }

    private function platformToSlug(string $socialPlatform): string
    {
        return match ($socialPlatform) {
            'daynews_social'     => 'daynews',
            'goeventcity_social' => 'goeventcity',
            default              => $socialPlatform,
        };
    }
}
```

---

### Task 12.5: SocialPost Model

Add this if it doesn't already exist, or add missing fields if it does.

**File:** `app/Models/SocialPost.php`

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class SocialPost extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'region_id', 'content', 'post_type',
        'linked_type', 'linked_id', 'image_url',
        'platform', 'is_syndicated', 'status',
    ];

    protected $casts = [
        'is_syndicated' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(SocialPostLike::class, 'post_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(SocialPostComment::class, 'post_id');
    }

    public function syndicatedSource(): ?SyndicatedContent
    {
        return SyndicatedContent::where('social_post_id', $this->id)
            ->where('is_social', true)
            ->first();
    }

    /**
     * Get the original content this post was syndicated from.
     * Returns the linked model (Announcement, Classified, Coupon, etc.)
     */
    public function linkedContent(): ?object
    {
        if (! $this->linked_type || ! $this->linked_id) {
            return null;
        }

        $modelMap = [
            'announcement' => Announcement::class,
            'classified'   => Classified::class,
            'coupon'       => Coupon::class,
            'event'        => \App\Models\Event::class,
        ];

        $model = $modelMap[$this->linked_type] ?? null;

        return $model ? $model::find($this->linked_id) : null;
    }
}
```

---

### Task 12.6: Migration — Social Groups Allow Syndicated Posts Flag

Add one column to the existing `social_groups` table so group admins can control whether syndicated commerce posts appear in their group.

**File:** `database/migrations/2026_02_20_000009_add_syndication_flag_to_social_groups.php`

```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('social_groups', function (Blueprint $table) {
            $table->boolean('allows_syndicated_posts')->default(true)->after('status');
            // Group admins can turn this off to keep their group hand-curated
            $table->string('platform')->default('daynews')->after('allows_syndicated_posts');
            // 'daynews' | 'goeventcity' — which platform this group lives on
        });
    }

    public function down(): void
    {
        Schema::table('social_groups', function (Blueprint $table) {
            $table->dropColumn(['allows_syndicated_posts', 'platform']);
        });
    }
};
```

---

### Task 12.7: Social Syndication Preferences UI

Add a **Social Auto-Post** section to the user's account settings page. This gives users full control over what gets posted to their social feed.

**File:** `resources/js/Pages/Account/SocialSyndicationSettings.tsx`

```typescript
interface Props {
  preferences: {
    auto_post_announcements: boolean;
    auto_post_classifieds: boolean;
    auto_post_coupons: boolean;
    auto_post_events: boolean;
    post_to_daynews_social: boolean;
    post_to_goeventcity_social: boolean;
    broadcast_to_groups: boolean;
  };
}

export default function SocialSyndicationSettings({ preferences }: Props) {
  // Render two sections:
  //
  // SECTION 1: "Auto-Post When I Publish..."
  //   Toggle: Announcements (on by default) ← great for engagement
  //   Toggle: Classified Listings (on by default)
  //   Toggle: Coupons & Deals (on by default)
  //   Toggle: Events (on by default)
  //
  // SECTION 2: "Post To..."
  //   Toggle: Day.News Social Feed
  //   Toggle: GoEventCity Social Feed
  //   Toggle: Broadcast to My Community Groups (off by default — power user feature)
  //
  // Save button → PATCH /account/social-syndication-preferences
  //
  // Explanatory copy under each section:
  //   "When you publish paid content, we'll automatically create a post in
  //    your social feed so your followers are notified. You can turn this
  //    off at any time."
}
```

---

### Task 12.8: Social Syndication Preferences Controller

**File:** `app/Http/Controllers/Account/SocialSyndicationPreferencesController.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\SocialSyndicationPreferences;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SocialSyndicationPreferencesController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Account/SocialSyndicationSettings', [
            'preferences' => SocialSyndicationPreferences::forUser(auth()->id()),
        ]);
    }

    public function update(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'auto_post_announcements'    => 'boolean',
            'auto_post_classifieds'      => 'boolean',
            'auto_post_coupons'          => 'boolean',
            'auto_post_events'           => 'boolean',
            'post_to_daynews_social'     => 'boolean',
            'post_to_goeventcity_social' => 'boolean',
            'broadcast_to_groups'        => 'boolean',
        ]);

        SocialSyndicationPreferences::forUser(auth()->id())->update($validated);

        return back()->with('success', 'Social posting preferences updated.');
    }
}
```

---

### Task 12.9: Social Feed — Syndicated Content Display

When a syndicated social post appears in the feed, it should render as a commerce card, not a plain text post. Add a renderer in the existing social feed component.

**File:** `resources/js/Components/Social/SyndicatedPostCard.tsx`

```typescript
interface SyndicatedPost {
  id: string;
  content: string;
  post_type: 'announcement_share' | 'classified_share' | 'coupon_share' | 'event_share';
  linked_type: string;
  linked_id: string;
  image_url: string | null;
  user: { id: string; name: string; profile_picture: string | null };
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export default function SyndicatedPostCard({ post }: { post: SyndicatedPost }) {
  // Render based on post_type:
  //
  // announcement_share → soft gradient card (warm color), celebration emoji header
  // classified_share   → marketplace card with price badge, "View Listing" CTA button
  // coupon_share       → deal card with dashed border (coupon aesthetic), promo code chip, "Claim" button
  // event_share        → event card with date badge in top-left corner, venue, RSVP button
  //
  // All cards include:
  // - "SPONSORED" or "COMMUNITY POST" label (distinguish paid featured from organic)
  // - Standard like / comment / share actions
  // - Small "via Day.News Commerce" attribution footer
  // - Deep link to the original content page
}
```

Integrate `SyndicatedPostCard` into the main social feed renderer:

```typescript
// In SocialFeed.tsx, inside the post map:
{post.is_syndicated ? (
  <SyndicatedPostCard post={post} />
) : (
  <StandardPostCard post={post} />
)}
```

---

### Task 12.10: Routes

Add to `routes/web.php`:

```php
// Social syndication preferences
Route::middleware('auth')->group(function () {
    Route::get('/account/social-syndication', [SocialSyndicationPreferencesController::class, 'show'])
        ->name('account.social-syndication');
    Route::patch('/account/social-syndication', [SocialSyndicationPreferencesController::class, 'update'])
        ->name('account.social-syndication.update');
});
```

Add link in account settings navigation:

```typescript
{ label: 'Social Auto-Post', route: 'account.social-syndication', icon: Share2 }
```

---

### Task 12.11: Update SyndicateContentJob (Agent 10 Integration)

The job from Agent 10 already calls `ContentSyndicationService::syndicate()`. Since we updated that method's internal routing in Task 12.0 to include `SocialSyndicationService`, **no changes to the job class itself are needed.** The update to `SYNDICATION_MAP` and the updated `syndicate()` method body are the only required changes to the existing Agent 10 files.

Verify the integration by checking that `SocialSyndicationService` is auto-resolved via the service container (it will be, since it has no special bindings).

---

### Agent 12 Verification

```bash
# Migrations
php artisan migrate --step

# Check new tables
php artisan tinker --execute="
    \Illuminate\Support\Facades\Schema::hasTable('social_syndication_preferences') ? 'prefs table OK' : 'MISSING';
"

# Services resolve
php artisan tinker --execute="
    app(App\Services\Social\SocialPostFormatter::class);
    app(App\Services\Social\SocialSyndicationService::class);
    echo 'Social services OK';
"

# Test formatter output per content type
php artisan tinker --execute="
    \$formatter = app(App\Services\Social\SocialPostFormatter::class);

    // Mock a coupon
    \$coupon = new stdClass();
    \$coupon->title = '20% off all haircuts this weekend';
    \$coupon->terms = 'Valid Fri-Sun only. Limit 1 per customer.';
    \$coupon->promo_code = 'WEEKEND20';
    \$coupon->expires_at = now()->addDays(3);
    \$coupon->id = 'test-123';
    \$coupon->region_id = null;
    \$coupon->image_url = null;

    \$result = \$formatter->format('coupon', \$coupon, 'daynews_social');
    dump(\$result['content']);
    echo 'Formatter OK';
"

# User preferences smoke test
php artisan tinker --execute="
    \$user = App\Models\User::factory()->create();
    \$prefs = App\Models\SocialSyndicationPreferences::forUser(\$user->id);
    assert(\$prefs->wantsAutoPost('coupon') === true);
    assert(\$prefs->wantsPlatform('daynews_social') === true);
    \$prefs->update(['auto_post_coupons' => false]);
    \$prefs->refresh();
    assert(\$prefs->wantsAutoPost('coupon') === false);
    \$user->delete();
    echo 'Preferences smoke test PASSED';
"

# Routes
php artisan route:list --name=account.social-syndication

# Build
npm run build

# Tests
php artisan test --filter=SocialSyndicationTest
```

---

## SOCIAL SYNDICATION MATRIX (COMPLETE)

After both Agent 10 and Agent 12 are complete, this is the full content distribution picture:

| Content Type | Day.News | DowntownGuide | GoEventCity | GoLocalVoices | Day.News Social | GEC Social |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Announcement | ✅ | — | — | — | ✅ | — |
| Classified | ✅ | ✅ | — | — | ✅ | — |
| Coupon | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Event | ✅ | — | ✅ | — | ✅ | ✅ |
| Legal Notice | ✅ | — | — | — | — | — |
| Ad Campaign | Served via AdSlot | Served via AdSlot | Served via AdSlot | — | — | — |

**Note on GoLocalVoices:** GoLocalVoices (multimedia content service) is excluded from social syndication in this release because it operates on a creator/subscriber model that's better served by its own native sharing tools. Add it as a future enhancement once the GLV social architecture is defined.

---

## NEW FILES IN THIS ADDENDUM

| File | Type |
|------|------|
| `database/migrations/2026_02_20_000008_create_social_syndication_tables.php` | Migration |
| `database/migrations/2026_02_20_000009_add_syndication_flag_to_social_groups.php` | Migration |
| `app/Models/SocialSyndicationPreferences.php` | Model |
| `app/Models/SocialPost.php` | Model (new or augmented) |
| `app/Services/Social/SocialPostFormatter.php` | Service |
| `app/Services/Social/SocialSyndicationService.php` | Service |
| `app/Http/Controllers/Account/SocialSyndicationPreferencesController.php` | Controller |
| `resources/js/Pages/Account/SocialSyndicationSettings.tsx` | React Page |
| `resources/js/Components/Social/SyndicatedPostCard.tsx` | React Component |

**Modified files from Agent 10:**
- `app/Services/Commerce/ContentSyndicationService.php` — expanded `SYNDICATION_MAP` + updated `syndicate()` routing

---

*Fibonacco Platform — Social Syndication Addendum v1.0 — February 2026*
*Supplement to: Monetization & Commerce Multi-Agent Cursor Implementation Guide*
