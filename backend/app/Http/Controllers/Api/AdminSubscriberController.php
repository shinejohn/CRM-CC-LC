<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscriber\Subscriber;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminSubscriberController extends Controller
{
    /**
     * List subscribers
     */
    public function index(Request $request): JsonResponse
    {
        $query = Subscriber::query();
        
        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        
        if ($request->has('community_id')) {
            $query->whereHas('communities', function ($q) use ($request) {
                $q->where('community_id', $request->input('community_id'));
            });
        }
        
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('email', 'ilike', "%{$search}%")
                  ->orWhere('first_name', 'ilike', "%{$search}%")
                  ->orWhere('last_name', 'ilike', "%{$search}%");
            });
        }
        
        $perPage = $request->input('per_page', 20);
        $subscribers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $subscribers->items(),
            'meta' => [
                'current_page' => $subscribers->currentPage(),
                'last_page' => $subscribers->lastPage(),
                'per_page' => $subscribers->perPage(),
                'total' => $subscribers->total(),
            ],
        ]);
    }

    /**
     * Get subscriber stats
     */
    public function stats(Request $request): JsonResponse
    {
        $stats = [
            'total' => Subscriber::count(),
            'active' => Subscriber::where('status', 'active')->count(),
            'pending' => Subscriber::where('status', 'pending')->count(),
            'unsubscribed' => Subscriber::where('status', 'unsubscribed')->count(),
            'email_opted_in' => Subscriber::where('email_opted_in', true)->count(),
            'sms_opted_in' => Subscriber::where('sms_opted_in', true)->count(),
            'push_opted_in' => Subscriber::where('push_opted_in', true)->count(),
            'by_frequency' => Subscriber::select('newsletter_frequency', DB::raw('count(*) as count'))
                ->groupBy('newsletter_frequency')
                ->pluck('count', 'newsletter_frequency')
                ->toArray(),
        ];
        
        return response()->json(['stats' => $stats]);
    }

    /**
     * Export subscribers
     */
    public function export(Request $request): JsonResponse
    {
        $query = Subscriber::query();
        
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        
        if ($request->has('community_id')) {
            $query->whereHas('communities', function ($q) use ($request) {
                $q->where('community_id', $request->input('community_id'));
            });
        }
        
        $subscribers = $query->get();
        
        // Return CSV data (in production, queue this job)
        $csv = "Email,First Name,Last Name,Phone,Status,Subscribed At\n";
        foreach ($subscribers as $subscriber) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s\n",
                $subscriber->email,
                $subscriber->first_name ?? '',
                $subscriber->last_name ?? '',
                $subscriber->phone ?? '',
                $subscriber->status,
                $subscriber->created_at->toDateString()
            );
        }
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="subscribers.csv"',
        ]);
    }

    /**
     * Get subscriber details
     */
    public function show(string $id): JsonResponse
    {
        $subscriber = Subscriber::with(['communities', 'alertPreferences', 'events'])
            ->findOrFail($id);
        
        return response()->json(['subscriber' => $subscriber]);
    }

    /**
     * Update subscriber status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,active,unsubscribed,bounced,complained',
        ]);
        
        $subscriber = Subscriber::findOrFail($id);
        $subscriber->update([
            'status' => $request->input('status'),
            'unsubscribed_at' => $request->input('status') === 'unsubscribed' ? now() : null,
        ]);
        
        return response()->json([
            'message' => 'Status updated successfully.',
            'subscriber' => $subscriber,
        ]);
    }
}



