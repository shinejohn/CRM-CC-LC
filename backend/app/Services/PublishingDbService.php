<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Direct read-only access to the Publishing Platform (Day.News) Postgres database.
 *
 * Uses the `publishing` database connection defined in config/database.php.
 * Replaces the HTTP bridge for all data-sync operations — much faster, no HTTP timeout risk,
 * and removes the dependency on the PP HTTP layer being up during sync.
 *
 * The `publishing` connection is READ-ONLY by convention; all writes go back
 * to PP via PublishingPlatformService (HTTP bridge).
 */
final class PublishingDbService
{
    private const CONN = 'publishing';
    private const PER_PAGE = 500;

    /**
     * Check that the publishing connection is reachable.
     */
    public function isReachable(): bool
    {
        try {
            DB::connection(self::CONN)->selectOne('SELECT 1');
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    // ─── Communities ──────────────────────────────────────────────────

    /**
     * @return array<int, array<string, mixed>>
     */
    public function exportCommunities(): array
    {
        try {
            $rows = DB::connection(self::CONN)->select(
                'SELECT * FROM communities WHERE is_active = true ORDER BY name'
            );
            return array_map(fn ($r) => $this->decodeJsonFields((array) $r, ['settings', 'metadata']), $rows);
        } catch (\Throwable $e) {
            Log::error('PublishingDbService::exportCommunities failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    // ─── Businesses ───────────────────────────────────────────────────

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function exportBusinesses(?string $communityId = null, int $page = 1): array
    {
        $offset = ($page - 1) * self::PER_PAGE;

        try {
            if ($communityId) {
                $total = (int) DB::connection(self::CONN)->selectOne(
                    "SELECT COUNT(*) as cnt FROM businesses WHERE status = 'active' AND community_id = ?",
                    [$communityId]
                )->cnt;

                $rows = DB::connection(self::CONN)->select(
                    "SELECT * FROM businesses WHERE status = 'active' AND community_id = ? ORDER BY name LIMIT ? OFFSET ?",
                    [$communityId, self::PER_PAGE, $offset]
                );
            } else {
                $total = (int) DB::connection(self::CONN)->selectOne(
                    "SELECT COUNT(*) as cnt FROM businesses WHERE status = 'active'"
                )->cnt;

                $rows = DB::connection(self::CONN)->select(
                    "SELECT * FROM businesses WHERE status = 'active' ORDER BY name LIMIT ? OFFSET ?",
                    [self::PER_PAGE, $offset]
                );
            }

            $data = array_map(
                fn ($r) => $this->decodeJsonFields((array) $r, ['categories', 'opening_hours', 'images', 'metadata']),
                $rows
            );

            return [
                'data' => $data,
                'meta' => [
                    'current_page' => $page,
                    'last_page'    => max(1, (int) ceil($total / self::PER_PAGE)),
                    'per_page'     => self::PER_PAGE,
                    'total'        => $total,
                ],
            ];
        } catch (\Throwable $e) {
            Log::error('PublishingDbService::exportBusinesses failed', ['error' => $e->getMessage()]);
            return ['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]];
        }
    }

    // ─── Civic Entities ───────────────────────────────────────────────

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function exportCivicEntities(?string $communityId = null, int $page = 1): array
    {
        $offset = ($page - 1) * self::PER_PAGE;

        try {
            if ($communityId) {
                $total = (int) DB::connection(self::CONN)->selectOne(
                    'SELECT COUNT(*) as cnt FROM civic_entities WHERE is_active = true AND community_id = ?',
                    [$communityId]
                )->cnt;

                $rows = DB::connection(self::CONN)->select(
                    'SELECT * FROM civic_entities WHERE is_active = true AND community_id = ? ORDER BY legal_name LIMIT ? OFFSET ?',
                    [$communityId, self::PER_PAGE, $offset]
                );
            } else {
                $total = (int) DB::connection(self::CONN)->selectOne(
                    'SELECT COUNT(*) as cnt FROM civic_entities WHERE is_active = true'
                )->cnt;

                $rows = DB::connection(self::CONN)->select(
                    'SELECT * FROM civic_entities WHERE is_active = true ORDER BY legal_name LIMIT ? OFFSET ?',
                    [self::PER_PAGE, $offset]
                );
            }

            $data = array_map(fn ($r) => $this->decodeJsonFields((array) $r, ['metadata']), $rows);

            return [
                'data' => $data,
                'meta' => [
                    'current_page' => $page,
                    'last_page'    => max(1, (int) ceil($total / self::PER_PAGE)),
                    'per_page'     => self::PER_PAGE,
                    'total'        => $total,
                ],
            ];
        } catch (\Throwable $e) {
            Log::error('PublishingDbService::exportCivicEntities failed', ['error' => $e->getMessage()]);
            return ['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]];
        }
    }

    // ─── Nonprofits ───────────────────────────────────────────────────

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function exportNonprofits(?string $communityId = null, int $page = 1): array
    {
        $offset = ($page - 1) * self::PER_PAGE;

        try {
            if ($communityId) {
                $total = (int) DB::connection(self::CONN)->selectOne(
                    'SELECT COUNT(*) as cnt
                     FROM nonprofit_organizations np
                     JOIN nonprofit_community nc ON nc.nonprofit_organization_id = np.id
                     WHERE np.is_active = true AND nc.community_id = ?',
                    [$communityId]
                )->cnt;

                $rows = DB::connection(self::CONN)->select(
                    'SELECT np.*, nc.community_id FROM nonprofit_organizations np
                     JOIN nonprofit_community nc ON nc.nonprofit_organization_id = np.id
                     WHERE np.is_active = true AND nc.community_id = ?
                     ORDER BY np.legal_name LIMIT ? OFFSET ?',
                    [$communityId, self::PER_PAGE, $offset]
                );
            } else {
                $total = (int) DB::connection(self::CONN)->selectOne(
                    'SELECT COUNT(*) as cnt
                     FROM nonprofit_organizations np
                     JOIN nonprofit_community nc ON nc.nonprofit_organization_id = np.id
                     WHERE np.is_active = true'
                )->cnt;

                $rows = DB::connection(self::CONN)->select(
                    'SELECT np.*, nc.community_id FROM nonprofit_organizations np
                     JOIN nonprofit_community nc ON nc.nonprofit_organization_id = np.id
                     WHERE np.is_active = true
                     ORDER BY np.legal_name LIMIT ? OFFSET ?',
                    [self::PER_PAGE, $offset]
                );
            }

            $data = array_map(fn ($r) => $this->decodeJsonFields((array) $r, ['metadata']), $rows);

            return [
                'data' => $data,
                'meta' => [
                    'current_page' => $page,
                    'last_page'    => max(1, (int) ceil($total / self::PER_PAGE)),
                    'per_page'     => self::PER_PAGE,
                    'total'        => $total,
                ],
            ];
        } catch (\Throwable $e) {
            Log::error('PublishingDbService::exportNonprofits failed', ['error' => $e->getMessage()]);
            return ['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]];
        }
    }

    // ─── Business Subscriptions ───────────────────────────────────────

    /**
     * @return array<int, array<string, mixed>>
     */
    public function exportBusinessSubscriptions(?string $communityId = null): array
    {
        try {
            if ($communityId) {
                $rows = DB::connection(self::CONN)->select(
                    "SELECT bs.* FROM business_subscriptions bs
                     JOIN businesses b ON b.id = bs.business_id
                     WHERE bs.status IN ('active', 'grace_period') AND b.community_id = ?",
                    [$communityId]
                );
            } else {
                $rows = DB::connection(self::CONN)->select(
                    "SELECT * FROM business_subscriptions WHERE status IN ('active', 'grace_period')"
                );
            }

            return array_map(fn ($r) => (array) $r, $rows);
        } catch (\Throwable $e) {
            Log::error('PublishingDbService::exportBusinessSubscriptions failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    // ─── Stats (for quick count displays in UI) ───────────────────────

    /**
     * @return array<string, int>
     */
    public function getCounts(): array
    {
        try {
            return [
                'communities'  => (int) DB::connection(self::CONN)->selectOne('SELECT COUNT(*) as cnt FROM communities WHERE is_active = true')->cnt,
                'businesses'   => (int) DB::connection(self::CONN)->selectOne("SELECT COUNT(*) as cnt FROM businesses WHERE status = 'active'")->cnt,
                'civic'        => (int) DB::connection(self::CONN)->selectOne('SELECT COUNT(*) as cnt FROM civic_entities WHERE is_active = true')->cnt,
                'nonprofits'   => (int) DB::connection(self::CONN)->selectOne('SELECT COUNT(*) as cnt FROM nonprofit_organizations WHERE is_active = true')->cnt,
                'subscriptions'=> (int) DB::connection(self::CONN)->selectOne("SELECT COUNT(*) as cnt FROM business_subscriptions WHERE status IN ('active','grace_period')")->cnt,
            ];
        } catch (\Throwable $e) {
            Log::error('PublishingDbService::getCounts failed', ['error' => $e->getMessage()]);
            return ['communities' => 0, 'businesses' => 0, 'civic' => 0, 'nonprofits' => 0, 'subscriptions' => 0];
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    /**
     * Decode JSON string fields that Postgres returns as strings when fetched via raw PDO.
     *
     * @param  array<string, mixed>  $row
     * @param  string[]  $fields
     * @return array<string, mixed>
     */
    private function decodeJsonFields(array $row, array $fields): array
    {
        foreach ($fields as $field) {
            if (isset($row[$field]) && is_string($row[$field])) {
                $decoded = json_decode($row[$field], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $row[$field] = $decoded;
                }
            }
        }

        return $row;
    }
}
