<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class CampaignSend extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'uuid',
        'smb_id',
        'campaign_id',
        'email',
        'subject',
        'scheduled_for',
        'sent_at',
        'message_id',
        'status',
        'delivered_at',
        'opened_at',
        'clicked_at',
        'bounced_at',
        'complained_at',
        'followup_triggered_at',
        'followup_count',
        'followup_strategy',
        'rvm_triggered',
        'rvm_drop_id',
    ];

    /**
     * Get the columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['id', 'uuid'];
    }

    protected $casts = [
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
        'bounced_at' => 'datetime',
        'complained_at' => 'datetime',
        'followup_triggered_at' => 'datetime',
        'rvm_triggered' => 'boolean',
    ];

    /**
     * Get the customer (SMB) associated with this campaign send
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'smb_id');
    }

    /**
     * Get the campaign associated with this send
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class, 'campaign_id', 'id');
    }
}



