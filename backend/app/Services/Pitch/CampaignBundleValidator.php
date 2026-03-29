<?php

declare(strict_types=1);

namespace App\Services\Pitch;

/**
 * Validates selected proposal line items for bundle coherence (PART 6).
 *
 * @return list<array{type: string, message: string, suggestion?: string}>
 */
final class CampaignBundleValidator
{
    /**
     * @param  list<string>  $selectedProducts
     * @param  array<string, mixed>  $businessContext
     * @return list<array{type: string, message: string, suggestion?: string}>
     */
    public function validate(array $selectedProducts, array $businessContext): array
    {
        $warnings = [];

        if (
            in_array('newsletter_callout', $selectedProducts, true)
            && ! in_array('headliner_ad', $selectedProducts, true)
            && ! in_array('display_campaign', $selectedProducts, true)
        ) {
            $warnings[] = [
                'type' => 'soft_block',
                'message' => 'Newsletter callouts work best when there is a clear place to send readers after they see your name. Without a visible placement, the click path feels incomplete.',
                'suggestion' => 'headliner_ad',
            ];
        }

        if (
            $selectedProducts === ['sponsored_article']
            || $selectedProducts === ['sponsored_article', 'newsletter_callout']
        ) {
            $warnings[] = [
                'type' => 'soft_block',
                'message' => 'An article tells your story but rarely drives immediate calls on its own. Pairing it with a Headliner placement gives the story a reachable front door.',
                'suggestion' => 'headliner_ad',
            ];
        }

        if (
            in_array('display_campaign', $selectedProducts, true)
            && empty($businessContext['has_logo'])
            && ! in_array('sponsored_article', $selectedProducts, true)
        ) {
            $warnings[] = [
                'type' => 'info',
                'message' => 'We will need your logo and a headline to build the placement. If you are missing creative, we can still draft copy — do you have a logo file ready?',
            ];
        }

        if (count($selectedProducts) === 0) {
            $warnings[] = [
                'type' => 'hard_block',
                'message' => 'Select at least one item to continue.',
            ];
        }

        return $warnings;
    }
}
