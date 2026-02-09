# Module 0C: Email Gateway (Postal)

## Overview

**Owner:** Infrastructure Agent (same as Module 0)
**Timeline:** Week 1-2 (parallel with Module 0, 0B)
**Dependencies:** None (standalone infrastructure)
**Depended On By:** Module 0B (Communication Infrastructure)

This module deploys and configures Postal as the primary email sending infrastructure. Postal is an open-source mail server designed for high-volume transactional and marketing email. By self-hosting, we control our IP reputation, eliminate per-email costs, and have full visibility into deliverability.

## Why Postal

```
COST COMPARISON AT SCALE:
─────────────────────────────────────────────────────────────
Volume: 340M emails/month

AWS SES:        340M × $0.09/1000 = $30,600/month
Self-hosted:    Infrastructure only = ~$4,000/month

Annual savings: $319,200
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           POSTAL EMAIL GATEWAY                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         LOAD BALANCER                                    │   │
│  │                      (HAProxy / AWS ALB)                                 │   │
│  │                                                                          │   │
│  │   SMTP (25/587) ──────────┬────────────── HTTP API (443)                │   │
│  └───────────────────────────┼──────────────────────────────────────────────┘   │
│                              │                                                   │
│              ┌───────────────┼───────────────┐                                  │
│              │               │               │                                  │
│              ▼               ▼               ▼                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                         │
│  │   POSTAL-1    │ │   POSTAL-2    │ │   POSTAL-3    │                         │
│  │   (Primary)   │ │   (Worker)    │ │   (Worker)    │                         │
│  │               │ │               │ │               │                         │
│  │ • Web UI      │ │ • SMTP only   │ │ • SMTP only   │                         │
│  │ • API         │ │ • Processing  │ │ • Processing  │                         │
│  │ • SMTP        │ │               │ │               │                         │
│  │ • Cron        │ │               │ │               │                         │
│  └───────────────┘ └───────────────┘ └───────────────┘                         │
│         │                │                  │                                   │
│         └────────────────┼──────────────────┘                                   │
│                          │                                                      │
│                          ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         SHARED SERVICES                                  │   │
│  │                                                                          │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │   │   MySQL     │  │   Redis     │  │  RabbitMQ   │  │   S3/Minio  │   │   │
│  │   │  (postal)   │  │  (queue)    │  │  (workers)  │  │  (storage)  │   │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           IP POOLS                                       │   │
│  │                                                                          │   │
│  │   POOL: emergency    10 IPs   mail-e[01-10].fibonacco.com              │   │
│  │   POOL: alerts       15 IPs   mail-a[01-15].fibonacco.com              │   │
│  │   POOL: newsletters  20 IPs   mail-n[01-20].fibonacco.com              │   │
│  │   POOL: campaigns    15 IPs   mail-c[01-15].fibonacco.com              │   │
│  │   POOL: transactional 5 IPs   mail-t[01-05].fibonacco.com              │   │
│  │   POOL: warming      10 IPs   mail-w[01-10].fibonacco.com (rotation)   │   │
│  │                                                                          │   │
│  │   TOTAL: 75 IPs                                                         │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Requirements

### Servers

| Role | Specs | Quantity | Monthly Cost |
|------|-------|----------|--------------|
| Postal Primary | 8 vCPU, 32GB RAM, 500GB SSD | 1 | $150-300 |
| Postal Workers | 4 vCPU, 16GB RAM, 200GB SSD | 2 | $80-150 each |
| MySQL | 4 vCPU, 16GB RAM, 500GB SSD | 1 | $100-200 |
| Redis | 2 vCPU, 8GB RAM | 1 | $50-100 |
| **Total Servers** | | 5 | **$460-900** |

### IP Addresses

| Provider | IPs | Monthly Cost | Notes |
|----------|-----|--------------|-------|
| Hetzner | 75 | ~$75 | €1/IP/month |
| OVH | 75 | ~$150 | $2/IP/month |
| AWS | 75 | ~$300 | $4/IP/month (EIP) |

### Recommended Providers

**Option A: Hetzner (Best Value)**
- Dedicated servers with excellent pricing
- Easy IP acquisition
- Good network reputation
- EU-based (GDPR compliant)

**Option B: OVH**
- Good dedicated server options
- Reasonable IP costs
- Multiple datacenter locations

**Option C: AWS (Higher Cost, Easier Management)**
- EC2 instances for Postal
- Elastic IPs (limited, expensive)
- Better if rest of infrastructure is AWS

---

## Postal Configuration

### Docker Compose

```yaml
# docker-compose.postal.yml

