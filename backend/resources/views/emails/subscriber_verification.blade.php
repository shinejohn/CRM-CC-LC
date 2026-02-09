<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h1 style="color: #333;">Verify Your Email Address</h1>
        
        @if(isset($first_name) && $first_name)
            <p>Hi {{ $first_name }},</p>
        @else
            <p>Hi there,</p>
        @endif
        
        <p>Thank you for subscribing! Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $verification_url }}" style="background-color: #007bff; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">{{ $verification_url }}</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This link will expire in 24 hours. If you didn't subscribe to our newsletter, please ignore this email.
        </p>
    </div>
</body>
</html>



