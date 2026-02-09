<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invalid Approval Token</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f6f7fb; color: #1f2a37; }
        .container { max-width: 640px; margin: 60px auto; background: #fff; padding: 32px; border-radius: 10px; box-shadow: 0 10px 30px rgba(16,24,40,.08); }
        .notice { background: #fee2e2; color: #991b1b; padding: 16px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Approval link expired or invalid</h1>
        <div class="notice">
            We couldn't verify this approval request. Please request a new approval link or contact support.
        </div>
        <p>If you need help, email {{ config('fibonacco.email.reply_to', config('mail.from.address')) }}.</p>
    </div>
</body>
</html>