version: '3.8'

services:
  postal:
    image: ghcr.io/postalserver/postal:3.3
    container_name: postal
    restart: always
    ports:
      - "25:25"      # SMTP
      - "587:587"    # SMTP Submission
      - "5000:5000"  # Web UI / API
    volumes:
      - ./config/postal.yml:/config/postal.yml:ro
      - postal-assets:/opt/postal/public/assets
      - postal-spool:/opt/postal/spool
    environment:
      - POSTAL_CONFIG_FILE=/config/postal.yml
    depends_on:
      - mysql
      - redis
      - rabbitmq
    networks:
      - postal-network

  postal-worker:
    image: ghcr.io/postalserver/postal:3.3
    command: postal worker
    restart: always
    volumes:
      - ./config/postal.yml:/config/postal.yml:ro
    environment:
      - POSTAL_CONFIG_FILE=/config/postal.yml
    depends_on:
      - postal
    deploy:
      replicas: 4  # Scale workers as needed
    networks:
      - postal-network

  postal-cron:
    image: ghcr.io/postalserver/postal:3.3
    command: postal cron
    restart: always
    volumes:
      - ./config/postal.yml:/config/postal.yml:ro
    environment:
      - POSTAL_CONFIG_FILE=/config/postal.yml
    depends_on:
      - postal
    networks:
      - postal-network

  mysql:
    image: mariadb:10.11
    restart: always
    volumes:
      - mysql-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=postal
      - MYSQL_USER=postal
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    networks:
      - postal-network

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis-data:/data
    networks:
      - postal-network

  rabbitmq:
    image: rabbitmq:3.12-alpine
    restart: always
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - postal-network

volumes:
  mysql-data:
  redis-data:
  rabbitmq-data:
  postal-assets:
  postal-spool:

networks:
  postal-network:
    driver: bridge
```

### Postal Configuration

```yaml
# config/postal.yml

postal:
  web_hostname: postal.fibonacco.com
  web_protocol: https
  smtp_hostname: smtp.fibonacco.com
  use_ip_pools: true
  default_maximum_delivery_attempts: 18
  default_maximum_hold_expiry_days: 7
  default_spam_threshold: 5.0
  default_spam_failure_threshold: 20.0
  
main_db:
  host: mysql
  database: postal
  username: postal
  password: <%= ENV['MYSQL_PASSWORD'] %>
  
message_db:
  host: mysql
  prefix: postal_msg_

rabbitmq:
  host: rabbitmq
  
redis:
  host: redis
  
logging:
  stdout: true
  
smtp_server:
  port: 25
  tls_enabled: true
  tls_certificate_path: /config/certs/smtp.crt
  tls_private_key_path: /config/certs/smtp.key
  proxy_protocol: false
  log_connections: true
  max_message_size: 50  # MB
  
smtp_relays: []  # We don't relay through external services

dns:
  # These get auto-configured
  mx_records:
    - mx.postal.fibonacco.com
  spf_record: "v=spf1 ip4:YOUR_IP_RANGE -all"
  dkim_identifier: postal
  return_path_domain: rp.fibonacco.com
  track_domain: track.fibonacco.com

webhooks:
  # Send delivery events to our app
  url: https://api.fibonacco.com/webhooks/postal
  timeout: 5
  sign: true
```

---

## IP Pool Configuration

### Pool Setup in Postal

```ruby
# Run in Postal console after setup

# Create organization
org = Organization.create!(
  name: 'Fibonacco',
  permalink: 'fibonacco',
  owner: User.first
)

# Create server
server = org.servers.create!(
  name: 'Production',
  permalink: 'production',
  mode: 'Live'
)

# Create IP Pools
pools = {
  'emergency' => {
    ips: (1..10).map { |i| "mail-e#{i.to_s.rjust(2, '0')}.fibonacco.com" },
    priority: 1
  },
  'alerts' => {
    ips: (1..15).map { |i| "mail-a#{i.to_s.rjust(2, '0')}.fibonacco.com" },
    priority: 2
  },
  'newsletters' => {
    ips: (1..20).map { |i| "mail-n#{i.to_s.rjust(2, '0')}.fibonacco.com" },
    priority: 3
  },
  'campaigns' => {
    ips: (1..15).map { |i| "mail-c#{i.to_s.rjust(2, '0')}.fibonacco.com" },
    priority: 4
  },
  'transactional' => {
    ips: (1..5).map { |i| "mail-t#{i.to_s.rjust(2, '0')}.fibonacco.com" },
    priority: 5
  },
  'warming' => {
    ips: (1..10).map { |i| "mail-w#{i.to_s.rjust(2, '0')}.fibonacco.com" },
    priority: 6
  }
}

