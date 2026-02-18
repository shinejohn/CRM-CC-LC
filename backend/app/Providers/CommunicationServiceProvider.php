<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Contracts\Communication\MessageServiceInterface;
use App\Services\Communication\MessageService;

class CommunicationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(MessageServiceInterface::class, MessageService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
