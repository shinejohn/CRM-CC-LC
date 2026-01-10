# Models Summary

## AdTemplate
```php
    protected $fillable = [
    protected function casts(): array
    public function renderPrompt(array $variables): string
```

## AiPersonality
```php
    protected $fillable = [
    protected function casts(): array
    public function assignments(): HasMany
        return $this->hasMany(PersonalityAssignment::class, 'personality_id');
    public function conversations(): HasMany
        return $this->hasMany(PersonalityConversation::class, 'personality_id');
    public function activeAssignments(): HasMany
        return $this->hasMany(PersonalityAssignment::class, 'personality_id')
    public function canHandle(string $contactType): bool
    public function getFullSystemPrompt(array $additionalContext = []): string
    public function isCurrentlyActive(): bool
```

## Article
```php
    protected $fillable = [
    protected $casts = [
```

## CampaignRecipient
```php
    protected $fillable = [
    protected function casts(): array
    public function campaign(): BelongsTo
        return $this->belongsTo(OutboundCampaign::class, 'campaign_id');
    public function customer(): BelongsTo
        return $this->belongsTo(Customer::class);
    public function isPending(): bool
    public function isSent(): bool
    public function isFailed(): bool
```

## ContentTemplate
```php
    protected $fillable = [
    protected function casts(): array
    public function renderPrompt(array $variables): string
```

## ContentVersion
```php
    protected $fillable = [
    protected function casts(): array
    public function content(): BelongsTo
        return $this->belongsTo(GeneratedContent::class, 'content_id');
```

## ContentWorkflowHistory
```php
    protected $fillable = [
    protected function casts(): array
    public function content(): BelongsTo
        return $this->belongsTo(GeneratedContent::class, 'content_id');
```

## Conversation
```php
    protected $fillable = [
    protected $casts = [
    protected static function boot()
        static::creating(function ($conversation) {
    public function customer(): BelongsTo
        return $this->belongsTo(Customer::class);
    public function conversationMessages(): HasMany
        return $this->hasMany(ConversationMessage::class);
    public function end(): void
    public function getFormattedDurationAttribute(): string
```

## ConversationMessage
```php
    protected $fillable = [
    protected $casts = [
    protected static function boot()
        static::creating(function ($message) {
    public function conversation(): BelongsTo
        return $this->belongsTo(Conversation::class);
```

## Customer
```php
    protected $fillable = [
    protected $casts = [
    protected static function boot()
        static::creating(function ($customer) {
    public function conversations(): HasMany
        return $this->hasMany(Conversation::class);
    public function pendingQuestions(): HasMany
        return $this->hasMany(PendingQuestion::class);
    public function faqs(): HasMany
        return $this->hasMany(CustomerFaq::class);
```

## CustomerFaq
```php
    protected $fillable = [
    protected $casts = [
    protected static function boot()
        static::creating(function ($faq) {
    public function customer(): BelongsTo
        return $this->belongsTo(Customer::class);
    public function markAsVerified(): void
```

## EmailTemplate
```php
    protected $fillable = [
    protected function casts(): array
    public function render(array $variables): array
```

## FaqCategory
```php
    protected $fillable = [
    protected $casts = [
    public function parent(): BelongsTo
        return $this->belongsTo(FaqCategory::class, 'parent_id');
    public function children(): HasMany
        return $this->hasMany(FaqCategory::class, 'parent_id');
    public function knowledgeItems(): HasMany
        return $this->hasMany(Knowledge::class, 'category', 'slug');
```

## GeneratedAd
```php
    protected $fillable = [
    protected function casts(): array
    public function template(): BelongsTo
        return $this->belongsTo(AdTemplate::class, 'template_id');
    public function content(): BelongsTo
        return $this->belongsTo(GeneratedContent::class, 'content_id');
    public function isActive(): bool
    public function isScheduled(): bool
    public function getCtrAttribute(): float
    public function getCpcAttribute(): float
    public function getCpaAttribute(): float
```

## GeneratedContent
```php
    protected $fillable = [
    protected function casts(): array
    public function versions(): HasMany
        return $this->hasMany(ContentVersion::class, 'content_id');
    public function workflowHistory(): HasMany
        return $this->hasMany(ContentWorkflowHistory::class, 'content_id');
    public function template(): BelongsTo
        return $this->belongsTo(ContentTemplate::class, 'template_id');
    public function isDraft(): bool
    public function isPublished(): bool
    public function isScheduled(): bool
    public function createVersion(string $changeNotes = null, ?string $userId = null): ContentVersion
    public function recordWorkflowAction(
```

## GeneratedPresentation
```php
    protected $fillable = [
    protected $casts = [
    public function template(): BelongsTo
        return $this->belongsTo(PresentationTemplate::class, 'template_id');
```

