<?php

declare(strict_types=1);

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

final class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (! Auth::check()) {
            return;
        }

        $user = Auth::user();

        if (! empty($user->tenant_id)) {
            // Constrain to the authenticated user's tenant.
            $builder->where($model->getTable().'.tenant_id', $user->tenant_id);

            return;
        }

        // Deny-by-default: an authenticated user with NO tenant must match
        // nothing, never the whole (untenanted) table. Leaving the query
        // unfiltered here would leak every tenant's rows.
        $builder->whereRaw('1 = 0');
    }
}
