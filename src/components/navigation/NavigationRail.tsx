import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    GraduationCap,
    BarChart,
    Settings,
    Menu,
    X,
    Bot
} from "lucide-react";
import { useNavigationStore } from "@/stores/navigationStore";
import { cn } from "@/lib/utils";

const mainNavItems = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { id: "crm", label: "CRM", href: "/crm/customers", icon: Users },
    { id: "billing", label: "Billing", href: "/billing/invoices", icon: CreditCard },
    { id: "learn", label: "Learning", href: "/learn", icon: GraduationCap },
    { id: "reports", label: "Reports", href: "/reports/marketing", icon: BarChart },
    { id: "ai", label: "AI Workflows", href: "/ai/workflows", icon: Bot },
];

const bottomNavItems = [
    { id: "settings", label: "Settings", href: "/settings/profile", icon: Settings },
];

export function NavigationRail() {
    const { isSidebarCollapsed, toggleSidebar } = useNavigationStore();

    return (
        <>
            {/* Mobile Overlay */}
            {!isSidebarCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 left-0 bottom-0 z-50 bg-[var(--nexus-bg-page)] border-r border-[var(--nexus-card-border)] flex flex-col transition-all duration-300 ease-in-out",
                    isSidebarCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"
                )}
            >
                <div className="flex h-16 shrink-0 items-center justify-between px-4">
                    {!isSidebarCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[var(--nexus-accent-primary)] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">CC</span>
                            </div>
                            <span className="font-bold text-[var(--nexus-text-primary)]">
                                Command Center
                            </span>
                        </div>
                    )}
                    {isSidebarCollapsed && (
                        <div className="w-full flex justify-center">
                            <div className="w-8 h-8 rounded-lg bg-[var(--nexus-accent-primary)] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">CC</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden text-[var(--nexus-text-secondary)] hover:text-[var(--nexus-text-primary)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 flex-col justify-between overflow-y-auto overflow-x-hidden p-3 no-scrollbar">
                    <nav className="space-y-1">
                        {mainNavItems.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.href}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors group",
                                        isActive
                                            ? "bg-[var(--nexus-nav-active)] text-[var(--nexus-accent-primary)] font-medium"
                                            : "text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-card-bg-hover)] hover:text-[var(--nexus-text-primary)]",
                                        isSidebarCollapsed ? "justify-center" : "justify-start"
                                    )
                                }
                                title={isSidebarCollapsed ? item.label : undefined}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </nav>

                    <nav className="space-y-1 mt-8">
                        {bottomNavItems.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.href}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors group",
                                        isActive
                                            ? "bg-[var(--nexus-nav-active)] text-[var(--nexus-accent-primary)] font-medium"
                                            : "text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-card-bg-hover)] hover:text-[var(--nexus-text-primary)]",
                                        isSidebarCollapsed ? "justify-center" : "justify-start"
                                    )
                                }
                                title={isSidebarCollapsed ? item.label : undefined}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Mobile Toggle Button (when sidebar is hidden) */}
            {isSidebarCollapsed && (
                <button
                    onClick={toggleSidebar}
                    className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-[var(--nexus-card-bg)] border border-[var(--nexus-card-border)] shadow-sm text-[var(--nexus-text-secondary)]"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}
        </>
    );
}
