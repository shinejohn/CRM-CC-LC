@php
    /** @var array<string, mixed> $context */
    $name = $context['contact_name'] ?? 'there';
    $business = $context['business_name'] ?? 'your business';
    $community = $context['community_name'] ?? 'your community';
@endphp
<p>Hi {{ $name }},</p>
<p>We started putting together a presence plan for {{ $business }} in {{ $community }} but never got to the good part.</p>
<p>We had your profile saved and were ready to show you what is available in {{ $community }}.</p>
<p>If you would like to finish, use your secure resume link from the email we sent. You can also reply to this message and we will send a concise recap you can approve in one step.</p>
<p>Thank you,<br>{{ config('app.name') }}</p>
