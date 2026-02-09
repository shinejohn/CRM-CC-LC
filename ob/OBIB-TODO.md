# OBIB System TODO

## Email Gateway Follow-ups
- [ ] Set required env vars: `POSTAL_API_URL`, `POSTAL_SERVER_KEY`, `POSTAL_WEBHOOK_SECRET`, `POSTAL_DEFAULT_IP_POOL`, `EMAIL_PROVIDER`, `EMAIL_FALLBACK_PROVIDER`.
- [ ] Confirm no email-related mock data exists to comment out.
- [ ] Run recommended tests:
  - `php artisan test --filter PostalWebhookTest`
  - `php artisan migrate`
- [ ] If you want me to run migrations or tests, say the word.

## Module 0 Follow-ups
- [ ] Install Redis locally: `brew install redis`.
- [ ] Start Redis: `brew services start redis`.
- [ ] Verify Redis connectivity: `REDIS_CLIENT=predis php artisan tinker --execute="app('redis')->connection()->ping();"`.
- [ ] Verify Horizon status: `REDIS_CLIENT=predis php artisan horizon:status`.
- [ ] Start Horizon (background): `REDIS_CLIENT=predis php artisan horizon`.

## Module 12 Follow-ups
- [ ] Create migrations for `subscribers`, `subscriber_communities`, `subscriber_alert_preferences`, `community_email_lists`, `community_sms_lists`, `email_verifications`, `unsubscribe_tokens`, `subscriber_events`.
- [ ] Implement Eloquent models and relationships for all Module 12 tables.
- [ ] Implement request validation classes for registration, profile update, preferences, alerts, and device tokens.
- [ ] Build subscriber auth guard, login flow, and token issuance for B2C users.
- [ ] Implement `SubscriberService`, `ListService`, and `EngagementService` plus interfaces.
- [ ] Implement controllers for public, subscriber, and admin endpoints.
- [ ] Add queue jobs for list compilation, engagement scoring, bounce processing, token cleanup, and re-engagement campaigns.
- [ ] Wire event listeners for delivery/open/click/bounce/complaint events from Module 0B.
- [ ] Implement device token registration/unregistration with de-duplication and purge handling.
- [ ] Add admin export, stats, and status update endpoints with role-based access.
- [ ] Add feature and unit tests covering registration, verification, unsubscribe scopes, and list compilation.

## Module 4 Follow-ups
- [ ] Verify approval system test coverage meets 80% target with coverage tooling.

