<div style="border: 1px solid #e4e7ec; border-radius: 8px; padding: 16px;">
    <h2 style="margin-top: 0;">Schedule your kickoff</h2>
    <p>Meeting topic: <strong>{{ $meetingTopic ?? 'Service kickoff and activation' }}</strong></p>
    <p>We will reach out within 1 business day to finalize details.</p>
    <p>Need to get in touch sooner? Email {{ config('fibonacco.email.reply_to', config('mail.from.address')) }}.</p>
</div>



