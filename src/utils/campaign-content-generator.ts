// ============================================
// CAMPAIGN CONTENT GENERATOR
// Generates actual slide content for campaigns based on metadata
// ============================================

import type { CampaignData, CampaignLandingPage } from '@/services/learning/campaign-api';

interface SlideContent {
  id: number;
  component: string;
  content: Record<string, any>;
  audioUrl?: string;
  requiresPersonalization: boolean;
}

/**
 * Generate actual slide content for a campaign based on its metadata
 */
export function generateCampaignSlides(campaignData: CampaignData): SlideContent[] {
  const { campaign, landing_page, template } = campaignData;
  const slides: SlideContent[] = [];
  
  const slideCount = landing_page.slide_count || template.slides || 6;
  const audioBaseUrl = landing_page.audio_base_url;
  
  // Template-specific slide generation
  if (template.template_id === 'claim-listing' || campaign.type === 'Hook') {
    return generateHookCampaignSlides(campaign, landing_page, slideCount, audioBaseUrl);
  } else if (template.template_id === 'educational' || campaign.type === 'Educational') {
    return generateEducationalCampaignSlides(campaign, landing_page, slideCount, audioBaseUrl);
  } else if (template.template_id === 'tutorial' || campaign.type === 'How-To') {
    return generateHowToCampaignSlides(campaign, landing_page, slideCount, audioBaseUrl);
  } else {
    // Default: Generate generic presentation
    return generateGenericCampaignSlides(campaign, landing_page, slideCount, audioBaseUrl);
  }
}

