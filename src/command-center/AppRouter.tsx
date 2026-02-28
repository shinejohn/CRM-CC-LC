import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import { AuthGuard } from './core/AuthGuard';
import { CommandCenterLayout } from './layouts/CommandCenterLayout';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./modules/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const Activities = lazy(() => import('./pages/ActivitiesPage').catch(() => ({ default: () => <div>Activities - Coming Soon</div> })));
const Customers = lazy(() => import('./pages/CustomersPage').catch(() => ({ default: () => <div>Customers - Coming Soon</div> })));
const CustomerDetail = lazy(() => import('./pages/CustomerDetailPage').catch(() => ({ default: () => <div>Customer Detail - Coming Soon</div> })));
const Content = lazy(() => import('./pages/ContentPage').catch(() => ({ default: () => <div>Content - Coming Soon</div> })));
const Campaigns = lazy(() => import('./pages/CampaignsPage').catch(() => ({ default: () => <div>Campaigns - Coming Soon</div> })));
const CommerceHub = lazy(() => import('./pages/CommerceHubPage').then(m => ({ default: m.CommerceHubPage })).catch(() => ({ default: () => <div>Commerce Hub - Coming Soon</div> })));
const CampaignDetail = lazy(() => import('./pages/CampaignDetailPage').catch(() => ({ default: () => <div>Campaign Detail - Coming Soon</div> })));
const Services = lazy(() => import('./pages/ServicesPage').catch(() => ({ default: () => <div>Services - Coming Soon</div> })));
const AIHub = lazy(() => import('./pages/AIHubPage').catch(() => ({ default: () => <div>AI Hub - Coming Soon</div> })));
const AITeam = lazy(() => import('./pages/AITeamPage').catch(() => ({ default: () => <div>AI Team - Coming Soon</div> })));
const CrmDashboard = lazy(() => import('./modules/crm/Dashboard').then(m => ({ default: m.CrmDashboard })));
const Settings = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })).catch(() => ({ default: () => <div>Settings - Coming Soon</div> })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const IntelligenceHub = lazy(() => import('./modules/intelligence-hub/MyBusinessProfilePage').then(m => ({ default: m.MyBusinessProfilePage })));
const BillingDashboard = lazy(() => import('@/pages/LearningCenter/Services/BillingDashboard').then(m => ({ default: m.BillingDashboardPage })));
const LearningHub = lazy(() => import('@/components/learning/LearningCenterHub'));

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
 */
export function getCommandCenterRoutes() {
  return (
    <Route path="/command-center" element={
      <AuthGuard>
        <ProtectedLayout />
      </AuthGuard>
    }>
      <Route index element={<Navigate to="dashboard" replace />} />

      <Route path="dashboard" element={
        <Suspense fallback={<LoadingScreen />}>
          <Dashboard />
        </Suspense>
      } />

      <Route path="activities" element={
        <Suspense fallback={<LoadingScreen />}>
          <Activities />
        </Suspense>
      } />

      <Route path="customers" element={
        <Suspense fallback={<LoadingScreen />}>
          <Customers />
        </Suspense>
      } />

      <Route path="customers/:id" element={
        <Suspense fallback={<LoadingScreen />}>
          <CustomerDetail />
        </Suspense>
      } />

      <Route path="content/*" element={
        <Suspense fallback={<LoadingScreen />}>
          <Content />
        </Suspense>
      } />

      <Route path="campaigns" element={
        <Suspense fallback={<LoadingScreen />}>
          <Campaigns />
        </Suspense>
      } />

      <Route path="commerce" element={
        <Suspense fallback={<LoadingScreen />}>
          <CommerceHub />
        </Suspense>
      } />

      <Route path="campaigns/:id" element={
        <Suspense fallback={<LoadingScreen />}>
          <CampaignDetail />
        </Suspense>
      } />

      <Route path="services" element={
        <Suspense fallback={<LoadingScreen />}>
          <Services />
        </Suspense>
      } />

      <Route path="ai" element={
        <Suspense fallback={<LoadingScreen />}>
          <AIHub />
        </Suspense>
      } />

      <Route path="ai-team" element={
        <Suspense fallback={<LoadingScreen />}>
          <AITeam />
        </Suspense>
      } />

      <Route path="crm" element={
        <Suspense fallback={<LoadingScreen />}>
          <CrmDashboard />
        </Suspense>
      } />

      <Route path="billing" element={
        <Suspense fallback={<LoadingScreen />}>
          <BillingDashboard />
        </Suspense>
      } />

      <Route path="learn" element={
        <Suspense fallback={<LoadingScreen />}>
          <LearningHub />
        </Suspense>
      } />

      <Route path="business" element={
        <Suspense fallback={<LoadingScreen />}>
          <IntelligenceHub />
        </Suspense>
      } />

      <Route path="intelligence-hub" element={
        <Suspense fallback={<LoadingScreen />}>
          <IntelligenceHub />
        </Suspense>
      } />

      {/* --- Nexus Zone Routes (Phase 2 & 3) --- */}
      <Route path="define" element={
        <div className="flex h-[80vh] items-center justify-center text-slate-500 font-bold uppercase tracking-wider">Define Zone - In Development</div>
      } />
      <Route path="attract" element={
        <div className="flex h-[80vh] items-center justify-center text-slate-500 font-bold uppercase tracking-wider">Attract Zone - In Development</div>
      } />
      <Route path="sell" element={
        <div className="flex h-[80vh] items-center justify-center text-slate-500 font-bold uppercase tracking-wider">Sell Zone - In Development</div>
      } />
      <Route path="deliver" element={
        <div className="flex h-[80vh] items-center justify-center text-slate-500 font-bold uppercase tracking-wider">Deliver Zone - In Development</div>
      } />
      <Route path="measure" element={
        <div className="flex h-[80vh] items-center justify-center text-slate-500 font-bold uppercase tracking-wider">Measure Zone - In Development</div>
      } />
      <Route path="automate" element={
        <div className="flex h-[80vh] items-center justify-center text-slate-500 font-bold uppercase tracking-wider">Automate Zone - In Development</div>
      } />

      <Route path="settings/*" element={
        <Suspense fallback={<LoadingScreen />}>
          <Settings />
        </Suspense>
      } />
    </Route>
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
