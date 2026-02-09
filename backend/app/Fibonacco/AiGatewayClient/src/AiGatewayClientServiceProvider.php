<?php

declare(strict_types=1);

namespace Fibonacco\AiGatewayClient;

use Illuminate\Support\ServiceProvider;

class AiGatewayClientServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/ai-gateway-client.php', 'ai-gateway-client');

        $this->app->singleton(AiGatewayClient::class, function () {
            return new AiGatewayClient();
        });
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__ . '/../../config/ai-gateway-client.php' => config_path('ai-gateway-client.php'),
        ], 'ai-gateway-client-config');
    }
}
