@php
    /** @var array<string, mixed> $context */
    $name = $context['contact_name'] ?? 'there';
    $business = $context['business_name'] ?? 'your business';
    $community = $context['community_name'] ?? 'your community';
    $category = $context['category'] ?? 'this category';
    $spotsTotal = (int) ($context['spots_total'] ?? 0);
    $spotsHeld = (int) ($context['spots_held'] ?? 0);
    $remaining = max(0, $spotsTotal - $spotsHeld);
@endphp
<p>Hi {{ $name }},</p>
<p>When we last discussed {{ $business }}, visibility in {{ $category }} in {{ $community }} was opening up. Held placements are now at {{ $spotsHeld }} of {{ $spotsTotal }}.</p>
@if($remaining === 1)
<p>There is one spot left.</p>
@elseif($remaining > 1)
<p>There are {{ $remaining }} spots still open.</p>
@endif
<p>If you want to reserve a spot before it is gone, reply to this message and we will hold it for you.</p>
<p>Thank you,<br>{{ config('app.name') }}</p>
