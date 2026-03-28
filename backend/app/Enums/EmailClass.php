<?php

namespace App\Enums;

enum EmailClass: string
{
    case Transactional = 'transactional';
    case Notification = 'notification';
    case Broadcast = 'broadcast';
    case SmbCampaign = 'smb_campaign';
    case System = 'system';
}
