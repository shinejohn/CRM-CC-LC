<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ConversationPolicy
{
    /**
     * Determine whether the user can view any conversations.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the conversation.
     */
    public function view(User $user, Conversation $conversation): bool
    {
        return $this->belongsToTenant($user, $conversation);
    }

    /**
     * Determine whether the user can create conversations.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the conversation.
     */
    public function update(User $user, Conversation $conversation): bool
    {
        return $this->belongsToTenant($user, $conversation);
    }

    /**
     * Determine whether the user can delete the conversation.
     */
    public function delete(User $user, Conversation $conversation): bool
    {
        return $this->belongsToTenant($user, $conversation);
    }

    /**
     * Determine whether the user can restore the conversation.
     */
    public function restore(User $user, Conversation $conversation): bool
    {
        return $this->belongsToTenant($user, $conversation);
    }

    /**
     * Determine whether the user can permanently delete the conversation.
     */
    public function forceDelete(User $user, Conversation $conversation): bool
    {
        return $this->belongsToTenant($user, $conversation);
    }

    /**
     * Check if conversation belongs to the user's tenant.
     */
    private function belongsToTenant(User $user, Conversation $conversation): bool
    {
        if (property_exists($user, 'tenant_id') || $user->tenant_id ?? null) {
            return $user->tenant_id === $conversation->tenant_id;
        }
        
        return true;
    }
}
