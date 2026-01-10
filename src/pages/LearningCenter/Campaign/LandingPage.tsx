import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FibonaccoPlayer } from '@/components/LearningCenter/Presentation/FibonaccoPlayer';
import { ContactSalesModal } from '@/components/LearningCenter/Campaign/ContactSalesModal';
import { campaignApi, type CampaignData } from '@/services/learning/campaign-api';
import type { Presentation } from '@/types/learning';
import { trackLandingPageView } from '@/services/crm/conversion-tracking';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { downloadGuide } from '@/utils/download-helper';
import { trackNavigate, trackButtonClick, trackModalOpen, trackAPICall } from '@/utils/navigation-tracker';
import { ArticleViewer } from '@/components/LearningCenter/Campaign/ArticleViewer';
import { personalizeObject, generateAutoFields } from '@/services/learning/personalization-service';
import type { PersonalizationData } from '@/services/learning/personalization-service';

/**
 * Campaign Landing Page Component
 * 
 * Wave 3: Campaign Landing Redesign
 * - Modern layout with improved visual hierarchy
 * - Better CTA placement and visibility
 * - Enhanced user experience
 * 
 * Wave 5: Accessibility Polish
 * - ARIA labels and roles
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Focus management
 * - WCAG 2.1 AA compliance
 */
