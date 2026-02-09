<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CustomerPolicy
{
    /**
     * Determine whether the user can view any customers.
     */
    public function viewAny(User $user): bool
    {
        // User can view customers in their tenant
        return true;
    }

    /**
     * Determine whether the user can view the customer.
     */
    public function view(User $user, Customer $customer): bool
    {
        // User can view customer if it belongs to their tenant
        return $this->belongsToTenant($user, $customer);
    }

    /**
     * Determine whether the user can create customers.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create customers
        return true;
    }

    /**
     * Determine whether the user can update the customer.
     */
    public function update(User $user, Customer $customer): bool
    {
        return $this->belongsToTenant($user, $customer);
    }

    /**
     * Determine whether the user can delete the customer.
     */
    public function delete(User $user, Customer $customer): bool
    {
        return $this->belongsToTenant($user, $customer);
    }

    /**
     * Determine whether the user can restore the customer.
     */
    public function restore(User $user, Customer $customer): bool
    {
        return $this->belongsToTenant($user, $customer);
    }

    /**
     * Determine whether the user can permanently delete the customer.
     */
    public function forceDelete(User $user, Customer $customer): bool
    {
        return $this->belongsToTenant($user, $customer);
    }

    /**
     * Check if customer belongs to the user's tenant.
     */
    private function belongsToTenant(User $user, Customer $customer): bool
    {
        // Check if user has tenant_id attribute and compare with customer's tenant
        if (property_exists($user, 'tenant_id') || $user->tenant_id ?? null) {
            return $user->tenant_id === $customer->tenant_id;
        }
        
        // If user doesn't have tenant_id, allow access (backward compatibility)
        return true;
    }
}
