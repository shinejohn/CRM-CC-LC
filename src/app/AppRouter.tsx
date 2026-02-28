import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "@/components/navigation/AppShell";
import { LoadingState } from "@/components/shared/LoadingState";
import React from "react";

// Safe lazy loader that provides a fallback component if the import fails
function safeLazy(importFunc: () => Promise<any>, fallbackName: string) {
    return lazy(() =>
        importFunc().catch(() => ({
            default: () => <div className="p-8">{fallbackName} Placeholder</div>,
        }))
    );
}

// Auth
const LoginPage = safeLazy(() => import("@/pages/LoginPage"), "Login");

// Core
const CentralCommandDashboard = safeLazy(() => import("@/components/dashboard/CentralCommandDashboard"), "Dashboard");

// CRM
const CustomersListPage = safeLazy(() => import("@/components/crm/CustomersListPage"), "Customers List");
const CustomerDetailPage = safeLazy(() => import("@/components/crm/CustomerDetailPage"), "Customer Detail");
const ContactsListPage = safeLazy(() => import("@/components/crm/ContactsListPage"), "Contacts List");
const ContactDetailPage = safeLazy(() => import("@/components/crm/ContactDetailPage"), "Contact Detail");
const PipelineDashboard = safeLazy(() => import("@/components/crm/PipelineDashboard"), "Pipeline Dashboard");
const DealDetailPage = safeLazy(() => import("@/components/crm/DealDetailPage"), "Deal Detail");
const ActivitiesPage = safeLazy(() => import("@/components/crm/ActivitiesPage"), "Activities");

// Billing
const InvoicesListPage = safeLazy(() => import("@/components/billing/InvoicesListPage"), "Invoices List");
const InvoiceDetailPage = safeLazy(() => import("@/components/billing/InvoiceDetailPage"), "Invoice Detail");
const CollectionsDashboard = safeLazy(() => import("@/components/billing/CollectionsDashboard"), "Collections");
const OrderHistoryPage = safeLazy(() => import("@/components/billing/OrderHistoryPage"), "Order History");

// Learning
const LearningCenterHub = safeLazy(() => import("@/components/learning/LearningCenterHub"), "Learning Hub");
const CampaignLandingPage = safeLazy(() => import("@/components/learning/CampaignLandingPage"), "Campaign Landing");

// Reports
const MarketingReportPage = safeLazy(() => import("@/components/analytics/MarketingReportPage"), "Marketing Report");

// Settings
const UserProfile = safeLazy(() => import("@/components/settings/UserProfile"), "User Profile");
const BusinessProfilePage = safeLazy(() => import("@/components/settings/BusinessProfilePage"), "Business Profile");

// Automation
const AIWorkflowPage = safeLazy(() => import("@/components/automation/AIWorkflowPage"), "AI Workflows");

// Documents
const ClientProposalPage = safeLazy(() => import("@/components/documents/ClientProposalPage"), "Proposals");

function PageLoader() {
    return (
        <div className="p-8">
            <LoadingState variant="detail" />
        </div>
    );
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/login" element={React.createElement(LoginPage)} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AppShell />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={React.createElement(CentralCommandDashboard)} />

                        <Route path="crm">
                            <Route path="customers" element={React.createElement(CustomersListPage)} />
                            <Route path="customers/:id" element={React.createElement(CustomerDetailPage)} />
                            <Route path="contacts" element={React.createElement(ContactsListPage)} />
                            <Route path="contacts/:id" element={React.createElement(ContactDetailPage)} />
                            <Route path="deals" element={React.createElement(PipelineDashboard)} />
                            <Route path="deals/:id" element={React.createElement(DealDetailPage)} />
                            <Route path="activities" element={React.createElement(ActivitiesPage)} />
                        </Route>

                        <Route path="billing">
                            <Route path="invoices" element={React.createElement(InvoicesListPage)} />
                            <Route path="invoices/:id" element={React.createElement(InvoiceDetailPage)} />
                            <Route path="collections" element={React.createElement(CollectionsDashboard)} />
                            <Route path="orders" element={React.createElement(OrderHistoryPage)} />
                        </Route>

                        <Route path="learn">
                            <Route index element={React.createElement(LearningCenterHub)} />
                            <Route path=":campaignSlug" element={React.createElement(CampaignLandingPage)} />
                        </Route>

                        <Route path="reports">
                            <Route path="marketing" element={React.createElement(MarketingReportPage)} />
                        </Route>

                        <Route path="documents">
                            <Route path="proposals" element={React.createElement(ClientProposalPage)} />
                        </Route>

                        <Route path="settings">
                            <Route path="profile" element={React.createElement(UserProfile)} />
                            <Route path="business" element={React.createElement(BusinessProfilePage)} />
                        </Route>

                        <Route path="ai">
                            <Route path="workflows" element={React.createElement(AIWorkflowPage)} />
                        </Route>
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
