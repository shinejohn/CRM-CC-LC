<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We Miss You!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h1 style="color: #333;">We Miss You!</h1>
        
        @if(isset($first_name) && $first_name)
            <p>Hi {{ $first_name }},</p>
        @else
            <p>Hi there,</p>
        @endif
        
        <p>It's been a while since we've heard from you. We'd love to have you back!</p>
        
        <p>Update your preferences to continue receiving updates that matter to you:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $preferences_url }}" style="background-color: #007bff; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Update Preferences</a>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If you no longer wish to receive emails, you can unsubscribe using the link in your preferences.
        </p>
    </div>
</body>
</html>



