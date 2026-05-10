<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarketingKitAsset;
use App\Models\SMB;
use App\Services\MarketingKitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

final class MarketingKitController extends Controller
{
    public function __construct(
        private MarketingKitService $marketingKit
    ) {}

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $smb = SMB::where('primary_email', $user->email)->first();

        if (!$smb) {
            return response()->json(['error' => 'No business profile found'], 404);
        }

        return response()->json($this->marketingKit->getMarketingProfile($smb));
    }

    public function storeAsset(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string',
            'config' => 'required|array',
            'html' => 'nullable|string',
            'svg' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $smb = SMB::where('primary_email', $user->email)->first();

        if (!$smb) {
            return response()->json(['error' => 'No business profile found'], 404);
        }

        $asset = $this->marketingKit->saveAsset(
            $smb,
            $request->input('type'),
            $request->input('config'),
            $request->input('html'),
            $request->input('svg')
        );

        return response()->json(['asset' => $asset], 201);
    }

    public function listAssets(Request $request): JsonResponse
    {
        $user = $request->user();
        $smb = SMB::where('primary_email', $user->email)->first();

        if (!$smb) {
            return response()->json(['error' => 'No business profile found'], 404);
        }

        $assets = $smb->marketingKitAssets()
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['assets' => $assets]);
    }

    public function showAsset(string $id): JsonResponse
    {
        $asset = MarketingKitAsset::findOrFail($id);
        return response()->json(['asset' => $asset]);
    }

    public function destroyAsset(string $id): JsonResponse
    {
        $asset = MarketingKitAsset::findOrFail($id);
        $asset->update(['is_active' => false]);
        return response()->json(['message' => 'Asset deleted']);
    }

    public function embedCode(string $id): JsonResponse
    {
        $asset = MarketingKitAsset::findOrFail($id);
        $code = $this->marketingKit->generateEmbedCode($asset);
        return response()->json(['embed_code' => $code]);
    }

    public function emailSignature(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|string',
            'website' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'zip' => 'nullable|string',
            'contact_name' => 'nullable|string',
            'contact_title' => 'nullable|string',
            'alphasite_url' => 'nullable|string',
            'accent_color' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $html = $this->marketingKit->generateEmailSignatureHTML($validator->validated());
        return response()->json(['html' => $html]);
    }
}
