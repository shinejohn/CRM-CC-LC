<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Approval</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f6f7fb; color: #1f2a37; }
        .container { max-width: 720px; margin: 40px auto; background: #fff; padding: 32px; border-radius: 10px; box-shadow: 0 10px 30px rgba(16,24,40,.08); }
        h1 { margin-top: 0; }
        .service { background: #f0f6ff; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .row { margin-bottom: 14px; }
        label { display: block; font-weight: 600; margin-bottom: 6px; }
        input[type="text"], input[type="email"], input[type="tel"] { width: 100%; padding: 10px 12px; border: 1px solid #d0d5dd; border-radius: 6px; }
        .actions { margin-top: 20px; }
        button { background: #2563eb; color: #fff; border: none; padding: 12px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .meta { color: #667085; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Confirm your approval</h1>
        <p class="meta">We will activate the service after you submit this form.</p>

        <div class="service">
            <h2>{{ $serviceName }}</h2>
            <p>{{ $serviceDescription }}</p>
            <p class="meta">Business: {{ $customer->business_name }} @if($customer->community) ({{ $customer->community->name }}) @endif</p>
        </div>

        <form method="POST" action="/approve">
            @csrf
            <input type="hidden" name="customer_id" value="{{ $customer->id }}">
            <input type="hidden" name="service_type" value="{{ $serviceType }}">
            <input type="hidden" name="source" value="{{ $source }}">
            <input type="hidden" name="token" value="{{ $token }}">

            <div class="row">
                <label for="approver_name">Your name</label>
                <input id="approver_name" name="approver_name" type="text" required>
            </div>

            <div class="row">
                <label for="approver_email">Email</label>
                <input id="approver_email" name="approver_email" type="email" required>
            </div>

            <div class="row">
                <label for="approver_phone">Phone (optional)</label>
                <input id="approver_phone" name="approver_phone" type="tel">
            </div>

            <div class="row">
                <label>
                    <input type="checkbox" name="contact_consent" required>
                    I consent to be contacted about this service.
                </label>
            </div>

            <div class="actions">
                <button type="submit">Approve &amp; Continue</button>
            </div>
        </form>
    </div>
</body>
</html>

