<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>{{ ($confirmed ?? true) ? 'Unsubscribed' : 'Confirm unsubscribe' }} &mdash; Day.News</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #f4f5f7;
            color: #1a1a2e;
        }
        .wrap {
            max-width: 480px;
            margin: 10vh auto;
            padding: 40px 32px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            text-align: center;
        }
        .check {
            width: 56px;
            height: 56px;
            margin: 0 auto 20px;
            border-radius: 50%;
            background: #e6f7ee;
            color: #1aa86b;
            font-size: 30px;
            line-height: 56px;
        }
        h1 { font-size: 22px; margin: 0 0 12px; }
        p { font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 12px; }
        .biz { font-weight: 600; color: #1a1a2e; }
        a { color: #4f46e5; }
        .btn {
            display: inline-block;
            margin-top: 12px;
            padding: 12px 28px;
            font-size: 15px;
            font-weight: 600;
            color: #ffffff;
            background: #4f46e5;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }
        .btn:hover { background: #4338ca; }
        .icon { color: #4f46e5; background: #eef0ff; }
    </style>
</head>
<body>
    <div class="wrap">
        @if ($confirmed ?? true)
            <div class="check">&#10003;</div>
            <h1>You&rsquo;ve been unsubscribed</h1>
            @if (!empty($businessName))
                <p>We&rsquo;ve removed <span class="biz">{{ $businessName }}</span> from our campaign emails.</p>
            @endif
            <p>You will no longer receive marketing emails from the Day.News Learning Center. It may take a short time for any already-queued messages to stop.</p>
            <p>If this was a mistake or you have questions, contact us at
                <a href="mailto:{{ $mailto }}">{{ $mailto }}</a>.</p>
        @else
            <div class="check icon">&#9993;</div>
            <h1>Unsubscribe from emails?</h1>
            @if (!empty($businessName))
                <p>You&rsquo;re about to remove <span class="biz">{{ $businessName }}</span> from Day.News Learning Center campaign emails.</p>
            @else
                <p>You&rsquo;re about to stop receiving Day.News Learning Center campaign emails.</p>
            @endif
            <form method="POST" action="{{ $actionUrl }}">
                <button type="submit" class="btn">Yes, unsubscribe me</button>
            </form>
            <p style="margin-top:16px;">Didn&rsquo;t mean to click? You can safely close this page &mdash; nothing changes unless you confirm above.</p>
        @endif
    </div>
</body>
</html>
