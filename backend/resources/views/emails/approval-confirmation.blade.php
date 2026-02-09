<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Approval Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2a37;">
    <h1>We received your approval</h1>
    <p>Hello {{ $approval->approver_name }},</p>
    <p>Thanks for approving <strong>{{ $serviceConfig['name'] ?? $approval->service_type }}</strong> for {{ $customer->business_name }}.</p>
    <p>We are now provisioning your service and will follow up with next steps within 1 business day.</p>
    <p>If you have questions, reply to this email.</p>
    <p>— Fibonacco Team</p>
</body>
</html>

