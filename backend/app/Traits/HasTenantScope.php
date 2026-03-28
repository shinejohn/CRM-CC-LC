<?php

namespace App\Traits;

use App\Models\Scopes\TenantScope;

trait HasTenantScope
{
    /**
     * Boot the trait and apply the global scope.
     */
    protected static function bootHasTenantScope()
    {
        static::addGlobalScope(new TenantScope);
    }
}
