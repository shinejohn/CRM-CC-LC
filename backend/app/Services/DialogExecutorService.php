<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\AiPersonality;
use App\Models\DialogTree;
use App\Models\DialogTreeNode;
use App\Models\DialogExecution;
use Illuminate\Support\Facades\Log;

class DialogExecutorService
{
    /**
     * Start a new dialog execution.
     */
    public function start(Customer $customer, DialogTree $tree, ?AiPersonality $am = null): DialogExecution
    {
        $startNode = $tree->getStartNode();
        
        $execution = DialogExecution::create([
            'customer_id' => $customer->id,
            'dialog_tree_id' => $tree->id,
            'ai_personality_id' => $am?->id,
            'current_node' => $startNode?->node_key,
            'status' => 'in_progress',
            'path_taken' => [$startNode?->node_key],
            'started_at' => now(),
        ]);
        
        return $execution;
    }
    
    /**
     * Process a response and advance dialog.
     */
    public function processResponse(DialogExecution $execution, string $response): array
    {
        $tree = $execution->dialogTree;
        $currentNode = $tree->getNode($execution->current_node);
        
        if (!$currentNode) {
            return [
                'status' => 'error',
                'message' => 'Invalid dialog state',
            ];
        }
        
        // Store response if this was an ask node
        if ($currentNode->node_type === 'ask' && $currentNode->prompt) {
            $execution->collectData($currentNode->node_key, $response);
        }
        
        // Execute any action on current node
        if ($currentNode->action_type) {
            $this->executeAction($execution, $currentNode);
        }
        
        // Determine next node
        $nextNodeKey = $currentNode->getNextNode($response);
        
        if (!$nextNodeKey || $currentNode->isTerminal()) {
            $execution->complete('completed');
            return [
                'status' => 'completed',
                'collected_data' => $execution->collected_data,
            ];
        }
        
        // Advance to next node
        $execution->advanceTo($nextNodeKey);
        $nextNode = $tree->getNode($nextNodeKey);
        
        return [
            'status' => 'continue',
            'node_type' => $nextNode->node_type,
            'content' => $nextNode->content,
            'prompt' => $nextNode->prompt,
            'expected_responses' => $nextNode->expected_responses,
        ];
    }
    
    /**
     * Execute action on a node.
     */
    protected function executeAction(DialogExecution $execution, DialogTreeNode $node): void
    {
        $customer = $execution->customer;
        $params = $node->action_params ?? [];
        
        match($node->action_type) {
            'schedule_callback' => $this->scheduleCallback($customer, $params),
            'send_email' => $this->sendEmail($customer, $params),
            'update_crm' => $this->updateCrm($customer, $params),
            'escalate' => $execution->escalate($params['reason'] ?? 'action_triggered'),
            default => Log::warning("Unknown action type: {$node->action_type}"),
        };
    }
    
    protected function scheduleCallback(Customer $customer, array $params): void
    {
        \App\Models\Interaction::create([
            'customer_id' => $customer->id,
            'type' => 'callback',
            'channel' => 'phone',
            'status' => 'scheduled',
            'scheduled_at' => now()->addHours($params['delay_hours'] ?? 24),
            'notes' => $params['notes'] ?? 'Callback scheduled from dialog',
        ]);
    }
    
    protected function sendEmail(Customer $customer, array $params): void
    {
        \App\Jobs\SendEmailCampaign::dispatch(
            $customer,
            $params['campaign_id'] ?? null,
            $params['template'] ?? 'followup'
        );
    }
    
    protected function updateCrm(Customer $customer, array $params): void
    {
        $customer->update($params['fields'] ?? []);
    }
}

