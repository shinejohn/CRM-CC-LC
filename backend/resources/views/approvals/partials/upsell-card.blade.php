<div style="border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px;">
    <h3 style="margin-top: 0;">{{ $upsell['name'] }}</h3>
    <p>{{ $upsell['description'] }}</p>
    <p><strong>{{ $upsell['benefit'] }}</strong></p>

    @if(($upsell['status'] ?? null) === 'accepted')
        <p style="color: #047857;">Accepted</p>
    @elseif(($upsell['status'] ?? null) === 'declined')
        <p style="color: #b42318;">Declined</p>
    @else
        <form method="POST" action="/approve/upsell" style="display: inline-block; margin-right: 8px;">
            @csrf
            <input type="hidden" name="approval_id" value="{{ $approval->id }}">
            <input type="hidden" name="upsell_type" value="{{ $upsell['type'] }}">
            <button type="submit">Add this service</button>
        </form>
        <form method="POST" action="/approve/upsell/decline" style="display: inline-block;">
            @csrf
            <input type="hidden" name="approval_id" value="{{ $approval->id }}">
            <input type="hidden" name="upsell_type" value="{{ $upsell['type'] }}">
            <button type="submit" style="background: #fff; color: #1f2a37; border: 1px solid #d0d5dd;">No thanks</button>
        </form>
    @endif
</div>



