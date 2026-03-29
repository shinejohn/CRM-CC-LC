@php
    /** @var array<string, mixed> $context */
    $name = $context['contact_name'] ?? 'there';
    $business = $context['business_name'] ?? 'your business';
    $community = $context['community_name'] ?? 'your community';
    $gate = $context['gate'] ?? $context['product'] ?? 'this placement';
    $category = $context['category'] ?? 'featured';
    $slotCounts = $context['slot_counts'] ?? [];
    $spotsLeft = null;
    foreach ($slotCounts as $row) {
        if (($row['category'] ?? '') === $category) {
            $spotsLeft = max(0, (int) ($row['total_slots'] ?? 0) - (int) ($row['held_slots'] ?? 0));
            break;
        }
    }
@endphp
<p>Hi {{ $name }},</p>
<p>Last time we connected, you were not ready to look at {{ $gate }} for {{ $business }}. That is completely fine.</p>
@if($spotsLeft !== null)
<p>Worth a quick look now? There are {{ $spotsLeft }} spots left in {{ $category }} in {{ $community }} — that number has shifted since we last spoke.</p>
@else
<p>Worth a quick look now in {{ $community }}? Inventory has shifted since we last spoke.</p>
@endif
<p>Reply when you are ready and we will open the section you paused on.</p>
<p>Thank you,<br>{{ config('app.name') }}</p>
