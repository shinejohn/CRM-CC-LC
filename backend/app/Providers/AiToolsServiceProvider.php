<?php

namespace App\Providers;

use App\AiTools\Domain\CommunityTool;
use App\AiTools\Domain\MetricsTool;
use App\Services\WorkflowOrchestrator;
use Fibonacco\AiGatewayClient\AiGatewayClient;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Illuminate\Support\ServiceProvider;

class AiToolsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(WorkflowOrchestrator::class, function ($app) {
            return new WorkflowOrchestrator(
                $app->make(AiGatewayClient::class)
            );
        });
    }

    public function boot(): void
    {
        // Ensure ToolRegistry is available (provided by AiToolsCoreServiceProvider)
        if ($this->app->bound(ToolRegistry::class)) {
            $registry = $this->app->make(ToolRegistry::class);

            $registry->registerMany([
                new CommunityTool(),
                new MetricsTool(),
                new \App\AiTools\Domain\CustomerUpdateTool(),
                new \App\AiTools\Domain\FaqTool(),
            ]);
        }
    }
}
