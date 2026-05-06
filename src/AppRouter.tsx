import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router';
import { PresentationCall } from './pages/PresentationCall';
import { DataReportCall } from './pages/DataReportCall';
import { MarketingReportPage } from './pages/MarketingReportPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { DataAnalyticsPage } from './pages/DataAnalyticsPage';
import { ClientProposalPage } from './pages/ClientProposalPage';
import { AIWorkflowPage } from './pages/AIWorkflowPage';
import { FilesPage } from './pages/FilesPage';
import LoginPage from "./pages/LoginPage";
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { SchedulePage } from './pages/SchedulePage';

// Marketing Pages
import { CommunityInfluencerPage } from './pages/Marketing/CommunityInfluencerPage';
import { SponsorsPage } from './pages/Marketing/SponsorsPage';
import { AdsPage } from './pages/Marketing/AdsPage';
import { ProductCatalogPage } from './pages/Marketing/ProductCatalogPage';

// Action Pages
// NOTE: ArticlePage and EventsPage imports removed — /article and /events routes
// now redirect to their Command Center equivalents via <Navigate>.

// Business Pages
import { SubscriptionsPage } from './pages/Business/SubscriptionsPage';
import { ROIDashboardPage } from './pages/Business/ROIDashboardPage';

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
import { ContentLessonPage } from './pages/LearningCenter/Content/LessonPage';
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
import { BillingDashboardPage } from './pages/LearningCenter/Services/BillingDashboard';
import { OrderHistoryPage } from './pages/LearningCenter/Services/OrderHistory';

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
// NOTE: LearningCenter/Outbound/* and LearningCenter/Inbound/* page imports were
// removed — they were imported but never referenced in any route definition.
import { AIPersonalitiesDashboardPage } from './pages/AIPersonalities/Dashboard';
import { AIPersonalityDetailPage } from './pages/AIPersonalities/Detail';
import { AIPersonalityAssignPage } from './pages/AIPersonalities/Assign';
import { AIPersonalityContactsPage } from './pages/AIPersonalities/Contacts';
import { ServicePurchaseWizardPage } from './command-center/modules/services/wizard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getCommandCenterRoutes } from './command-center/AppRouter';

const PitchRouterPage = lazy(() => import('./pitch/PitchRouter'));

// Ops Dashboard (POD) - Admin only
import { OpsLayout } from './pages/ops/OpsLayout';
import { OpsDashboard } from './pages/ops/OpsDashboard';
import { OpsMetricsExplorer } from './pages/ops/OpsMetricsExplorer';
import { OpsAlertsPage } from './pages/ops/OpsAlertsPage';
import { OpsIncidentsPage } from './pages/ops/OpsIncidentsPage';
import { OpsCostTracker } from './pages/ops/OpsCostTracker';
import { OpsSystemHealth } from './pages/ops/OpsSystemHealth';
import { OpsFOAChat } from './pages/ops/OpsFOAChat';
import { OpsActionLog } from './pages/ops/OpsActionLog';

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
        <Route
          path="/advertise/:communitySlug"
          element={
            <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-slate-600">Loading…</div>}>
              <PitchRouterPage />
            </Suspense>
          }
        />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/schedule" element={<SchedulePage />} />

        {/* Marketing Plan Routes */}
        <Route path="/community-influencer" element={<CommunityInfluencerPage />} />

        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/ads" element={<AdsPage />} />
        <Route path="/product-catalog" element={<ProductCatalogPage />} />

        {/* Action Menu Routes (redirects to their CommandCenter equivalents) */}
        <Route path="/article" element={<Navigate to="/command-center/attract/articles" replace />} />
        <Route path="/events" element={<Navigate to="/command-center/attract/events" replace />} />

        {/* Business Profile Routes */}
        {/* /profile is already defined above (line 121) — removed duplicate */}
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/subscriptions/roi" element={<ROIDashboardPage />} />

        {/* User Menu Routes */}
        <Route path="/sponsor" element={<SponsorPage />} />

        {/* CRM Routes (standalone, no CC layout)
            Canonical CRM paths are /command-center/sell/* (CC layout, auth-guarded).
            These /crm/* routes are kept for backward compatibility and direct-link access. */}
        <Route path="/crm" element={<CrmDashboardPage />} />
        <Route path="/crm/dashboard" element={<CrmDashboardPage />} />
        <Route path="/crm/customers" element={<CustomerListPage />} />
        <Route path="/crm/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/crm/pipeline" element={<KanbanBoard />} />
        <Route path="/crm/analytics/interest" element={<InterestAnalyticsPage />} />
        <Route path="/crm/analytics/purchases" element={<PurchaseAnalyticsPage />} />
        <Route path="/crm/analytics/learning" element={<LearningAnalyticsPage />} />
        <Route path="/crm/campaigns" element={<CampaignListPage />} />

        {/* Outbound Campaign Routes (standalone, no CC layout — backward compatibility).
            No canonical CC equivalent exists yet; these are the primary outbound routes. */}
        <Route path="/outbound" element={<StandaloneOutboundDashboard />} />
        <Route path="/outbound/email/create" element={<StandaloneCreateEmailCampaign />} />
        <Route path="/outbound/phone/create" element={<StandaloneCreatePhoneCampaign />} />
        <Route path="/outbound/sms/create" element={<StandaloneCreateSmsCampaign />} />

        {/* Command Center Routes */}
        {getCommandCenterRoutes()}

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
        <Route path="/learning/content/:slug" element={<ContentLessonPage />} />

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
        {/* Short aliases — canonical paths are /learning/campaigns and /learning/campaigns/review above */}
        <Route path="/campaigns" element={<LearningCampaignListPage />} />
        <Route path="/campaigns/review" element={<ReviewDashboard />} />

        {/* Service Catalog Routes */}
        <Route path="/learning/services" element={<ServiceCatalogPage />} />
        <Route path="/learning/services/billing" element={<BillingDashboardPage />} />
        <Route path="/learning/services/orders" element={<OrderHistoryPage />} />
        <Route path="/learning/services/checkout" element={<ServiceCheckoutPage />} />
        <Route path="/learning/services/:id" element={<ServiceDetailPage />} />
        <Route path="/learning/services/orders/:id/success" element={<OrderConfirmationPage />} />

        {/* Service Purchase Wizard */}
        <Route path="/command-center/services/buy" element={<ServicePurchaseWizardPage />} />

        {/* Ops Dashboard (POD) - Admin only */}
        <Route
          path="/ops"
          element={
            <ProtectedRoute requireAuth requireAdmin>
              <OpsLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OpsDashboard />} />
          <Route path="metrics" element={<OpsMetricsExplorer />} />
          <Route path="alerts" element={<OpsAlertsPage />} />
          <Route path="incidents" element={<OpsIncidentsPage />} />
          <Route path="costs" element={<OpsCostTracker />} />
          <Route path="health" element={<OpsSystemHealth />} />
          <Route path="foa" element={<OpsFOAChat />} />
          <Route path="actions" element={<OpsActionLog />} />
        </Route>

        {/* Campaign Landing Pages - Catch-all for /learn/:slug */}
        <Route path="/learn/:slug" element={<CampaignLandingPage />} />

        {/* 404 catch-all — must be the very last route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-lg text-gray-600 mb-6">Page not found</p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        Back to Home
      </Link>
    </div>
  );
}