pools.each do |name, config|
  pool = server.ip_pools.create!(name: name)
  config[:ips].each do |hostname|
    pool.ip_addresses.create!(
      hostname: hostname,
      ipv4: resolve_ip(hostname),  # Your IP assignment
      priority: config[:priority]
    )
  end
end
```

### DNS Configuration

For each IP address, configure:

```
; Example for mail-e01.fibonacco.com (emergency pool IP 1)

; A record
mail-e01.fibonacco.com.    IN A    203.0.113.10

; PTR record (reverse DNS - configure with IP provider)
10.113.0.203.in-addr.arpa. IN PTR  mail-e01.fibonacco.com.

; SPF (on main domain)
fibonacco.com.             IN TXT  "v=spf1 ip4:203.0.113.0/24 -all"

; DKIM (Postal generates keys)
postal._domainkey.fibonacco.com. IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCS..."

; DMARC
_dmarc.fibonacco.com.      IN TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@fibonacco.com"

; MX for bounce handling
fibonacco.com.             IN MX   10 mx.postal.fibonacco.com.
rp.fibonacco.com.          IN MX   10 mx.postal.fibonacco.com.

; Tracking subdomain
track.fibonacco.com.       IN CNAME postal.fibonacco.com.
```

---

## Laravel Integration

### Implementation Summary (Backend)

- **Service:** `app/Services/EmailService.php` sends via Postal with automatic failover and suppression checks.
- **Webhook:** `app/Http/Controllers/Api/PostalWebhookController.php` verifies signatures, updates `campaign_recipients`, and tracks `outbound_campaigns` metrics.
- **Storage:** `email_delivery_events` (event log) and `email_suppressions` (hard bounce list).

### Webhook Endpoint

```
POST /api/outbound/email/postal/webhook
Header: X-Postal-Signature (HMAC-SHA1 base64 of raw JSON body)
```

### Configuration

```php
<?php
// config/services.php (excerpt)

'postal' => [
    'api_url' => env('POSTAL_API_URL'),
    'server_key' => env('POSTAL_SERVER_KEY'),
    'webhook_secret' => env('POSTAL_WEBHOOK_SECRET'),
    'default_ip_pool' => env('POSTAL_DEFAULT_IP_POOL'),
],

'email_gateway' => [
    'provider' => env('EMAIL_PROVIDER', 'postal'),
    'fallback_provider' => env('EMAIL_FALLBACK_PROVIDER', 'ses'),
],
```

### Database Tables

- `email_delivery_events` — records Postal webhook events and payloads.
- `email_suppressions` — hard-bounce suppression list (pre-send enforcement).

---

## IP Warming Strategy

### Organic Warming (Recommended)

Since you're starting with 4 subscribers and growing organically, IPs will warm naturally:

```
ORGANIC WARMING TIMELINE:
─────────────────────────────────────────────────────────────

Month 1: 4 → 100 subscribers
├── Volume: ~400 emails/month
├── Use: 2 IPs from 'campaigns' pool
└── Reputation: Building naturally

Month 2: 100 → 1,000 subscribers
├── Volume: ~4,000 emails/month
├── Use: 3-4 IPs from pools
└── Reputation: Establishing

Month 3-6: 1,000 → 10,000 subscribers
├── Volume: ~40,000 emails/month
├── Use: 5-10 IPs
└── Reputation: Solid

Month 6-12: 10,000 → 100,000 subscribers
├── Volume: ~400,000 emails/month
├── Use: 15-25 IPs
└── Reputation: Strong

Year 2+: 100,000+ subscribers
├── Volume: Millions/month
├── Use: All pools active
└── Reputation: Excellent (if maintained)
```

### Warmup Automation (For Accelerated Growth)

If you acquire a large list or need to accelerate:

```php
<?php

namespace App\Services\Email;

class IpWarmupService
{
    /**
     * Daily sending limits per IP based on warmup stage
     */
    private array $warmupSchedule = [
        1 => 50,      // Day 1
        2 => 100,
        3 => 200,
        4 => 400,
        5 => 800,
        6 => 1500,
        7 => 3000,
        8 => 5000,
        14 => 10000,
        21 => 25000,
        28 => 50000,
        35 => 100000, // Day 35+: Full capacity
    ];
    
