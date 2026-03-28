<?php

namespace Database\Seeders;

use App\Models\Community;
use App\Models\CommunitySlotLimit;
use Illuminate\Database\Seeder;

class SlotLimitSeeder extends Seeder
{
    public function run(): void
    {
        // Template values: [category_group => [max_influencer_slots, max_expert_slots, subtypes]]
        $templates = [
            'restaurants' => ['slots' => 4, 'expert' => 1, 'subtypes' => ['italian', 'mexican', 'asian', 'american', 'seafood', 'pizza', 'bbq', 'indian', 'thai', 'mediterranean']],
            'real_estate' => ['slots' => 4, 'expert' => 1, 'subtypes' => null],
            'attorneys' => ['slots' => 2, 'expert' => 1, 'subtypes' => ['family', 'criminal', 'personal_injury', 'estate', 'business', 'immigration', 'real_estate']],
            'auto_services' => ['slots' => 3, 'expert' => 1, 'subtypes' => null],
            'home_services' => ['slots' => 2, 'expert' => 1, 'subtypes' => ['plumbing', 'electrical', 'hvac', 'roofing', 'landscaping', 'cleaning', 'painting', 'remodeling']],
            'medical' => ['slots' => 3, 'expert' => 1, 'subtypes' => ['family', 'dental', 'chiropractic', 'optometry', 'dermatology', 'orthopedic', 'pediatric', 'mental_health']],
            'financial' => ['slots' => 2, 'expert' => 1, 'subtypes' => ['banking', 'insurance', 'accounting', 'financial_planning', 'mortgage']],
            'retail' => ['slots' => 5, 'expert' => 1, 'subtypes' => ['clothing', 'electronics', 'home_goods', 'sporting', 'gifts', 'grocery', 'pet', 'pharmacy']],
            'personal_services' => ['slots' => 4, 'expert' => 1, 'subtypes' => null],
        ];

        // Apply to all existing communities
        $communities = Community::all();

        foreach ($communities as $community) {
            foreach ($templates as $group => $config) {
                if ($config['subtypes']) {
                    // Create a slot record per subtype
                    foreach ($config['subtypes'] as $subtype) {
                        CommunitySlotLimit::updateOrCreate(
                            [
                                'community_id' => $community->id,
                                'category_group' => $group,
                                'category_subtype' => $subtype,
                            ],
                            [
                                'max_influencer_slots' => $config['slots'],
                                'max_expert_slots' => $config['expert'],
                            ]
                        );
                    }
                } else {
                    CommunitySlotLimit::updateOrCreate(
                        [
                            'community_id' => $community->id,
                            'category_group' => $group,
                            'category_subtype' => null,
                        ],
                        [
                            'max_influencer_slots' => $config['slots'],
                            'max_expert_slots' => $config['expert'],
                        ]
                    );
                }
            }
        }
    }
}
