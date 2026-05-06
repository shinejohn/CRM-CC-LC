import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router';
import { AuthGuard } from './core/AuthGuard';
import { CommandCenterLayout } from './layouts/CommandCenterLayout';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// ── Core ──
const Dashboard = lazy(() => import('./modules/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));

// ── DEFINE verb ──
const DefineIndex = lazy(() => import('./pages/DefineIndex').then(m => ({ default: m.DefineIndex })));
const BusinessProfileEdit = lazy(() => import('@/pages/BusinessProfilePage').then(m => ({ default: m.BusinessProfilePage })).catch(() => ({ default: () => <div>Business Profile - Coming Soon</div> })));
const SurveyPage = lazy(() => Promise.resolve({ default: () => <div className="p-8 text-center text-[var(--nexus-text-secondary)]">Survey - Coming Soon</div> }));
const FAQBuilderPage = lazy(() => import('./pages/FAQBuilderPage').then(m => ({ default: m.FAQBuilderPage })));

// ── ATTRACT verb ──
const AttractIndex = lazy(() => import('./pages/AttractIndex').then(m => ({ default: m.AttractIndex })));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage').catch(() => ({ default: () => <div>Campaigns - Coming Soon</div> })));
const CampaignDetail = lazy(() => import('./pages/CampaignDetailPage').catch(() => ({ default: () => <div>Campaign Detail - Coming Soon</div> })));
const ArticlesPage = lazy(() => import('@/pages/Action/ArticlePage').then(m => ({ default: m.ArticlePage })).catch(() => ({ default: () => <div>Articles - Coming Soon</div> })));
const EventsPage = lazy(() => import('@/pages/Action/EventsPage').then(m => ({ default: m.EventsPage })).catch(() => ({ default: () => <div>Events - Coming Soon</div> })));
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage').then(m => ({ default: m.DiagnosticPage })));

// ── SELL verb ──
const SellIndex = lazy(() => import('./pages/SellIndex').then(m => ({ default: m.SellIndex })));
const PipelinePage = lazy(() => import('@/components/CRM/PipelineDashboard').catch(() => ({ default: () => <div>Pipeline - Coming Soon</div> })));
const CustomersPage = lazy(() => import('./pages/CustomersPage').catch(() => ({ default: () => <div>Customers - Coming Soon</div> })));
const CustomerDetail = lazy(() => import('./pages/CustomerDetailPage').catch(() => ({ default: () => <div>Customer Detail - Coming Soon</div> })));
const ContactsPage = lazy(() => import('@/components/CRM/ContactsListPage').catch(() => ({ default: () => <div>Contacts - Coming Soon</div> })));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage').catch(() => ({ default: () => <div>Activities - Coming Soon</div> })));
const ProposalsPage = lazy(() => import('./pages/ProposalsPage').then(m => ({ default: m.ProposalsPage })));

// ── Sarah pitch (CC internal) ──
const PitchDashboardPage = lazy(() => import('./pages/pitch/PitchDashboardPage'));
const PitchFollowUpsPage = lazy(() => import('./pages/pitch/PitchFollowUpsPage'));
const PitchProposalsPage = lazy(() => import('./pages/pitch/PitchProposalsPage'));
const SlotInventoryPage = lazy(() => import('./pages/pitch/SlotInventoryPage'));

// ── Sarah campaign builder (CC internal) ──
const SarahDashboardPage = lazy(() => import('./pages/sarah/SarahDashboardPage'));
const SarahSessionsPage = lazy(() => import('./pages/sarah/SarahSessionsPage'));
const SarahSessionDetailPage = lazy(() => import('./pages/sarah/SarahSessionDetailPage'));
const SarahCampaignsPage = lazy(() => import('./pages/sarah/SarahCampaignsPage'));
const SarahCampaignDetailPage = lazy(() => import('./pages/sarah/SarahCampaignDetailPage'));

// ── DELIVER verb ──
const DeliverIndex = lazy(() => import('./pages/DeliverIndex').then(m => ({ default: m.DeliverIndex })));
const OrdersPage = lazy(() => import('@/components/billing/OrderHistoryPage').catch(() => ({ default: () => <div>Orders - Coming Soon</div> })));
const BillingDashboard = lazy(() => import('@/pages/LearningCenter/Services/BillingDashboard').then(m => ({ default: m.BillingDashboardPage })));
const InvoicesPage = lazy(() => import('@/components/billing/InvoicesListPage').catch(() => ({ default: () => <div>Invoices - Coming Soon</div> })));
const InvoiceDetail = lazy(() => import('@/components/billing/InvoiceDetailPage').catch(() => ({ default: () => <div>Invoice Detail - Coming Soon</div> })));
const CollectionsPage = lazy(() => import('@/components/billing/CollectionsDashboard').catch(() => ({ default: () => <div>Collections - Coming Soon</div> })));
const PlatformsPage = lazy(() => import('./pages/PlatformsPage').then(m => ({ default: m.PlatformsPage })));

// ── MEASURE verb ──
const MeasureIndex = lazy(() => import('./pages/MeasureIndex').then(m => ({ default: m.MeasureIndex })));
const ReportsPage = lazy(() => import('@/pages/MarketingReportPage').then(m => ({ default: m.MarketingReportPage })).catch(() => ({ default: () => <div>Reports - Coming Soon</div> })));
const AnalyticsPage = lazy(() => import('@/components/DataReportPanel').then(m => ({ default: m.DataReportPanel })).catch(() => ({ default: () => <div>Analytics - Coming Soon</div> })));
const EmailHealthPage = lazy(() => import('./pages/EmailHealthPage').then(m => ({ default: m.EmailHealthPage })).catch(() => ({ default: () => <div>Email Health - Coming Soon</div> })));
const ContactHealthPage = lazy(() => import('./pages/ContactHealthPage').then(m => ({ default: m.ContactHealthPage })).catch(() => ({ default: () => <div>Contact Health - Coming Soon</div> })));

// ── ATTRACT verb (email) ──
const InboundInboxPage = lazy(() => import('./pages/InboundInboxPage').then(m => ({ default: m.InboundInboxPage })).catch(() => ({ default: () => <div>Inbound Inbox - Coming Soon</div> })));

// ── AUTOMATE verb ──
const AutomateIndex = lazy(() => import('./pages/AutomateIndex').then(m => ({ default: m.AutomateIndex })));
const WorkflowsPage = lazy(() => import('@/pages/AIWorkflowPage').then(m => ({ default: m.AIWorkflowPage })).catch(() => ({ default: () => <div>Workflows - Coming Soon</div> })));
const AIEmployeesPage = lazy(() => import('./pages/AIEmployeesPage').then(m => ({ default: m.AIEmployeesPage })));
const ProcessesPage = lazy(() => import('./pages/ProcessesPage').then(m => ({ default: m.ProcessesPage })));

// ── LEARN ──
const LearningHub = lazy(() => import('@/components/learning/LearningCenterHub'));
const CampaignLandingPage = lazy(() => import('@/components/learning/CampaignLandingPage'));

// ── SETTINGS ──
const Settings = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })).catch(() => ({ default: () => <div>Settings - Coming Soon</div> })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })).catch(() => ({ default: () => <div>Profile - Coming Soon</div> })));
const TeamPage = lazy(() => import('./pages/TeamPage').then(m => ({ default: m.TeamPage })));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const BusinessModePage = lazy(() => import('./pages/BusinessModePage').then(m => ({ default: m.BusinessModePage })));

