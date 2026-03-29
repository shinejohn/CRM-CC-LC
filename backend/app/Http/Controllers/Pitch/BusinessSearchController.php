<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pitch;

use App\Http\Controllers\Controller;
use App\Models\BusinessDirectory;
use App\Models\SMB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class BusinessSearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json(['data' => []]);
        }

        $communityId = $request->query('community_id');

        $like = '%'.$q.'%';
        $query = BusinessDirectory::query()
            ->where(function ($builder) use ($like): void {
                if (DB::getDriverName() === 'pgsql') {
                    $builder->where('business_name', 'ILIKE', $like)
                        ->orWhere('city', 'ILIKE', $like)
                        ->orWhere('category', 'ILIKE', $like);
                } else {
                    $builder->where('business_name', 'like', $like)
                        ->orWhere('city', 'like', $like)
                        ->orWhere('category', 'like', $like);
                }
            });

        if ($communityId !== null && $communityId !== '') {
            $query->where('community_id', $communityId);
        }

        $results = $query->orderBy('business_name')->limit(50)->get();

        return response()->json(['data' => $results]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'community_id' => ['nullable', 'integer', 'exists:communities,id'],
            'business_name' => ['required', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'max:2'],
            'category' => ['nullable', 'string', 'max:120'],
            'source' => ['sometimes', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
        ]);

        $row = BusinessDirectory::query()->create([
            'community_id' => $data['community_id'] ?? null,
            'business_name' => $data['business_name'],
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'category' => $data['category'] ?? null,
            'source' => $data['source'] ?? 'overture',
            'metadata' => $data['metadata'] ?? null,
        ]);

        return response()->json(['data' => $row], 201);
    }

    public function claim(Request $request, string $id): JsonResponse
    {
        $directory = BusinessDirectory::query()->findOrFail($id);

        $data = $request->validate([
            'community_id' => ['required', 'integer', 'exists:communities,id'],
        ]);

        $smb = SMB::query()->create([
            'uuid' => (string) Str::uuid(),
            'community_id' => $data['community_id'],
            'business_name' => $directory->business_name,
            'category' => $directory->category,
            'city' => $directory->city,
            'state' => $directory->state,
        ]);

        $directory->update([
            'claimed_smb_id' => $smb->id,
            'claimed_at' => now(),
            'community_id' => $data['community_id'],
        ]);

        return response()->json(['data' => ['smb' => $smb, 'business_directory' => $directory->fresh()]]);
    }
}
