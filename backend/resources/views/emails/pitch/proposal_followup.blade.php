@php
    /** @var array<string, mixed> $context */
    $name = $context['contact_name'] ?? 'there';
    $business = $context['business_name'] ?? 'your business';
    $community = $context['community_name'] ?? 'your community';
    $total = $context['total_mrr'] ?? $context['proposal_value'] ?? null;
    $founderDays = $context['founder_days_remaining'] ?? null;
@endphp
<p>Hi {{ $name }},</p>
@if($founderDays !== null)
<p>Your founder pricing window in {{ $community }} is closing soon ({{ $founderDays }} days remaining). If you still want the package we scoped for {{ $business }}, reply and we will finalize it.</p>
@else
<p>I put together a proposal for {{ $business }} that has been ready for about a week. The numbers and placements are still valid.</p>
@if($total !== null)
<p>Total monthly scope: ${{ number_format((float) $total, 2) }}.</p>
@endif
<p>You can review and activate, or reply with changes and we will adjust the line items.</p>
@endif
<p>Thank you,<br>{{ config('app.name') }}</p>