// ── Other ──
const CommerceHub = lazy(() => import('./pages/CommerceHubPage').then(m => ({ default: m.CommerceHubPage })).catch(() => ({ default: () => <div>Commerce Hub - Coming Soon</div> })));
const AIHub = lazy(() => import('./pages/AIHubPage').catch(() => ({ default: () => <div>AI Hub - Coming Soon</div> })));

// Layout wrapper for protected routes
function ProtectedLayout() {
  return (
    <CommandCenterLayout>
      <Outlet />
    </CommandCenterLayout>
  );
}

/**
 * Returns command-center route elements for embedding in the main AppRouter.
 * Routes are organized by the Six Verbs model: Define, Attract, Sell, Deliver, Measure, Automate.
 */
export function getCommandCenterRoutes() {
  return (
    <Route path="/command-center" element={
      <AuthGuard>
        <ProtectedLayout />
      </AuthGuard>
    }>
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* Dashboard */}
      <Route path="dashboard" element={<Suspense fallback={<LoadingScreen />}><Dashboard /></Suspense>} />

      {/* ── DEFINE: Business identity & profile ── */}
      <Route path="define" element={<Suspense fallback={<LoadingScreen />}><DefineIndex /></Suspense>} />
      <Route path="define/profile" element={<Suspense fallback={<LoadingScreen />}><BusinessProfileEdit /></Suspense>} />
      <Route path="define/survey" element={<Suspense fallback={<LoadingScreen />}><SurveyPage /></Suspense>} />
      <Route path="define/faq" element={<Suspense fallback={<LoadingScreen />}><FAQBuilderPage /></Suspense>} />

      {/* ── ATTRACT: Content, campaigns & marketing ── */}
      <Route path="attract" element={<Suspense fallback={<LoadingScreen />}><AttractIndex /></Suspense>} />
      <Route path="attract/campaigns" element={<Suspense fallback={<LoadingScreen />}><CampaignsPage /></Suspense>} />
      <Route path="attract/campaigns/:id" element={<Suspense fallback={<LoadingScreen />}><CampaignDetail /></Suspense>} />
      <Route path="attract/articles" element={<Suspense fallback={<LoadingScreen />}><ArticlesPage /></Suspense>} />
      <Route path="attract/events" element={<Suspense fallback={<LoadingScreen />}><EventsPage /></Suspense>} />
      <Route path="attract/diagnostic" element={<Suspense fallback={<LoadingScreen />}><DiagnosticPage /></Suspense>} />
      <Route path="attract/inbox" element={<Suspense fallback={<LoadingScreen />}><InboundInboxPage /></Suspense>} />

      {/* ── SELL: CRM, pipeline & customer management ── */}
      <Route path="sell" element={<Suspense fallback={<LoadingScreen />}><SellIndex /></Suspense>} />
      <Route path="sell/pipeline" element={<Suspense fallback={<LoadingScreen />}><PipelinePage /></Suspense>} />
      <Route path="sell/customers" element={<Suspense fallback={<LoadingScreen />}><CustomersPage /></Suspense>} />
      <Route path="sell/customers/:id" element={<Suspense fallback={<LoadingScreen />}><CustomerDetail /></Suspense>} />
      <Route path="sell/contacts" element={<Suspense fallback={<LoadingScreen />}><ContactsPage /></Suspense>} />
      <Route path="sell/activities" element={<Suspense fallback={<LoadingScreen />}><ActivitiesPage /></Suspense>} />
      <Route path="sell/proposals" element={<Suspense fallback={<LoadingScreen />}><ProposalsPage /></Suspense>} />

      {/* ── PITCH: Sarah pitch engine (operator views) ── */}
      <Route path="pitch" element={<Suspense fallback={<LoadingScreen />}><PitchDashboardPage /></Suspense>} />
      <Route path="pitch/follow-ups" element={<Suspense fallback={<LoadingScreen />}><PitchFollowUpsPage /></Suspense>} />
      <Route path="pitch/proposals" element={<Suspense fallback={<LoadingScreen />}><PitchProposalsPage /></Suspense>} />
      <Route path="pitch/slots" element={<Suspense fallback={<LoadingScreen />}><SlotInventoryPage /></Suspense>} />

      {/* ── SARAH: Campaign builder (operator views) ── */}
      <Route path="sarah" element={<Suspense fallback={<LoadingScreen />}><SarahDashboardPage /></Suspense>} />
      <Route path="sarah/sessions" element={<Suspense fallback={<LoadingScreen />}><SarahSessionsPage /></Suspense>} />
      <Route path="sarah/sessions/:id" element={<Suspense fallback={<LoadingScreen />}><SarahSessionDetailPage /></Suspense>} />
      <Route path="sarah/campaigns" element={<Suspense fallback={<LoadingScreen />}><SarahCampaignsPage /></Suspense>} />
      <Route path="sarah/campaigns/:id" element={<Suspense fallback={<LoadingScreen />}><SarahCampaignDetailPage /></Suspense>} />

      {/* ── DELIVER: Services, billing & fulfillment ── */}
      <Route path="deliver" element={<Suspense fallback={<LoadingScreen />}><DeliverIndex /></Suspense>} />
      <Route path="deliver/orders" element={<Suspense fallback={<LoadingScreen />}><OrdersPage /></Suspense>} />
      <Route path="deliver/billing" element={<Suspense fallback={<LoadingScreen />}><BillingDashboard /></Suspense>} />
      <Route path="deliver/invoices" element={<Suspense fallback={<LoadingScreen />}><InvoicesPage /></Suspense>} />
      <Route path="deliver/invoices/:id" element={<Suspense fallback={<LoadingScreen />}><InvoiceDetail /></Suspense>} />
      <Route path="deliver/collections" element={<Suspense fallback={<LoadingScreen />}><CollectionsPage /></Suspense>} />
      <Route path="deliver/platforms" element={<Suspense fallback={<LoadingScreen />}><PlatformsPage /></Suspense>} />

      {/* ── MEASURE: Analytics & reporting ── */}
      <Route path="measure" element={<Suspense fallback={<LoadingScreen />}><MeasureIndex /></Suspense>} />
      <Route path="measure/reports" element={<Suspense fallback={<LoadingScreen />}><ReportsPage /></Suspense>} />
      <Route path="measure/analytics" element={<Suspense fallback={<LoadingScreen />}><AnalyticsPage /></Suspense>} />
      <Route path="measure/email-health" element={<Suspense fallback={<LoadingScreen />}><EmailHealthPage /></Suspense>} />
      <Route path="measure/contact-health" element={<Suspense fallback={<LoadingScreen />}><ContactHealthPage /></Suspense>} />

      {/* ── AUTOMATE: AI employees & workflows ── */}
      <Route path="automate" element={<Suspense fallback={<LoadingScreen />}><AutomateIndex /></Suspense>} />
      <Route path="automate/workflows" element={<Suspense fallback={<LoadingScreen />}><WorkflowsPage /></Suspense>} />
      <Route path="automate/employees" element={<Suspense fallback={<LoadingScreen />}><AIEmployeesPage /></Suspense>} />
      <Route path="automate/processes" element={<Suspense fallback={<LoadingScreen />}><ProcessesPage /></Suspense>} />

      {/* ── LEARN: Education & campaigns ── */}
      <Route path="learn" element={<Suspense fallback={<LoadingScreen />}><LearningHub /></Suspense>} />
      <Route path="learn/:slug" element={<Suspense fallback={<LoadingScreen />}><CampaignLandingPage /></Suspense>} />

      {/* ── SETTINGS ── */}
      <Route path="settings" element={<Suspense fallback={<LoadingScreen />}><Settings /></Suspense>} />
      <Route path="settings/profile" element={<Suspense fallback={<LoadingScreen />}><ProfilePage /></Suspense>} />
      <Route path="settings/team" element={<Suspense fallback={<LoadingScreen />}><TeamPage /></Suspense>} />
      <Route path="settings/integrations" element={<Suspense fallback={<LoadingScreen />}><IntegrationsPage /></Suspense>} />
      <Route path="settings/mode" element={<Suspense fallback={<LoadingScreen />}><BusinessModePage /></Suspense>} />
      <Route path="settings/*" element={<Suspense fallback={<LoadingScreen />}><Settings /></Suspense>} />

      {/* ── Other ── */}
      <Route path="commerce" element={<Suspense fallback={<LoadingScreen />}><CommerceHub /></Suspense>} />
      <Route path="ai" element={<Suspense fallback={<LoadingScreen />}><AIHub /></Suspense>} />

      {/* ── Legacy redirects (old paths → new verb paths) ── */}
      <Route path="crm" element={<Navigate to="/command-center/sell" replace />} />
      <Route path="billing" element={<Navigate to="/command-center/deliver/billing" replace />} />
      <Route path="content" element={<Navigate to="/command-center/attract" replace />} />
      <Route path="content/*" element={<Navigate to="/command-center/attract" replace />} />
      <Route path="ai-team" element={<Navigate to="/command-center/automate" replace />} />
      <Route path="business" element={<Navigate to="/command-center/define" replace />} />
      <Route path="services" element={<Navigate to="/command-center/deliver" replace />} />
      <Route path="intelligence-hub" element={<Navigate to="/command-center/define" replace />} />
      <Route path="customers" element={<Navigate to="/command-center/sell/customers" replace />} />
      <Route path="activities" element={<Navigate to="/command-center/sell/activities" replace />} />

      {/* 404 catch-all within Command Center — must be last */}
      <Route path="*" element={<CCNotFoundPage />} />
    </Route>
  );
}

function CCNotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-lg text-gray-600 mb-6">This page does not exist in the Command Center.</p>
      <Link
        to="/command-center/dashboard"
        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

/**
 * Standalone AppRouter for CommandCenterApp (self-contained mode).
 */
export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <Suspense fallback={<LoadingScreen />}>
          <LoginPage />
        </Suspense>
      } />

      {getCommandCenterRoutes()}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/command-center" replace />} />
    </Routes>
  );
}
