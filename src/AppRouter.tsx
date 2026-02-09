import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { PresentationCall } from './pages/PresentationCall';
import { DataReportCall } from './pages/DataReportCall';
import { MarketingReportPage } from './pages/MarketingReportPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { DataAnalyticsPage } from './pages/DataAnalyticsPage';
import { ClientProposalPage } from './pages/ClientProposalPage';
import { AIWorkflowPage } from './pages/AIWorkflowPage';
import { FilesPage } from './pages/FilesPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { SchedulePage } from './pages/SchedulePage';

// Marketing Pages
import { CommunityInfluencerPage } from './pages/Marketing/CommunityInfluencerPage';
import { CommunityExpertPage } from './pages/Marketing/CommunityExpertPage';
import { SponsorsPage } from './pages/Marketing/SponsorsPage';
import { AdsPage } from './pages/Marketing/AdsPage';

// Action Pages
import { ArticlePage } from './pages/Action/ArticlePage';
import { EventsPage } from './pages/Action/EventsPage';
import { ClassifiedsPage } from './pages/Action/ClassifiedsPage';
import { AnnouncementsPage } from './pages/Action/AnnouncementsPage';
import { CouponsPage } from './pages/Action/CouponsPage';
import { IncentivesPage } from './pages/Action/IncentivesPage';
import { TicketsPage } from './pages/Action/TicketsPage';
import { AIPage } from './pages/Action/AIPage';

// Business Pages
import { SurveyPage } from './pages/Business/SurveyPage';
import { SubscriptionsPage } from './pages/Business/SubscriptionsPage';
import { TodosPage } from './pages/Business/TodosPage';
import { DashboardPage } from './pages/Business/DashboardPage';

// User Pages
import { SponsorPage } from './pages/SponsorPage';

// Learning Center Pages
import { LearningCenterIndexPage } from './pages/LearningCenter/Index';
import { FAQIndexPage } from './pages/LearningCenter/FAQ/Index';
import { BusinessProfileIndexPage } from './pages/LearningCenter/BusinessProfile/Index';
import { BusinessProfileSectionPage } from './pages/LearningCenter/BusinessProfile/Section';
import { ArticlesIndexPage } from './pages/LearningCenter/Articles/Index';
import { SearchPlaygroundPage } from './pages/LearningCenter/Search/Playground';
import { TrainingIndexPage } from './pages/LearningCenter/Training/Index';
import { PresentationPlayerPage } from './pages/LearningCenter/Presentation/Player';
import { CampaignLandingPage } from './pages/LearningCenter/Campaign/LandingPage';
import { CampaignListPage as LearningCampaignListPage } from './pages/LearningCenter/Campaign/List';
import { ReviewDashboard } from './pages/LearningCenter/Campaign/ReviewDashboard';
import { GettingStartedIndexPage } from './pages/LearningCenter/GettingStarted/Index';
import { GettingStartedOverviewPage } from './pages/LearningCenter/GettingStarted/Overview';
import { GettingStartedQuickStartPage } from './pages/LearningCenter/GettingStarted/QuickStart';
import { PlaceholderPage } from './pages/LearningCenter/Placeholder';
import { ServiceCatalogPage } from './pages/LearningCenter/Services/Catalog';
import { ServiceDetailPage } from './pages/LearningCenter/Services/Detail';
import { ServiceCheckoutPage } from './pages/LearningCenter/Services/Checkout';
import { OrderConfirmationPage } from './pages/LearningCenter/Services/OrderConfirmation';

