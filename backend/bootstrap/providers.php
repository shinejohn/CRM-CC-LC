<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\EventServiceProvider::class,
    App\Providers\HorizonServiceProvider::class,
    // AI Integration
    Fibonacco\AiToolsCore\AiToolsCoreServiceProvider::class,
    Fibonacco\AiGatewayClient\AiGatewayClientServiceProvider::class,
    App\Providers\AiToolsServiceProvider::class,
];
