import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { CampaignListPage } from './pages/LearningCenter/Campaign/List';
import { GettingStartedIndexPage } from './pages/LearningCenter/GettingStarted/Index';
import { GettingStartedOverviewPage } from './pages/LearningCenter/GettingStarted/Overview';
import { GettingStartedQuickStartPage } from './pages/LearningCenter/GettingStarted/QuickStart';
import { PlaceholderPage } from './pages/LearningCenter/Placeholder';

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

        {/* Learning Center Routes */}
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
        <Route path="/learning/campaigns" element={<CampaignListPage />} />
        <Route path="/campaigns" element={<CampaignListPage />} />
        
        {/* Campaign Landing Pages - Catch-all must be LAST */}
        <Route path="/learn/:slug" element={<CampaignLandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}