export const CampaignLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presentationComplete, setPresentationComplete] = useState(false);
  const [showCTAs, setShowCTAs] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showArticleViewer, setShowArticleViewer] = useState(false);
  const [, setPersonalizationData] = useState<PersonalizationData>({});
  
  // Accessibility: Focus management and announcements
  const mainContentRef = useRef<HTMLDivElement>(null);
  const primaryCTARef = useRef<HTMLButtonElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);
  const skipToContentRef = useRef<HTMLAnchorElement>(null);
  
  // Detect keyboard navigation for better focus management
  const isKeyboardUser = useKeyboardNavigation();

  // Announce to screen readers
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

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

  // Focus management on load
  useEffect(() => {
    if (!loading && !error && mainContentRef.current) {
      // Focus main content for screen readers
      mainContentRef.current.focus();
      announceToScreenReader(`Loading campaign: ${campaignData?.campaign.title || slug}`);
    }
  }, [loading, error, campaignData, slug, announceToScreenReader]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key: Go back
      if (e.key === 'Escape') {
        navigate(-1);
      }
      // Skip to main content (S key)
      if (e.key === 's' || e.key === 'S') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          skipToContentRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const loadCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await campaignApi.getCampaignBySlug(slug!);
      
      if (!data) {
        setError(`Campaign "${slug}" not found`);
        announceToScreenReader(`Campaign "${slug}" not found`, 'assertive');
        return;
      }

      setCampaignData(data);
      
      // Initialize personalization data (can be enhanced with user data from CRM)
      const basePersonalization: PersonalizationData = {
        first_name: 'there', // Default fallback
        business_name: 'your business',
        // Add more from localStorage or API if available
      };
      const fullPersonalization = generateAutoFields(basePersonalization);
      setPersonalizationData(fullPersonalization);
      
      // Convert campaign data to Presentation format
      const pres = campaignApi.convertToPresentation(data);
      
      // Apply personalization to slides
      if (pres.slides) {
        pres.slides = pres.slides.map(slide => ({
          ...slide,
          content: personalizeObject(slide.content, fullPersonalization),
          narration: slide.narration ? personalizeObject(slide.narration, fullPersonalization) : slide.narration,
        }));
      }
      
      setPresentation(pres);
      
      announceToScreenReader(`Campaign loaded: ${data.campaign.title}`);
    } catch (err) {
      console.error('Failed to load campaign:', err);
      const errorMessage = `Failed to load campaign: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      announceToScreenReader(errorMessage, 'assertive');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadGuide = async (campaignId: string) => {
    // #region agent log
    trackButtonClick('download_guide', 'CampaignLandingPage');
    // #endregion
    try {
      announceToScreenReader('Downloading guide, please wait...');
      
      // #region agent log
      trackAPICall(`/v1/learning/campaigns/${campaignId}/guide`, 'CampaignLandingPage', false);
      // #endregion
      // Get download URL from API
      const downloadUrl = await campaignApi.downloadGuide(campaignId);
      // #region agent log
      trackAPICall(`/v1/learning/campaigns/${campaignId}/guide`, 'CampaignLandingPage', true);
      // #endregion
      
      // Track conversion
      if (campaignData?.landing_page.crm_tracking) {
        trackLandingPageView(slug!, undefined, undefined, undefined, {
          goal: 'guide_download',
          campaign: campaignId,
          utm: {
            source: campaignData.landing_page.utm_source,
            medium: campaignData.landing_page.utm_medium,
            campaign: campaignData.landing_page.utm_campaign,
            content: campaignData.landing_page.utm_content,
          },
          cta_type: 'download_guide',
        }).catch((err) => console.error('Failed to track conversion:', err));
      }
      
      // Download the file using utility function
      await downloadGuide(downloadUrl, campaignId);
      
      announceToScreenReader('Guide download started');
    } catch (error) {
      console.error('Failed to download guide:', error);
      const errorMessage = `Failed to download guide: ${error instanceof Error ? error.message : 'Unknown error'}`;
      // #region agent log
      trackAPICall(`/v1/learning/campaigns/${campaignId}/guide`, 'CampaignLandingPage', false, errorMessage);
      // #endregion
      announceToScreenReader(errorMessage, 'assertive');
      setError(errorMessage);
    }
  };

  const handlePrimaryCTA = () => {
    if (!campaignData) return;
    
    const { landing_page } = campaignData;
    const { primary_cta } = landing_page;
    
    // Track conversion
    if (landing_page.crm_tracking) {
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

    // Announce action to screen readers
    const ctaLabel = getCTALabel(primary_cta);
    announceToScreenReader(`Navigating to ${ctaLabel}`);

    // Handle different CTA types
    // #region agent log
    trackButtonClick(primary_cta, 'CampaignLandingPage');
    // #endregion
    switch (primary_cta) {
      case 'signup_free':
        // #region agent log
        trackNavigate('/signup', 'CampaignLandingPage');
        // #endregion
        navigate('/signup', { state: { campaign: landing_page.campaign_id } });
        break;
      case 'start_trial':
        // #region agent log
        trackNavigate('/signup', 'CampaignLandingPage');
        // #endregion
        navigate('/signup', { state: { campaign: landing_page.campaign_id, trial: true } });
        break;
      case 'download_guide':
        handleDownloadGuide(landing_page.campaign_id);
        break;
      case 'download_article':
        if (campaignData.article) {
          setShowArticleViewer(true);
        }
        break;
      case 'schedule_demo':
        // #region agent log
        trackNavigate('/schedule', 'CampaignLandingPage');
        // #endregion
        navigate('/schedule', { state: { campaign: landing_page.campaign_id } });
        break;
      default:
        console.log('CTA action:', primary_cta);
    }
  };

  const handleSecondaryCTA = () => {
    if (!campaignData) return;
    
    const { secondary_cta } = campaignData.landing_page;
    
    const ctaLabel = getCTALabel(secondary_cta);
    announceToScreenReader(`Navigating to ${ctaLabel}`);
    
    // #region agent log
    trackButtonClick(secondary_cta, 'CampaignLandingPage');
    // #endregion
    switch (secondary_cta) {
      case 'schedule_demo':
        // #region agent log
        trackNavigate('/schedule', 'CampaignLandingPage');
        // #endregion
        navigate('/schedule', { state: { campaign: campaignData.landing_page.campaign_id } });
        break;
      case 'contact_sales':
        // #region agent log
        trackModalOpen('ContactSalesModal', 'CampaignLandingPage');
        // #endregion
        setShowContactModal(true);
        break;
      case 'start_trial':
        // #region agent log
        trackNavigate('/signup', 'CampaignLandingPage');
        // #endregion
        navigate('/signup', { state: { campaign: campaignData.landing_page.campaign_id, trial: true } });
        break;
      default:
        console.log('Secondary CTA:', secondary_cta);
    }
  };

  const getCTALabel = (ctaType: string): string => {
    const labels: Record<string, string> = {
      'signup_free': 'Sign Up Free',
      'start_trial': 'Start Free Trial',
      'download_guide': 'Download Guide',
      'schedule_demo': 'Schedule Demo',
      'contact_sales': 'Contact Sales',
      'claim_listing': 'Claim Your Listing',
      'post_event': 'Post Your Event',
      'create_coupon': 'Create Coupon',
      'submit_article': 'Submit Your Story',
      'download_article': 'Download Article',
    };
    return labels[ctaType] || ctaType;
  };

  const handlePresentationComplete = () => {
    setPresentationComplete(true);
    setShowCTAs(true);
    announceToScreenReader('Presentation completed. Call to action buttons are now available.');
    // Focus primary CTA after completion
    setTimeout(() => {
      primaryCTARef.current?.focus();
    }, 100);
  };

  // Loading state with accessibility
  if (loading) {
    return (
      <div 
        className="w-full h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading campaign"
      >
        <div className="text-center">
          <Loader2 
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4" 
            aria-hidden="true"
          />
          <p className="text-white text-lg font-medium" aria-label="Loading campaign content">
            Loading campaign...
          </p>
          <p className="text-white/60 text-sm mt-2 sr-only">
            Please wait while we load the campaign content
          </p>
        </div>
      </div>
    );
  }

  // Error state with accessibility
  if (error || !campaignData || !presentation) {
    return (
      <div 
        className="w-full h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex items-center justify-center"
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center text-white max-w-md px-4">
          <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
          <p className="text-lg mb-6 text-white/80">{error || 'The requested campaign could not be loaded.'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 font-medium"
              aria-label="Navigate to home page"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 font-medium"
              aria-label="Go back to previous page"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full min-h-screen relative bg-gradient-to-br from-gray-900 via-indigo-900/30 to-gray-900"
      role="main"
      aria-label={`Campaign landing page: ${campaignData.campaign.title}`}
    >
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />

      {/* Skip to main content link */}
      <a
        ref={skipToContentRef}
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Header Navigation */}
      <header 
        className="absolute top-0 left-0 right-0 z-50 p-4"
        role="banner"
        aria-label="Page navigation"
      >
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => {
              // #region agent log
              trackButtonClick('navigate(-1)', 'CampaignLandingPage');
              // #endregion
              navigate(-1);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 font-medium"
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Back</span>
          </button>
          
          {/* Campaign title for context */}
          <div className="hidden md:block text-white/80 text-sm font-medium">
            {campaignData.campaign.title}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <div 
        id="main-content"
        ref={mainContentRef}
        className="w-full h-screen pt-16 pb-32"
        tabIndex={-1}
        role="region"
        aria-label="Campaign presentation"
      >
        {/* Presentation Player */}
        <div className="w-full h-full" aria-label="Interactive presentation">
          <FibonaccoPlayer
            presentation={presentation}
            autoPlay={false}
            onComplete={handlePresentationComplete}
            onSlideChange={(slideId) => {
              announceToScreenReader(`Slide ${slideId + 1} of ${presentation.slides.length}`);
            }}
          />
        </div>
      </div>

      {/* CTA Section - Enhanced Design */}
      {showCTAs && (
        <section
          className="absolute bottom-0 left-0 right-0 z-40 p-6 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent backdrop-blur-sm"
          role="region"
          aria-label="Call to action"
        >
          <div className="max-w-4xl mx-auto">
            {/* Campaign summary for context */}
            <div className="text-center mb-4">
              <h2 className="text-white text-lg font-semibold mb-1">
                {campaignData.campaign.title}
              </h2>
              {campaignData.campaign.description && (
                <p className="text-white/70 text-sm max-w-2xl mx-auto">
                  {campaignData.campaign.description}
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              role="group"
              aria-label="Action buttons"
            >
              <button
                ref={primaryCTARef}
                onClick={handlePrimaryCTA}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-105 active:scale-95 min-h-[48px]"
                aria-label={`Primary action: ${getCTALabel(campaignData.landing_page.primary_cta)}`}
                aria-describedby="primary-cta-description"
              >
                {getCTALabel(campaignData.landing_page.primary_cta)}
              </button>
              <span id="primary-cta-description" className="sr-only">
                Main call to action button
              </span>

              {campaignData.landing_page.secondary_cta && (
                <button
                  onClick={handleSecondaryCTA}
                  className="w-full sm:w-auto px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg font-semibold hover:bg-white active:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-105 active:scale-95 min-h-[48px]"
                  aria-label={`Secondary action: ${getCTALabel(campaignData.landing_page.secondary_cta)}`}
                  aria-describedby="secondary-cta-description"
                >
                  {getCTALabel(campaignData.landing_page.secondary_cta)}
                </button>
              )}
              <span id="secondary-cta-description" className="sr-only">
                Alternative action button
              </span>
            </div>

            {/* Progress indicator */}
            {presentationComplete && (
              <div className="mt-4 text-center">
                <p className="text-white/60 text-xs" aria-live="polite">
                  Presentation complete. Ready to take action.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Article Viewer */}
      {showArticleViewer && campaignData?.article && (
        <ArticleViewer
          article={campaignData.article}
          onClose={() => setShowArticleViewer(false)}
        />
      )}

      {/* Campaign Connections */}
      {campaignData?.connections && (
        <section className="mt-12 px-4 py-8 bg-gray-900/50 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Continue Your Journey</h3>
          <div className="flex flex-wrap gap-4">
            {campaignData.connections.leads_to && campaignData.connections.leads_to.length > 0 && (
              <div>
                <p className="text-white/60 text-sm mb-2">Next Steps:</p>
                <div className="flex flex-wrap gap-2">
                  {campaignData.connections.leads_to.map((campaignId: string) => (
                    <button
                      key={campaignId}
                      onClick={() => {
                        // Find campaign slug from master data or use campaign ID
                        navigate(`/learn/${campaignId.toLowerCase().replace(/-/g, '-')}`);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      {campaignId}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {campaignData.connections.related && campaignData.connections.related.length > 0 && (
              <div>
                <p className="text-white/60 text-sm mb-2">Related:</p>
                <div className="flex flex-wrap gap-2">
                  {campaignData.connections.related.map((campaignId: string) => (
                    <button
                      key={campaignId}
                      onClick={() => navigate(`/learn/${campaignId.toLowerCase().replace(/-/g, '-')}`)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      {campaignId}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact Sales Modal */}
      <ContactSalesModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        campaignId={campaignData?.landing_page.campaign_id}
        campaignSlug={campaignData?.landing_page.landing_page_slug}
        campaignTitle={campaignData?.campaign.title}
        utmSource={campaignData?.landing_page.utm_source}
        utmMedium={campaignData?.landing_page.utm_medium}
        utmCampaign={campaignData?.landing_page.utm_campaign}
      />
    </div>
  );
};

