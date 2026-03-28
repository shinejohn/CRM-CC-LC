<?php

namespace App\Enums;

enum PoolType: string
{
    case Transactional = 'transactional';
    case Broadcast = 'broadcast';
    case SmbCampaign = 'smb_campaign';
}
