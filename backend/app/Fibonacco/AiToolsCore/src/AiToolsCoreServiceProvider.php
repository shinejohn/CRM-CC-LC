<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore;

use Fibonacco\AiToolsCore\Agent\AgentRunner;
use Fibonacco\AiToolsCore\Tools\ToolRegistry;
use Fibonacco\AiToolsCore\Tools\Infrastructure\DatabaseQueryTool;
use Fibonacco\AiToolsCore\Tools\Infrastructure\DatabaseSchemaTool;
use Illuminate\Support\ServiceProvider;

class AiToolsCoreServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/ai-tools-core.php', 'ai-tools-core');

        // Tool Registry as singleton
        $this->app->singleton(ToolRegistry::class, function ($app) {
            $registry = new ToolRegistry();

            // Register infrastructure tools
            $registry->registerMany([
                new DatabaseQueryTool(),
                new DatabaseSchemaTool(),
            ]);

            return $registry;
        });

        // Agent Runner as singleton
        $this->app->singleton(AgentRunner::class, function ($app) {
            return new AgentRunner($app->make(ToolRegistry::class));
        });
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__ . '/../../config/ai-tools-core.php' => config_path('ai-tools-core.php'),
        ], 'ai-tools-core-config');
    }
}
