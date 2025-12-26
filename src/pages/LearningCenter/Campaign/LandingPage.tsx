import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FibonaccoPlayer } from '@/components/LearningCenter/Presentation/FibonaccoPlayer';
import { campaignApi, type CampaignData } from '@/services/learning/campaign-api';
import type { Presentation } from '@/types/learning';
import { trackLandingPageView } from '@/services/crm/conversion-tracking';

export const CampaignLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadCampaign();
      // Track landing page view
      trackLandingPageView(slug, undefined, undefined, undefined, {
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
      }).catch((err) => console.error('Failed to track landing page view:', err));
    }
  }, [slug]);

  const loadCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await campaignApi.getCampaignBySlug(slug!);
      
      if (!data) {
        setError(`Campaign "${slug}" not found`);
        return;
      }

      setCampaignData(data);
      
      // Convert campaign data to Presentation format
      const pres = campaignApi.convertToPresentation(data);
      setPresentation(pres);
    } catch (err) {
      console.error('Failed to load campaign:', err);
      setError(`Failed to load campaign: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryCTA = () => {
    if (!campaignData) return;
    
    const { primary_cta, landing_page } = campaignData;
    
    // Track conversion
    if (landing_page.crm_tracking) {
      // Track conversion event via conversion tracking service
      trackLandingPageView(slug!, undefined, undefined, undefined, {
        goal: landing_page.conversion_goal,
        campaign: landing_page.campaign_id,
        utm: {
          source: landing_page.utm_source,
          medium: landing_page.utm_medium,
          campaign: landing_page.utm_campaign,
          content: landing_page.utm_content,
        },
        cta_type: primary_cta,
      }).catch((err) => console.error('Failed to track conversion:', err));
    }

    // Handle different CTA types
    switch (primary_cta) {
      case 'signup_free':
        navigate('/signup', { state: { campaign: landing_page.campaign_id } });
        break;
      case 'start_trial':
        navigate('/signup', { state: { campaign: landing_page.campaign_id, trial: true } });
        break;
      case 'download_guide':
        // TODO: Trigger guide download
        console.log('Download guide');
        break;
      case 'schedule_demo':
        navigate('/schedule', { state: { campaign: landing_page.campaign_id } });
        break;
      default:
        console.log('CTA action:', primary_cta);
    }
  };

  const handleSecondaryCTA = () => {
    if (!campaignData) return;
    
    const { secondary_cta } = campaignData.landing_page;
    
    switch (secondary_cta) {
      case 'schedule_demo':
        navigate('/schedule', { state: { campaign: campaignData.landing_page.campaign_id } });
        break;
      case 'contact_sales':
        // TODO: Open contact form or redirect
        console.log('Contact sales');
        break;
      case 'start_trial':
        navigate('/signup', { state: { campaign: campaignData.landing_page.campaign_id, trial: true } });
        break;
      default:
        console.log('Secondary CTA:', secondary_cta);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4" />
          <p className="text-white">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaignData || !presentation) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md px-4">
          <p className="text-xl mb-4">{error || 'Campaign not found'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-gray-900">
      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Presentation Player */}
      <FibonaccoPlayer
        presentation={presentation}
        autoPlay={false}
        onComplete={() => {
          // Show CTA after presentation completes
          console.log('Presentation completed');
        }}
      />

      {/* CTA Overlay (can be shown after completion or always visible) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-4">
        <button
          onClick={handlePrimaryCTA}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
        >
          {campaignData.landing_page.primary_cta === 'signup_free' && 'Sign Up Free'}
          {campaignData.landing_page.primary_cta === 'start_trial' && 'Start Free Trial'}
          {campaignData.landing_page.primary_cta === 'download_guide' && 'Download Guide'}
          {campaignData.landing_page.primary_cta === 'schedule_demo' && 'Schedule Demo'}
          {!['signup_free', 'start_trial', 'download_guide', 'schedule_demo'].includes(campaignData.landing_page.primary_cta) && 
            campaignData.landing_page.primary_cta}
        </button>
        {campaignData.landing_page.secondary_cta && (
          <button
            onClick={handleSecondaryCTA}
            className="px-8 py-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg font-semibold hover:bg-white transition-colors shadow-lg"
          >
            {campaignData.landing_page.secondary_cta === 'schedule_demo' && 'Schedule Demo'}
            {campaignData.landing_page.secondary_cta === 'contact_sales' && 'Contact Sales'}
            {campaignData.landing_page.secondary_cta === 'start_trial' && 'Start Trial'}
            {!['schedule_demo', 'contact_sales', 'start_trial'].includes(campaignData.landing_page.secondary_cta) && 
              campaignData.landing_page.secondary_cta}
          </button>
        )}
      </div>
    </div>
  );
};