    public function getDailyLimit(string $ipAddress): int
    {
        $warmupDay = $this->getWarmupDay($ipAddress);
        
        foreach (array_reverse($this->warmupSchedule, true) as $day => $limit) {
            if ($warmupDay >= $day) {
                return $limit;
            }
        }
        
        return 50; // Default minimum
    }
    
    public function getWarmupDay(string $ipAddress): int
    {
        $startDate = IpWarmup::where('ip_address', $ipAddress)
            ->value('started_at');
        
        if (!$startDate) {
            // Start warmup tracking
            IpWarmup::create([
                'ip_address' => $ipAddress,
                'started_at' => now(),
            ]);
            return 1;
        }
        
        return $startDate->diffInDays(now()) + 1;
    }
    
    public function selectIpForSend(string $pool, int $dailySentCount): ?string
    {
        // Get IPs in pool sorted by warmth (most warmed first)
        $ips = IpAddress::where('pool', $pool)
            ->orderByDesc('warmup_day')
            ->get();
        
        foreach ($ips as $ip) {
            $limit = $this->getDailyLimit($ip->address);
            $sent = $this->getDailySentCount($ip->address);
            
            if ($sent < $limit) {
                return $ip->address;
            }
        }
        
        return null; // All IPs at capacity
    }
}
```

---

## Monitoring & Alerting

### Deliverability Monitoring

```php
<?php

namespace App\Services\Email;

class DeliverabilityMonitor
{
    /**
     * Check IP health metrics
     */
    public function checkIpHealth(): array
    {
        $issues = [];
        
        // Check each IP's metrics
        $ips = IpAddress::where('is_active', true)->get();
        
        foreach ($ips as $ip) {
            $metrics = $this->getIpMetrics($ip->address, hours: 24);
            
            // High bounce rate
            if ($metrics['bounce_rate'] > 5) {
                $issues[] = [
                    'ip' => $ip->address,
                    'issue' => 'high_bounce_rate',
                    'value' => $metrics['bounce_rate'],
                    'threshold' => 5,
                ];
            }
            
            // High complaint rate
            if ($metrics['complaint_rate'] > 0.1) {
                $issues[] = [
                    'ip' => $ip->address,
                    'issue' => 'high_complaint_rate',
                    'value' => $metrics['complaint_rate'],
                    'threshold' => 0.1,
                ];
            }
            
            // Low delivery rate
            if ($metrics['delivery_rate'] < 95) {
                $issues[] = [
                    'ip' => $ip->address,
                    'issue' => 'low_delivery_rate',
                    'value' => $metrics['delivery_rate'],
                    'threshold' => 95,
                ];
            }
        }
        
        return $issues;
    }
    
    private function getIpMetrics(string $ip, int $hours): array
    {
        $since = now()->subHours($hours);
        
        $stats = DB::table('message_queue')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced,
                SUM(CASE WHEN status = 'complained' THEN 1 ELSE 0 END) as complained
            ")
            ->where('gateway', 'postal')
            ->where('created_at', '>=', $since)
            ->whereRaw("content_data->>'ip' = ?", [$ip])
            ->first();
        
        $total = $stats->total ?: 1;
        
        return [
            'total' => $stats->total,
            'delivery_rate' => ($stats->delivered / $total) * 100,
            'bounce_rate' => ($stats->bounced / $total) * 100,
            'complaint_rate' => ($stats->complained / $total) * 100,
        ];
    }
}
```

### Blacklist Monitoring

```php
<?php

namespace App\Jobs\Email;

class CheckBlacklists implements ShouldQueue
{
    private array $blacklistServices = [
        'zen.spamhaus.org',
        'bl.spamcop.net',
        'b.barracudacentral.org',
        'dnsbl.sorbs.net',
        'psbl.surriel.com',
    ];
    
    public function handle()
    {
        $ips = IpAddress::where('is_active', true)->pluck('ipv4');
        
        foreach ($ips as $ip) {
            foreach ($this->blacklistServices as $bl) {
                if ($this->isBlacklisted($ip, $bl)) {
                    // Alert immediately
                    Notification::route('slack', config('services.slack.alerts'))
                        ->notify(new IpBlacklistedNotification($ip, $bl));
                    
                    // Log for tracking
                    BlacklistEvent::create([
                        'ip_address' => $ip,
                        'blacklist' => $bl,
                        'detected_at' => now(),
                    ]);
                    
                    // Consider removing IP from rotation
                    IpAddress::where('ipv4', $ip)->update(['is_active' => false]);
                }
            }
        }
    }
    
