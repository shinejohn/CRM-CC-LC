<?php

namespace App\Services;

use App\Models\Customer;
use App\Events\SMB\SMBTierChanged;
use App\Jobs\SendPremiumWelcome;

class TierManager
{
    /**
     * Upgrade customer to higher tier (lower tier number = higher tier)
     */
    public function upgradeTier(Customer $customer, int $newTier): void
    {
        if ($newTier >= $customer->engagement_tier) {
            throw new \InvalidArgumentException("Cannot upgrade to same or lower tier");
        }
        
        // Lower tier number = higher tier (1 = Premium, 4 = Passive)

        $oldTier = $customer->engagement_tier;
        $customer->engagement_tier = $newTier;
        $customer->save();

        event(new SMBTierChanged($customer, $oldTier, $newTier, 'upgrade'));

        // Trigger tier-specific actions
        $this->onTierUpgrade($customer, $oldTier, $newTier);
    }

    /**
     * Downgrade customer to lower tier (higher tier number = lower tier)
     */
    public function downgradeTier(Customer $customer, int $newTier): void
    {
        if ($newTier <= $customer->engagement_tier) {
            throw new \InvalidArgumentException("Cannot downgrade to same or higher tier");
        }
        
        // Higher tier number = lower tier (4 = Passive, 1 = Premium)

        $oldTier = $customer->engagement_tier;
        $customer->engagement_tier = $newTier;
        $customer->save();

        event(new SMBTierChanged($customer, $oldTier, $newTier, 'downgrade'));

        // Trigger tier-specific actions
        $this->onTierDowngrade($customer, $oldTier, $newTier);
    }

    /**
     * Actions when tier upgrades
     */
    protected function onTierUpgrade(Customer $customer, int $oldTier, int $newTier): void
    {
        // Tier 4 → 3: Start more frequent communication
        if ($oldTier === 4 && $newTier === 3) {
            // Update email frequency
            // Could trigger welcome email
        }

        // Tier 3 → 2: Enable RVM, personalized content
        if ($oldTier === 3 && $newTier === 2) {
            $customer->rvm_opted_in = true;
            $customer->save();
        }

        // Tier 2 → 1: Priority everything, personal touches
        if ($oldTier === 2 && $newTier === 1) {
            // Premium tier: Send welcome email from Sarah
            SendPremiumWelcome::dispatch($customer->id);
        }
    }

    /**
     * Actions when tier downgrades
     */
    protected function onTierDowngrade(Customer $customer, int $oldTier, int $newTier): void
    {
        // Reduce communication frequency
        // Disable premium features if downgrading from tier 1
        if ($oldTier === 1 && $newTier > 1) {
            // Disable RVM if downgrading to tier 3 or 4
            if ($newTier >= 3) {
                $customer->rvm_opted_in = false;
                $customer->save();
            }
        }
    }
}

