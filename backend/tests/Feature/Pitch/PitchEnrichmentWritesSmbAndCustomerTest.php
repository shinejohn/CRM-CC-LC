<?php

declare(strict_types=1);

namespace Tests\Feature\Pitch;

use App\Models\Community;
use App\Models\Customer;
use App\Models\PitchSession;
use App\Models\SMB;
use App\Services\Pitch\PitchEnrichmentService;
use Illuminate\Support\Str;
use Tests\TestCase;

final class PitchEnrichmentWritesSmbAndCustomerTest extends TestCase
{
    public function test_business_profiled_persists_smb_and_customer_and_links_session(): void
    {
        $community = Community::factory()->create();

        $session = PitchSession::query()->create([
            'id' => (string) Str::uuid(),
            'community_id' => $community->id,
            'entry_platform' => 'web',
            'status' => 'pitching',
            'last_step' => 'business_profile',
        ]);

        $email = 'pitch-owner-'.Str::random(8).'@example.com';

        app(PitchEnrichmentService::class)->process($session, 'business_profiled', [
            'business_name' => 'Riverbend Cafe',
            'category' => 'restaurant',
            'org_type' => 'llc',
            'pitch_track' => 'standard',
            'primary_email' => $email,
            'contact_email' => $email,
            'contact_name' => 'Alex Owner',
            'primary_contact_name' => 'Alex Owner',
        ]);

        $session->refresh();

        $this->assertNotNull($session->smb_id);
        $this->assertNotNull($session->customer_id);

        $smb = SMB::query()->findOrFail($session->smb_id);
        $this->assertSame('Riverbend Cafe', $smb->business_name);
        $this->assertSame('restaurant', $smb->category);
        $this->assertSame($community->id, $smb->community_id);
        $this->assertSame($session->id, $smb->active_pitch_session_id);

        $customer = Customer::query()->findOrFail($session->customer_id);
        $this->assertSame($email, $customer->primary_email);
        $this->assertSame((string) $smb->id, (string) $customer->smb_id);
    }
}