    private function isBlacklisted(string $ip, string $blacklist): bool
    {
        $reversed = implode('.', array_reverse(explode('.', $ip)));
        $lookup = $reversed . '.' . $blacklist;
        
        $result = dns_get_record($lookup, DNS_A);
        
        return !empty($result);
    }
}
```

---

## Deployment Checklist

### Week 1: Infrastructure Setup

- [ ] Provision servers (Hetzner/OVH/AWS)
- [ ] Acquire IP addresses (75 IPs)
- [ ] Configure reverse DNS (PTR records) for all IPs
- [ ] Deploy Postal via Docker
- [ ] Configure MySQL, Redis, RabbitMQ
- [ ] Set up SSL certificates

### Week 1: DNS Configuration

- [ ] Configure A records for all mail-*.fibonacco.com
- [ ] Configure MX records for bounce handling
- [ ] Configure SPF record
- [ ] Generate and configure DKIM keys
- [ ] Configure DMARC record
- [ ] Configure tracking subdomain

### Week 2: Application Integration

- [ ] Create Postal organization and server
- [ ] Configure IP pools
- [x] Deploy Postal integration in backend (`EmailService`)
- [x] Configure Postal webhook endpoint (`/api/outbound/email/postal/webhook`)
- [ ] Test single email sending
- [ ] Test batch sending
- [ ] Test open/click tracking
- [ ] Test bounce handling

### Week 2: Monitoring

- [ ] Set up deliverability monitoring
- [ ] Set up blacklist monitoring
- [ ] Configure Slack/email alerts
- [ ] Set up Grafana dashboards
- [ ] Document runbooks

---

## Acceptance Criteria

### Must Have
- [ ] Postal cluster deployed and operational
- [ ] All 75 IPs configured with proper DNS
- [ ] IP pools created and routable
- [x] Postal sending integrated into backend (`EmailService`)
- [x] Webhooks processing delivery events (`PostalWebhookController`)
- [x] Bounce handling → suppression list (`email_suppressions`)
- [ ] Basic monitoring operational

### Should Have
- [ ] Automated blacklist checking
- [ ] IP warmup tracking
- [ ] Deliverability dashboard
- [x] Automated failover to SES (fallback provider)

### Nice to Have
- [ ] Predictive IP health scoring
- [ ] Automated IP rotation for warming
- [ ] A/B testing of send times

---

## Cost Summary

```
MONTHLY INFRASTRUCTURE COSTS:
─────────────────────────────────────────────────────────────

Servers (Hetzner):
├── 1× Dedicated (Primary): $150
├── 2× Dedicated (Workers): $160
├── 1× MySQL: $100
├── 1× Redis: $50
└── Server total: $460

IPs:
├── 75 IPs @ €1/month: $75
└── IP total: $75

Monitoring:
├── External monitoring: $100
└── Monitoring total: $100

─────────────────────────────────────────────────────────────
TOTAL: ~$635/month

vs SES at 340M emails: $30,600/month
SAVINGS: $29,965/month = $359,580/year
```

---

## Notes for Agent

1. **Start immediately** - IPs need time to warm, start day 1
2. **PTR records are critical** - Without reverse DNS, emails go to spam
3. **Monitor everything** - Reputation is fragile, catch issues early
4. **Document IPs** - Track which IPs are assigned to which pool
5. **Keep SES ready** - It's your failover, keep credentials configured

---

## Deferred Work Report

### Infrastructure & DNS
- Provision Postal infrastructure (servers, storage, Redis, RabbitMQ).
- Acquire and configure all 75 IPs with forward and reverse DNS.
- Issue and install SSL certificates for Postal web UI/API and SMTP.
- Configure MX, SPF, DKIM, DMARC, and tracking subdomain records.

### Postal App Setup
- Create Postal organization and server in the UI.
- Define IP pools and attach IPs.
- Validate SMTP/API connectivity and routing through load balancer.

### Validation & Monitoring
- End-to-end tests for send, open, click, bounce flows.
- Deliverability monitoring and alerting (bounce/complaint thresholds).
- Blacklist monitoring and automated remediation.
- Dashboards (Grafana) and operational runbooks.

### Warmup & Operations
- IP warmup automation for accelerated growth scenarios.
- Periodic review of suppression list and remediation workflows.
