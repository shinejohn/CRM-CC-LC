<?php

namespace App\Policies;

use App\Models\Interaction;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InteractionPolicy
{
    /**
     * Determine whether the user can view any interactions.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the interaction.
     */
    public function view(User $user, Interaction $interaction): bool
    {
        return $this->belongsToTenant($user, $interaction);
    }

    /**
     * Determine whether the user can create interactions.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the interaction.
     */
    public function update(User $user, Interaction $interaction): bool
    {
        return $this->belongsToTenant($user, $interaction);
    }

    /**
     * Determine whether the user can delete the interaction.
     */
    public function delete(User $user, Interaction $interaction): bool
    {
        return $this->belongsToTenant($user, $interaction);
    }

    /**
     * Determine whether the user can restore the interaction.
     */
    public function restore(User $user, Interaction $interaction): bool
    {
        return $this->belongsToTenant($user, $interaction);
    }

    /**
     * Determine whether the user can permanently delete the interaction.
     */
    public function forceDelete(User $user, Interaction $interaction): bool
    {
        return $this->belongsToTenant($user, $interaction);
    }

    /**
     * Check if interaction belongs to the user's tenant.
     */
    private function belongsToTenant(User $user, Interaction $interaction): bool
    {
        if (property_exists($user, 'tenant_id') || $user->tenant_id ?? null) {
            return $user->tenant_id === $interaction->tenant_id;
        }
        
        return true;
    }
}
