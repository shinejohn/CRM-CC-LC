<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Service Activated</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2a37;">
    <h1>Your service is active</h1>
    <p>Hello {{ $approval->approver_name }},</p>
    <p>Great news—<strong>{{ $serviceConfig['name'] ?? $approval->service_type }}</strong> is now active for {{ $customer->business_name }}.</p>
    <p>Activation details:</p>
    <ul>
        <li>Service type: {{ $approval->service_type }}</li>
        <li>Task status: {{ $task->status }}</li>
        <li>Completed at: {{ optional($task->completed_at)->toDateTimeString() ?? now()->toDateTimeString() }}</li>
    </ul>
    <p>If you need anything else, reply to this email.</p>
    <p>— Fibonacco Team</p>
</body>
</html>

