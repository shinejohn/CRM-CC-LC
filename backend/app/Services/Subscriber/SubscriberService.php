<?php

namespace App\Services\Subscriber;

use App\Contracts\Subscriber\SubscriberServiceInterface;
use App\Models\Subscriber\Subscriber;
use App\Models\Subscriber\EmailVerification;
use App\Models\Subscriber\UnsubscribeToken;
use App\Models\Subscriber\SubscriberEvent;
use App\Models\Subscriber\SubscriberAlertPreference;
use App\Models\Community;
use App\Events\Subscriber\SubscriberRegistered;
use App\Events\Subscriber\SubscriberVerified;
use App\Jobs\RecompileSubscriberLists;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SubscriberService implements SubscriberServiceInterface
{
    public function register(array $data): Subscriber
    {
        // Check for existing subscriber
        $existing = Subscriber::where('email', $data['email'])->first();
        
        if ($existing) {
            if ($existing->status === 'active') {
                throw new \Exception("Email already subscribed");
            }
            
            // Reactivate if previously unsubscribed
            if ($existing->status === 'unsubscribed') {
                $existing->update([
                    'status' => 'pending',
                    'unsubscribed_at' => null,
                ]);
                $this->sendVerificationEmail($existing);
                return $existing;
            }
        }
        
        // Create new subscriber
        $subscriber = Subscriber::create([
            'email' => $data['email'],
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'zip_code' => $data['zip_code'] ?? null,
            'newsletter_frequency' => $data['newsletter_frequency'] ?? 'daily',
            'source' => $data['source'] ?? 'website',
            'source_detail' => $data['source_detail'] ?? null,
            'status' => 'pending',
        ]);
        
        // Subscribe to communities
        if (!empty($data['community_ids'])) {
            foreach ($data['community_ids'] as $index => $communityId) {
                $subscriber->communities()->attach($communityId, [
                    'is_primary' => $index === 0,
                    'subscribed_at' => now(),
                ]);
            }
        }
        
        // Set default alert preferences (all enabled)
        $this->setDefaultAlertPreferences($subscriber);
        
        // Send verification email
        $this->sendVerificationEmail($subscriber);
        
        // Log event
        $this->logEvent($subscriber, 'signup', [
            'communities' => $data['community_ids'] ?? [],
        ]);
        
        event(new SubscriberRegistered($subscriber));
        
        return $subscriber;
    }
    
    public function verifyEmail(string $token): Subscriber
    {
        $verification = EmailVerification::where('token', $token)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->first();
        
        if (!$verification) {
            throw new \Exception("Invalid or expired verification token");
        }
        
        $subscriber = $verification->subscriber;
        
        // Update subscriber
        $subscriber->update([
            'email' => $verification->email,
            'email_verified_at' => now(),
            'email_opted_in' => true,
            'email_opted_in_at' => now(),
            'status' => 'active',
        ]);
        
        // Mark token as used
        $verification->update(['verified_at' => now()]);
        
        // Log event
        $this->logEvent($subscriber, 'verify');
        
        event(new SubscriberVerified($subscriber));
        
        // Trigger list recompilation
        dispatch(new RecompileSubscriberLists($subscriber->id));
        
        return $subscriber;
    }
    
    public function updateProfile(int $subscriberId, array $data): Subscriber
    {
        $subscriber = Subscriber::findOrFail($subscriberId);
        
        $subscriber->update($data);
        
        $this->logEvent($subscriber, 'profile_updated', $data);
        
        return $subscriber->fresh();
    }
    
    public function updatePreferences(int $subscriberId, array $data): Subscriber
    {
        $subscriber = Subscriber::findOrFail($subscriberId);
        
        $updates = [];
        
        // Channel preferences
        if (isset($data['email_opted_in'])) {
            $updates['email_opted_in'] = $data['email_opted_in'];
            if ($data['email_opted_in']) {
                $updates['email_opted_in_at'] = now();
            }
        }
        
        if (isset($data['sms_opted_in'])) {
            $updates['sms_opted_in'] = $data['sms_opted_in'];
            if ($data['sms_opted_in']) {
                $updates['sms_opted_in_at'] = now();
            }
        }
        
        // Newsletter frequency
        if (isset($data['newsletter_frequency'])) {
            $updates['newsletter_frequency'] = $data['newsletter_frequency'];
        }
        
        // Alerts
        if (isset($data['alerts_enabled'])) {
            $updates['alerts_enabled'] = $data['alerts_enabled'];
        }
        
        $subscriber->update($updates);
        
        // Update alert category preferences
        if (!empty($data['alert_preferences'])) {
            foreach ($data['alert_preferences'] as $category => $prefs) {
                SubscriberAlertPreference::updateOrCreate(
                    [
                        'subscriber_id' => $subscriber->id,
                        'category_slug' => $category,
                    ],
                    [
                        'email_enabled' => $prefs['email'] ?? true,
                        'sms_enabled' => $prefs['sms'] ?? false,
                        'push_enabled' => $prefs['push'] ?? true,
                    ]
                );
            }
        }
        
        // Trigger list recompilation
        dispatch(new RecompileSubscriberLists($subscriber->id));
        
        return $subscriber->fresh();
    }
    
    public function subscribeToCommunity(int $subscriberId, string $communityId): void
    {
        $subscriber = Subscriber::findOrFail($subscriberId);
        
        if (!$subscriber->communities()->where('community_id', $communityId)->exists()) {
            $subscriber->communities()->attach($communityId, [
                'subscribed_at' => now(),
                'is_primary' => $subscriber->communities()->count() === 0,
            ]);
            
            $this->logEvent($subscriber, 'community_subscribed', ['community_id' => $communityId]);
            dispatch(new RecompileSubscriberLists($subscriber->id));
        }
    }
    
    public function unsubscribeFromCommunity(int $subscriberId, string $communityId): void
    {
        $subscriber = Subscriber::findOrFail($subscriberId);
        
        $subscriber->communities()->detach($communityId);
        
        $this->logEvent($subscriber, 'community_unsubscribed', ['community_id' => $communityId]);
        dispatch(new RecompileSubscriberLists($subscriber->id));
    }
    
    public function unsubscribe(string $token): array
    {
        $unsubToken = UnsubscribeToken::where('token', $token)
            ->whereNull('used_at')
            ->first();
        
        if (!$unsubToken) {
            throw new \Exception("Invalid unsubscribe token");
        }
        
        $subscriber = $unsubToken->subscriber;
        
        switch ($unsubToken->scope) {
            case 'all':
                // Full unsubscribe
                $subscriber->update([
                    'email_opted_in' => false,
                    'sms_opted_in' => false,
                    'push_opted_in' => false,
                    'status' => 'unsubscribed',
                    'unsubscribed_at' => now(),
                ]);
                break;
                
            case 'community':
                // Unsubscribe from specific community
                $subscriber->communities()
                    ->updateExistingPivot($unsubToken->scope_id, [
                        'newsletters_enabled' => false,
                        'alerts_enabled' => false,
                    ]);
                break;
                
            case 'newsletter':
                $subscriber->update(['newsletter_frequency' => 'none']);
                break;
                
            case 'alerts':
                $subscriber->update(['alerts_enabled' => false]);
                break;
        }
        
        // Mark token as used
        $unsubToken->update(['used_at' => now()]);
        
        // Log event
        $this->logEvent($subscriber, 'unsubscribe', [
            'scope' => $unsubToken->scope,
            'scope_id' => $unsubToken->scope_id,
        ]);
        
        // Trigger list recompilation
        dispatch(new RecompileSubscriberLists($subscriber->id));
        
        return [
            'success' => true,
            'scope' => $unsubToken->scope,
            'message' => $this->getUnsubscribeMessage($unsubToken->scope),
        ];
    }
    
    public function getWithPreferences(int $subscriberId): Subscriber
    {
        return Subscriber::with(['communities', 'alertPreferences'])
            ->findOrFail($subscriberId);
    }
    
    private function sendVerificationEmail(Subscriber $subscriber): void
    {
        $token = Str::random(64);
        
        EmailVerification::create([
            'subscriber_id' => $subscriber->id,
            'token' => $token,
            'email' => $subscriber->email,
            'expires_at' => now()->addHours(24),
        ]);
        
        // Send verification email via Laravel Mail
        try {
            $verificationUrl = route('subscriber.verify', ['token' => $token]);
            
            Mail::send('emails.subscriber_verification', [
                'first_name' => $subscriber->first_name,
                'verification_url' => $verificationUrl,
            ], function ($message) use ($subscriber) {
                $message->to($subscriber->email)
                    ->subject('Verify your email to complete signup');
            });
        } catch (\Exception $e) {
            Log::error('Failed to send verification email', [
                'subscriber_id' => $subscriber->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
    
    private function setDefaultAlertPreferences(Subscriber $subscriber): void
    {
        // Default categories - in production, fetch from AlertCategory model
        $categories = ['breaking', 'weather', 'traffic', 'events', 'business'];
        
        foreach ($categories as $category) {
            SubscriberAlertPreference::create([
                'subscriber_id' => $subscriber->id,
                'category_slug' => $category,
                'email_enabled' => true,
                'sms_enabled' => false,
                'push_enabled' => true,
            ]);
        }
    }
    
    private function logEvent(Subscriber $subscriber, string $type, array $data = []): void
    {
        SubscriberEvent::create([
            'subscriber_id' => $subscriber->id,
            'event_type' => $type,
            'event_data' => $data,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
    
    private function getUnsubscribeMessage(string $scope): string
    {
        return match($scope) {
            'all' => 'You have been unsubscribed from all communications.',
            'community' => 'You have been unsubscribed from this community.',
            'newsletter' => 'You have been unsubscribed from newsletters.',
            'alerts' => 'You have been unsubscribed from alerts.',
            default => 'Your preferences have been updated.',
        };
    }
}