## IndustryCategory
```php
    protected $fillable = [
    protected $casts = [
    public function subcategories(): HasMany
        return $this->hasMany(IndustrySubcategory::class, 'industry_id');
```

## IndustrySubcategory
```php
    protected $fillable = [
    protected $casts = [
    public function industry(): BelongsTo
        return $this->belongsTo(IndustryCategory::class, 'industry_id');
```

## Knowledge
```php
    protected $fillable = [
    protected $casts = [
    public function faqCategory()
        return $this->belongsTo(FaqCategory::class, 'category', 'slug');
```

## Order
```php
    protected $fillable = [
    public function user(): BelongsTo
        return $this->belongsTo(User::class);
    public function customer(): BelongsTo
        return $this->belongsTo(Customer::class);
    public function items(): HasMany
        return $this->hasMany(OrderItem::class);
    public function isPaid(): bool
    public function isPending(): bool
    public function isProcessing(): bool
    public function isCompleted(): bool
    public function isCancelled(): bool
    public function isRefunded(): bool
    protected static function booted(): void
        static::creating(function (Order $order) {
    protected function casts(): array
```

## OrderItem
```php
    protected $fillable = [
    public function order(): BelongsTo
        return $this->belongsTo(Order::class);
    public function service(): BelongsTo
        return $this->belongsTo(Service::class);
    protected function casts(): array
```

## OutboundCampaign
```php
    protected $fillable = [
    protected function casts(): array
    public function recipients(): HasMany
        return $this->hasMany(CampaignRecipient::class, 'campaign_id');
    public function isDraft(): bool
    public function isScheduled(): bool
    public function isRunning(): bool
    public function isCompleted(): bool
    public function getDeliveryRateAttribute(): float
    public function getOpenRateAttribute(): float
    public function getClickRateAttribute(): float
```

## PendingQuestion
```php
    protected $fillable = [
    protected $casts = [
    protected static function boot()
        static::creating(function ($question) {
    public function customer(): BelongsTo
        return $this->belongsTo(Customer::class);
    public function markAsAsked(string $conversationId): void
    public function markAsAnswered(string $answer): void
```

## PersonalityAssignment
```php
    protected $fillable = [
    protected function casts(): array
    public function personality(): BelongsTo
        return $this->belongsTo(AiPersonality::class, 'personality_id');
    public function customer(): BelongsTo
        return $this->belongsTo(Customer::class, 'customer_id');
    public function isActive(): bool
    public function recordInteraction(): void
    public function recordConversation(): void
```

## PersonalityConversation
```php
    protected $fillable = [
    protected function casts(): array
    public function personality(): BelongsTo
        return $this->belongsTo(AiPersonality::class, 'personality_id');
    public function conversation(): BelongsTo
        return $this->belongsTo(Conversation::class, 'conversation_id');
```

## PhoneScript
```php
    protected $fillable = [
    protected function casts(): array
    public function render(array $variables): string
```

## PresentationTemplate
```php
    protected $fillable = [
    protected $casts = [
    public function generatedPresentations(): HasMany
        return $this->hasMany(GeneratedPresentation::class, 'template_id');
```

## Presenter
```php
    protected $fillable = [
    protected $casts = [
```

## Service
```php
    protected $fillable = [
    public function category(): BelongsTo
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    public function orderItems(): HasMany
        return $this->hasMany(OrderItem::class);
    public function subscriptions(): HasMany
        return $this->hasMany(ServiceSubscription::class);
    public function isInStock(): bool
    public function hasDiscount(): bool
    public function getDiscountPercentageAttribute(): ?float
    protected function casts(): array
```

## ServiceCategory
```php
    protected $fillable = [
    protected $casts = [
    public function services(): HasMany
        return $this->hasMany(Service::class);
```

## ServiceSubscription
```php
    protected $fillable = [
    public function customer(): BelongsTo
        return $this->belongsTo(Customer::class);
    public function user(): BelongsTo
        return $this->belongsTo(User::class);
    public function service(): BelongsTo
        return $this->belongsTo(Service::class);
    public function order(): BelongsTo
        return $this->belongsTo(Order::class);
    public function isTrial(): bool
    public function isPremium(): bool
    public function isExpired(): bool
    protected function casts(): array
```

## SmsTemplate
```php
    protected $fillable = [
    protected function casts(): array
    public function render(array $variables): string
```

## SurveyQuestion
```php
    protected $fillable = [
    protected $casts = [
    public function section(): BelongsTo
        return $this->belongsTo(SurveySection::class, 'section_id');
```

## SurveySection
```php
    protected $fillable = [
    protected $casts = [
    public function questions(): HasMany
        return $this->hasMany(SurveyQuestion::class, 'section_id')->orderBy('display_order');
```

## User
```php
    protected $fillable = [
    protected $hidden = [
    protected function casts(): array
```

