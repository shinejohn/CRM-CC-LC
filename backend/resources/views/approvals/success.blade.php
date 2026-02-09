<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Approval Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f6f7fb; color: #1f2a37; }
        .container { max-width: 760px; margin: 40px auto; background: #fff; padding: 32px; border-radius: 10px; box-shadow: 0 10px 30px rgba(16,24,40,.08); }
        h1 { margin-top: 0; }
        .section { margin-top: 24px; }
        .upsells { display: grid; grid-template-columns: 1fr; gap: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Approval received</h1>
        <p>Thanks {{ $approval->approver_name }}. Your approval for <strong>{{ $approval->service_type }}</strong> is confirmed.</p>
        <p>We will begin provisioning for {{ $approval->customer->business_name }} and email you with next steps.</p>

        <div class="section">
            <h2>Recommended add-ons</h2>
            @if($upsells->count())
                <div class="upsells">
                    @foreach($upsells as $upsell)
                        @include('approvals.partials.upsell-card', ['upsell' => $upsell, 'approval' => $approval])
                    @endforeach
                </div>
            @else
                <p>No add-ons available for this service.</p>
            @endif
        </div>

        <div class="section">
            @include('approvals.partials.meeting-scheduler', ['meetingTopic' => $meetingTopic, 'approval' => $approval])
        </div>
    </div>
</body>
</html>

