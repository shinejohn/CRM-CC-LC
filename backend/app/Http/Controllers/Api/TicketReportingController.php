<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonitoringSignal;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class TicketReportingController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $since = $request->input('since', now()->subDays(30)->toDateString());

        $byType = Ticket::select('type', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $since)
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $byStatus = Ticket::select('status', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $since)
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $byPriority = Ticket::select('priority', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $since)
            ->groupBy('priority')
            ->get()
            ->keyBy('priority');

        // Average resolution time (hours) by type
        $avgResolution = Ticket::select(
                'type',
                DB::raw("AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours")
            )
            ->whereNotNull('resolved_at')
            ->where('created_at', '>=', $since)
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        // SLA compliance rate (resolved before due_at)
        $slaTotal   = Ticket::whereNotNull('due_at')->where('created_at', '>=', $since)->count();
        $slaMet     = Ticket::whereNotNull('due_at')
            ->whereNotNull('resolved_at')
            ->whereColumn('resolved_at', '<=', 'due_at')
            ->where('created_at', '>=', $since)
            ->count();
        $slaRate = $slaTotal > 0 ? round(($slaMet / $slaTotal) * 100, 1) : null;

        // Open implementation tickets by stage
        $implementationByStage = DB::table('implementation_stages')
            ->join('tickets', 'tickets.id', '=', 'implementation_stages.ticket_id')
            ->where('tickets.type', 'implementation')
            ->whereNotIn('tickets.status', ['resolved', 'closed', 'cancelled'])
            ->where('implementation_stages.status', '!=', 'complete')
            ->select('implementation_stages.stage_name', DB::raw('COUNT(*) as count'))
            ->groupBy('implementation_stages.stage_name')
            ->get();

        // Top clients by ticket volume (at-risk indicator)
        $topClients = Ticket::select('client_id', DB::raw('COUNT(*) as ticket_count'))
            ->where('type', 'support')
            ->where('created_at', '>=', now()->subDays(30)->toDateString())
            ->whereNotNull('client_id')
            ->groupBy('client_id')
            ->orderByDesc('ticket_count')
            ->limit(10)
            ->with('client:id,business_name')
            ->get();

        // Signal volume by platform
        $signalsByPlatform = MonitoringSignal::select('source_platform', DB::raw('COUNT(*) as count'))
            ->where('detected_at', '>=', $since)
            ->groupBy('source_platform')
            ->get()
            ->keyBy('source_platform');

        return response()->json([
            'since'                    => $since,
            'by_type'                  => $byType,
            'by_status'                => $byStatus,
            'by_priority'              => $byPriority,
            'avg_resolution_hours'     => $avgResolution,
            'sla_compliance_rate'      => $slaRate,
            'sla_total'                => $slaTotal,
            'sla_met'                  => $slaMet,
            'implementation_by_stage'  => $implementationByStage,
            'top_clients_by_volume'    => $topClients,
            'signals_by_platform'      => $signalsByPlatform,
        ]);
    }
}