function generateHookCampaignSlides(
  campaign: CampaignData['campaign'],
  landingPage: CampaignLandingPage,
  slideCount: number,
  audioBaseUrl: string
): SlideContent[] {
  const slides: SlideContent[] = [];
  
  // Slide 1: Hero
  slides.push({
    id: 1,
    component: 'HeroSlide',
    content: {
      headline: campaign.title || 'Welcome',
      subheadline: campaign.subject || landingPage.template_name,
    },
    audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-01.mp3` : undefined,
    requiresPersonalization: true,
  });
  
  // Slide 2: Problem/Challenge
  if (slideCount > 1) {
    slides.push({
      id: 2,
      component: 'ProblemSlide',
      content: {
        title: 'The Challenge',
        problem: campaign.description || 'Discover how to grow your business',
        painPoints: [
          'Struggling to get noticed online',
          'Missing out on potential customers',
          'Hard to compete with bigger businesses',
        ],
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-02.mp3` : undefined,
      requiresPersonalization: false,
    });
  }
  
  // Slide 3: Solution
  if (slideCount > 2) {
    slides.push({
      id: 3,
      component: 'SolutionSlide',
      content: {
        title: 'The Solution',
        solution: 'Fibonacco helps you claim your digital presence and grow your business',
        benefits: [
          'Free business listing',
          'Easy claim process',
          'Start growing today',
        ],
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-03.mp3` : undefined,
      requiresPersonalization: true,
    });
  }
  
  // Slide 4: Stats/Proof
  if (slideCount > 3) {
    slides.push({
      id: 4,
      component: 'StatsSlide',
      content: {
        headline: 'Join Thousands of Businesses',
        stats: [
          { value: '10K+', label: 'Active Businesses', sublabel: 'Using our platform' },
          { value: '95%', label: 'Satisfaction Rate', sublabel: 'Happy customers' },
        ],
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-04.mp3` : undefined,
      requiresPersonalization: false,
    });
  }
  
  // Slide 5: Process/How It Works
  if (slideCount > 4) {
    slides.push({
      id: 5,
      component: 'ProcessSlide',
      content: {
        headline: 'How It Works',
        subheadline: 'Get started in minutes',
        steps: [
          { number: '1', title: 'Claim Your Listing', description: 'Find and claim your free business listing' },
          { number: '2', title: 'Add Your Details', description: 'Complete your business profile' },
          { number: '3', title: 'Start Growing', description: 'Begin reaching more customers' },
        ],
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-05.mp3` : undefined,
      requiresPersonalization: false,
    });
  }
  
  // Final Slide: CTA
  if (slideCount > 5) {
    slides.push({
      id: slideCount,
      component: 'CTASlide',
      content: {
        headline: 'Ready to Get Started?',
        subheadline: 'Claim your free listing today',
        primaryCTA: {
          text: landingPage.primary_cta === 'signup_free' ? 'Sign Up Free' : 'Get Started',
          action: landingPage.primary_cta,
        },
        secondaryCTA: landingPage.secondary_cta
          ? {
              text: landingPage.secondary_cta === 'schedule_demo' ? 'Schedule Demo' : 'Learn More',
              action: landingPage.secondary_cta,
            }
          : undefined,
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-${String(slideCount).padStart(2, '0')}.mp3` : undefined,
      requiresPersonalization: true,
    });
  }
  
  return slides;
}

function generateEducationalCampaignSlides(
  campaign: CampaignData['campaign'],
  landingPage: CampaignLandingPage,
  slideCount: number,
  audioBaseUrl: string
): SlideContent[] {
  const slides: SlideContent[] = [];
  
  // Slide 1: Hero
  slides.push({
    id: 1,
    component: 'HeroSlide',
    content: {
      headline: campaign.title || 'Learn More',
      subheadline: campaign.subject || 'Educational Content',
    },
    audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-01.mp3` : undefined,
    requiresPersonalization: false,
  });
  
  // Slide 2: Introduction
  if (slideCount > 1) {
    slides.push({
      id: 2,
      component: 'SolutionSlide',
      content: {
        title: 'Introduction',
        solution: campaign.description || 'Learn valuable insights for your business',
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-02.mp3` : undefined,
      requiresPersonalization: false,
    });
  }
  
  // Slide 3: Key Concept
  if (slideCount > 2) {
    slides.push({
      id: 3,
      component: 'StatsSlide',
      content: {
        headline: 'Key Insights',
        stats: [
          { value: '90%', label: 'Businesses', sublabel: 'Face similar challenges' },
          { value: '3x', label: 'Growth Potential', sublabel: 'With the right tools' },
        ],
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-03.mp3` : undefined,
      requiresPersonalization: false,
    });
  }
  
  // Slide 4: Comparison
  if (slideCount > 3) {
    slides.push({
      id: 4,
      component: 'ComparisonSlide',
      content: {
        headline: 'Before & After',
        before: {
          title: 'Traditional Approach',
          items: ['Limited visibility', 'Manual processes', 'Slow growth'],
        },
        after: {
          title: 'Modern Approach',
          items: ['Better visibility', 'Automated solutions', 'Fast growth'],
        },
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-04.mp3` : undefined,
      requiresPersonalization: false,
    });
  }
  
  // Slide 5: Action Steps
  if (slideCount > 4) {
    slides.push({
      id: 5,
      component: 'ProcessSlide',
      content: {
        headline: 'What To Do',
        subheadline: 'Take these steps',
        steps: [
          { number: '1', title: 'Learn', description: 'Understand the concepts' },
          { number: '2', title: 'Apply', description: 'Implement the strategies' },
          { number: '3', title: 'Succeed', description: 'Achieve your goals' },
        ],
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-05.mp3` : undefined,
      requiresPersonalization: false,
    });
  }
  
  // Slide 6: Resources
  if (slideCount > 5) {
    slides.push({
      id: 6,
      component: 'SolutionSlide',
      content: {
        title: 'Resources',
        solution: 'Access tools and guides to help you succeed',
        benefits: ['Free guides', 'Expert tips', 'Community support'],
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-06.mp3` : undefined,
      requiresPersonalization: false,
    });
  }
  
  // Final Slide: CTA
  if (slideCount > 6) {
    slides.push({
      id: slideCount,
      component: 'CTASlide',
      content: {
        headline: 'Ready to Learn More?',
        subheadline: 'Get started today',
        primaryCTA: {
          text: landingPage.primary_cta === 'download_guide' ? 'Download Guide' : 'Get Started',
          action: landingPage.primary_cta,
        },
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-${String(slideCount).padStart(2, '0')}.mp3` : undefined,
      requiresPersonalization: true,
    });
  }
  
  return slides;
}

function generateHowToCampaignSlides(
  campaign: CampaignData['campaign'],
  landingPage: CampaignLandingPage,
  slideCount: number,
  audioBaseUrl: string
): SlideContent[] {
  const slides: SlideContent[] = [];
  
  // Slide 1: Hero
  slides.push({
    id: 1,
    component: 'HeroSlide',
    content: {
      headline: campaign.title || 'How-To Guide',
      subheadline: campaign.subject || 'Step-by-step tutorial',
    },
    audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-01.mp3` : undefined,
    requiresPersonalization: false,
  });
  
  // Slide 2-6: Step-by-step process
  for (let i = 2; i < Math.min(slideCount, 7); i++) {
    slides.push({
      id: i,
      component: 'ProcessSlide',
      content: {
        headline: `Step ${i - 1}`,
        subheadline: 'Follow these steps',
        steps: [
          {
            number: String(i - 1),
            title: `Step ${i - 1} Title`,
            description: `Description of step ${i - 1}`,
          },
        ],
      },
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-${String(i).padStart(2, '0')}.mp3` : undefined,
      requiresPersonalization: false,
    });
  }
  
  // Final Slide: CTA
  slides.push({
    id: slideCount,
    component: 'CTASlide',
    content: {
      headline: 'Ready to Try It?',
      subheadline: 'Start your free trial',
      primaryCTA: {
        text: 'Start Trial',
        action: landingPage.primary_cta,
      },
    },
    audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-${String(slideCount).padStart(2, '0')}.mp3` : undefined,
    requiresPersonalization: true,
  });
  
  return slides;
}

function generateGenericCampaignSlides(
  campaign: CampaignData['campaign'],
  landingPage: CampaignLandingPage,
  slideCount: number,
  audioBaseUrl: string
): SlideContent[] {
  const slides: SlideContent[] = [];
  
  // Generate slides based on count
  for (let i = 1; i <= slideCount; i++) {
    let component = 'HeroSlide';
    let content: Record<string, any> = {
      headline: campaign.title || 'Welcome',
      subheadline: campaign.subject || landingPage.template_name,
    };
    
    // Determine component type based on slide position
    if (i === 1) {
      component = 'HeroSlide';
      content = {
        headline: campaign.title || 'Welcome',
        subheadline: campaign.subject || landingPage.template_name,
      };
    } else if (i === slideCount) {
      component = 'CTASlide';
      content = {
        headline: 'Ready to Get Started?',
        subheadline: 'Take action today',
        primaryCTA: {
          text: 'Get Started',
          action: landingPage.primary_cta,
        },
      };
    } else if (i === 2) {
      component = 'ProblemSlide';
      content = {
        title: 'The Challenge',
        problem: campaign.description || 'Discover solutions for your business',
      };
    } else {
      component = 'SolutionSlide';
      content = {
        title: `Slide ${i}`,
        solution: campaign.description || 'Learn more about our solutions',
      };
    }
    
    slides.push({
      id: i,
      component,
      content,
      audioUrl: audioBaseUrl ? `${audioBaseUrl}slide-${String(i).padStart(2, '0')}.mp3` : undefined,
      requiresPersonalization: i === 1 || i === slideCount,
    });
  }
  
  return slides;
}