// CRM Pages
import { CrmDashboardPage } from './pages/CRM/Dashboard';
import { CustomerListPage } from './pages/CRM/Customers/List';
import { CustomerDetailPage } from './pages/CRM/Customers/Detail';
import { InterestAnalyticsPage } from './pages/CRM/Analytics/Interest';
import { PurchaseAnalyticsPage } from './pages/CRM/Analytics/Purchases';
import { LearningAnalyticsPage } from './pages/CRM/Analytics/Learning';
import { CampaignListPage } from './pages/CRM/Campaigns/List';
import { KanbanBoard } from './pages/CRM/Pipeline/KanbanBoard';
import { OutboundDashboardPage as StandaloneOutboundDashboard } from './pages/Outbound/Dashboard';
import { CreateEmailCampaignPage as StandaloneCreateEmailCampaign } from './pages/Outbound/Email/Create';
import { CreatePhoneCampaignPage as StandaloneCreatePhoneCampaign } from './pages/Outbound/Phone/Create';
import { CreateSmsCampaignPage as StandaloneCreateSmsCampaign } from './pages/Outbound/SMS/Create';
import { OutboundDashboardPage } from './pages/LearningCenter/Outbound/Dashboard';
import { CreateEmailCampaignPage } from './pages/LearningCenter/Outbound/Email/Create';
import { CreatePhoneCampaignPage } from './pages/LearningCenter/Outbound/Phone/Create';
import { CreateSmsCampaignPage } from './pages/LearningCenter/Outbound/SMS/Create';
import { ConversationsPage } from './pages/LearningCenter/Inbound/Conversations';
import { RepliesPage } from './pages/LearningCenter/Inbound/Replies';
import { CallsPage } from './pages/LearningCenter/Inbound/Calls';
import { CommandCenterDashboardPage } from './pages/CommandCenter/Dashboard';
import { AIPersonalitiesDashboardPage } from './pages/AIPersonalities/Dashboard';
import { AIPersonalityDetailPage } from './pages/AIPersonalities/Detail';
import { AIPersonalityAssignPage } from './pages/AIPersonalities/Assign';
import { AIPersonalityContactsPage } from './pages/AIPersonalities/Contacts';
import { ServicePurchaseWizardPage } from './command-center/modules/services/wizard';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PresentationCall />} />
        <Route path="/presentation" element={<PresentationCall />} />
        <Route path="/report" element={<DataReportCall />} />
        <Route path="/marketing-report" element={<MarketingReportPage />} />
        <Route path="/business-profile" element={<BusinessProfilePage />} />
        <Route path="/data-analytics" element={<DataAnalyticsPage />} />
        <Route path="/client-proposal" element={<ClientProposalPage />} />
        <Route path="/ai-workflow" element={<AIWorkflowPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/schedule" element={<SchedulePage />} />

        {/* Marketing Plan Routes */}
        <Route path="/community-influencer" element={<CommunityInfluencerPage />} />
        <Route path="/community-expert" element={<CommunityExpertPage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/ads" element={<AdsPage />} />

        {/* Action Menu Routes */}
        <Route path="/article" element={<ArticlePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/classifieds" element={<ClassifiedsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/incentives" element={<IncentivesPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/ai" element={<AIPage />} />

        {/* Business Profile Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* User Menu Routes */}
        <Route path="/sponsor" element={<SponsorPage />} />

        {/* CRM Routes */}
        <Route path="/crm" element={<CrmDashboardPage />} />
        <Route path="/crm/dashboard" element={<CrmDashboardPage />} />
        <Route path="/crm/customers" element={<CustomerListPage />} />
        <Route path="/crm/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/crm/pipeline" element={<KanbanBoard />} />
        <Route path="/crm/analytics/interest" element={<InterestAnalyticsPage />} />
        <Route path="/crm/analytics/purchases" element={<PurchaseAnalyticsPage />} />
        <Route path="/crm/analytics/learning" element={<LearningAnalyticsPage />} />
        <Route path="/crm/campaigns" element={<CampaignListPage />} />

        {/* Outbound Campaign Routes (Standalone - for backward compatibility) */}
        <Route path="/outbound" element={<StandaloneOutboundDashboard />} />
        <Route path="/outbound/email/create" element={<StandaloneCreateEmailCampaign />} />
        <Route path="/outbound/phone/create" element={<StandaloneCreatePhoneCampaign />} />
        <Route path="/outbound/sms/create" element={<StandaloneCreateSmsCampaign />} />

        {/* Command Center Routes */}
        <Route path="/command-center" element={<CommandCenterDashboardPage />} />

        {/* AI Personalities Routes */}
        <Route path="/ai-personalities" element={<AIPersonalitiesDashboardPage />} />
        <Route path="/ai-personalities/:id" element={<AIPersonalityDetailPage />} />
        <Route path="/ai-personalities/assign" element={<AIPersonalityAssignPage />} />
        <Route path="/ai-personalities/contacts" element={<AIPersonalityContactsPage />} />

        {/* Learning Center Routes - Landing Page CMS */}
        <Route path="/learning" element={<LearningCenterIndexPage />} />
        <Route path="/learning/faqs" element={<FAQIndexPage />} />
        <Route path="/learning/business-profile" element={<BusinessProfileIndexPage />} />
        <Route path="/learning/business-profile/section/:id" element={<BusinessProfileSectionPage />} />
        <Route path="/learning/articles" element={<ArticlesIndexPage />} />
        <Route path="/learning/search" element={<SearchPlaygroundPage />} />
        <Route path="/learning/training" element={<TrainingIndexPage />} />
        <Route path="/learning/presentation/:id" element={<PresentationPlayerPage />} />

        {/* Getting Started Routes - Must come BEFORE /learn/:slug catch-all */}
        <Route path="/learn/getting-started" element={<GettingStartedIndexPage />} />
        <Route path="/learn/overview" element={<GettingStartedOverviewPage />} />
        <Route path="/learn/quickstart" element={<GettingStartedQuickStartPage />} />
        <Route path="/learn/tutorial" element={<GettingStartedQuickStartPage />} />
        <Route path="/learn/first-steps" element={<GettingStartedQuickStartPage />} />
        <Route path="/learn/account-setup" element={<GettingStartedOverviewPage />} />
        <Route path="/learn/setup" element={<GettingStartedOverviewPage />} />
        <Route path="/learn/onboarding" element={<GettingStartedQuickStartPage />} />
        <Route path="/learn/guides" element={<GettingStartedOverviewPage />} />
        <Route path="/learn/tips" element={<GettingStartedOverviewPage />} />
        <Route path="/learn/features" element={<GettingStartedOverviewPage />} />

        {/* Video Tutorials */}
        <Route path="/learn/video-basics" element={<PlaceholderPage title="Video Call Basics" category="Video Tutorials" />} />
        <Route path="/learn/presentation-tips" element={<PlaceholderPage title="Presentation Tips" category="Video Tutorials" />} />
        <Route path="/learn/ai-features" element={<PlaceholderPage title="AI Features Overview" category="Video Tutorials" />} />
        <Route path="/learn/advanced-workflows" element={<PlaceholderPage title="Advanced Workflows" category="Video Tutorials" />} />
        <Route path="/learn/workflows" element={<PlaceholderPage title="Advanced Workflows" category="Video Tutorials" />} />

        {/* Documentation */}
        <Route path="/learn/user-manual" element={<PlaceholderPage title="User Manual" category="Documentation" />} />
        <Route path="/learn/manual" element={<PlaceholderPage title="User Manual" category="Documentation" />} />
        <Route path="/learn/api-docs" element={<PlaceholderPage title="API Documentation" category="Documentation" />} />
        <Route path="/learn/api" element={<PlaceholderPage title="API Documentation" category="Documentation" />} />
        <Route path="/learn/best-practices" element={<PlaceholderPage title="Best Practices" category="Documentation" />} />
        <Route path="/learn/troubleshooting" element={<PlaceholderPage title="Troubleshooting" category="Documentation" />} />

        {/* Webinars & Events */}
        <Route path="/learn/webinars" element={<PlaceholderPage title="Upcoming Webinars" category="Webinars & Events" />} />
        <Route path="/learn/past-recordings" element={<PlaceholderPage title="Past Recordings" category="Webinars & Events" />} />
        <Route path="/learn/recordings" element={<PlaceholderPage title="Past Recordings" category="Webinars & Events" />} />
        <Route path="/learn/live-training" element={<PlaceholderPage title="Live Training Sessions" category="Webinars & Events" />} />
        <Route path="/learn/community-events" element={<PlaceholderPage title="Community Events" category="Webinars & Events" />} />
        <Route path="/learn/events" element={<PlaceholderPage title="Community Events" category="Webinars & Events" />} />

        {/* Community */}
        <Route path="/learn/forums" element={<PlaceholderPage title="Discussion Forums" category="Community" />} />
        <Route path="/learn/user-stories" element={<PlaceholderPage title="User Stories" category="Community" />} />
        <Route path="/learn/stories" element={<PlaceholderPage title="User Stories" category="Community" />} />
        <Route path="/learn/expert-network" element={<PlaceholderPage title="Expert Network" category="Community" />} />
        <Route path="/learn/experts" element={<PlaceholderPage title="Expert Network" category="Community" />} />
        <Route path="/learn/guidelines" element={<PlaceholderPage title="Community Guidelines" category="Community" />} />

        {/* Certifications */}
        <Route path="/learn/certifications" element={<PlaceholderPage title="Certification Programs" category="Certifications" />} />
        <Route path="/learn/assessments" element={<PlaceholderPage title="Skill Assessments" category="Certifications" />} />
        <Route path="/learn/paths" element={<PlaceholderPage title="Learning Paths" category="Certifications" />} />
        <Route path="/learn/badges" element={<PlaceholderPage title="Achievement Badges" category="Certifications" />} />

        {/* Advanced Topics */}
        <Route path="/learn/ai-integration" element={<PlaceholderPage title="AI Integration" category="Advanced Topics" />} />
        <Route path="/learn/analytics" element={<PlaceholderPage title="Data Analytics" category="Advanced Topics" />} />
        <Route path="/learn/custom-workflows" element={<PlaceholderPage title="Custom Workflows" category="Advanced Topics" />} />
        <Route path="/learn/enterprise" element={<PlaceholderPage title="Enterprise Features" category="Advanced Topics" />} />

        {/* Resources */}
        <Route path="/learn/templates" element={<PlaceholderPage title="Templates Library" category="Resources" />} />
        <Route path="/learn/case-studies" element={<PlaceholderPage title="Case Studies" category="Resources" />} />
        <Route path="/learn/reports" element={<PlaceholderPage title="Industry Reports" category="Resources" />} />
        <Route path="/learn/blog" element={<PlaceholderPage title="Blog & Articles" category="Resources" />} />

        {/* Campaign Landing Pages */}
        <Route path="/learning/campaigns" element={<LearningCampaignListPage />} />
        <Route path="/learning/campaigns/review" element={<ReviewDashboard />} />
        <Route path="/campaigns" element={<LearningCampaignListPage />} />
        <Route path="/campaigns/review" element={<ReviewDashboard />} />

        {/* Service Catalog Routes */}
        <Route path="/learning/services" element={<ServiceCatalogPage />} />
        <Route path="/learning/services/checkout" element={<ServiceCheckoutPage />} />
        <Route path="/learning/services/:id" element={<ServiceDetailPage />} />
        <Route path="/learning/services/orders/:id/success" element={<OrderConfirmationPage />} />

        {/* Service Purchase Wizard */}
        <Route path="/command-center/services/buy" element={<ServicePurchaseWizardPage />} />

        {/* Campaign Landing Pages - Catch-all must be LAST */}
        <Route path="/learn/:slug" element={<CampaignLandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}