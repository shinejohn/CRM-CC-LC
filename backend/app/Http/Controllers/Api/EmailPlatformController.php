<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\PoolType;
use App\Http\Controllers\Controller;
use App\Models\EmailPool;
use App\Models\EmailSender;
use App\Services\Email\PostalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin controller for managing the CC email platform configuration.
 * Handles pool credentials (Postal API keys) and sender verification.
 */
final class EmailPlatformController extends Controller
{
    // ── Pool configuration ────────────────────────────────────────────────────

    public function getPools(): JsonResponse
    {
        $pools = EmailPool::all()->map(fn (EmailPool $p) => [
            'id'        => $p->id,
            'pool_type' => $p->pool_type->value,
            'provider'  => $p->provider,
            'api_url'   => $p->api_url,
            'api_key'   => $p->api_key ? '••••••••' . substr($p->api_key, -4) : null,
            'host'      => $p->host,
            'port'      => $p->port,
            'username'  => $p->username,
            'configured' => ! empty($p->api_url) && ! empty($p->api_key),
        ]);

        return response()->json(['data' => $pools]);
    }

    public function upsertPool(Request $request, string $poolType): JsonResponse
    {
        $type = PoolType::tryFrom($poolType);
        abort_if($type === null, 422, "Unknown pool type: {$poolType}");

        $data = $request->validate([
            'provider' => ['required', 'string', 'in:postal,sendgrid,ses'],
            'api_url'  => ['required', 'string', 'url'],
            'api_key'  => ['required', 'string', 'min:8'],
            'host'     => ['nullable', 'string'],
            'port'     => ['nullable', 'integer'],
            'username' => ['nullable', 'string'],
            'password' => ['nullable', 'string'],
        ]);

        $pool = EmailPool::updateOrCreate(
            ['pool_type' => $type],
            $data
        );

        return response()->json([
            'data' => [
                'id'         => $pool->id,
                'pool_type'  => $pool->pool_type->value,
                'provider'   => $pool->provider,
                'api_url'    => $pool->api_url,
                'api_key'    => '••••••••' . substr($pool->api_key, -4),
                'configured' => true,
            ],
        ]);
    }

    public function testPool(string $poolType): JsonResponse
    {
        $type = PoolType::tryFrom($poolType);
        abort_if($type === null, 422, "Unknown pool type: {$poolType}");

        $pool = EmailPool::where('pool_type', $type)->first();
        abort_if($pool === null, 404, "Pool not configured yet.");

        // Hit Postal status endpoint
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'X-Server-API-Key' => $pool->api_key,
        ])
            ->timeout(8)
            ->get(rtrim($pool->api_url, '/') . '/api/v1/servers/my');

        if ($response->successful()) {
            $server = $response->json('data');
            return response()->json([
                'ok'     => true,
                'server' => $server['name'] ?? 'Connected',
            ]);
        }

        return response()->json([
            'ok'    => false,
            'error' => $response->body(),
        ], 422);
    }

    // ── Senders ───────────────────────────────────────────────────────────────

    public function getSenders(): JsonResponse
    {
        $senders = EmailSender::with('emailClient:id,name')->get()->map(fn (EmailSender $s) => [
            'id'            => $s->id,
            'email_address' => $s->email_address,
            'is_verified'   => $s->is_verified,
            'client'        => $s->emailClient?->name,
        ]);

        return response()->json(['data' => $senders]);
    }

    public function addSender(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email_address'   => ['required', 'email'],
            'email_client_id' => ['required', 'uuid', 'exists:email_clients,id'],
        ]);

        $sender = EmailSender::firstOrCreate(
            ['email_address' => $data['email_address']],
            ['email_client_id' => $data['email_client_id'], 'is_verified' => false]
        );

        return response()->json(['data' => $sender], 201);
    }

    public function verifySender(string $id): JsonResponse
    {
        $sender = EmailSender::findOrFail($id);
        $sender->update(['is_verified' => true]);

        return response()->json(['data' => ['id' => $sender->id, 'is_verified' => true]]);
    }

    // ── Platform status ───────────────────────────────────────────────────────

    public function status(): JsonResponse
    {
        $pools = EmailPool::all()->keyBy(fn (EmailPool $p) => $p->pool_type->value);

        $status = [];
        foreach (PoolType::cases() as $type) {
            $pool = $pools->get($type->value);
            $status[$type->value] = [
                'configured' => $pool && ! empty($pool->api_url) && ! empty($pool->api_key),
                'provider'   => $pool?->provider,
            ];
        }

        return response()->json([
            'data' => [
                'pools'           => $status,
                'senders_count'   => EmailSender::count(),
                'verified_senders'=> EmailSender::where('is_verified', true)->count(),
            ],
        ]);
    }
}
