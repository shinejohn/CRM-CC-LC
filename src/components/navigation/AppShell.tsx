import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { NavigationRail } from "./NavigationRail";
import { useNavigationStore } from "@/stores/navigationStore";
import { cn } from "@/lib/utils";

export function AppShell() {
    const { isSidebarCollapsed, setCurrentSection } = useNavigationStore();
    const location = useLocation();

    // Sync current section with path
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith("/crm")) setCurrentSection("crm");
        else if (path.startsWith("/billing")) setCurrentSection("billing");
        else if (path.startsWith("/learn")) setCurrentSection("learn");
        else if (path.startsWith("/reports")) setCurrentSection("reports");
        else if (path.startsWith("/settings")) setCurrentSection("settings");
        else if (path.startsWith("/ai")) setCurrentSection("ai");
        else setCurrentSection("dashboard");
    }, [location.pathname, setCurrentSection]);

    return (
        <div className="flex min-h-screen bg-[var(--nexus-bg-page)] text-[var(--nexus-text-primary)]">
            {/* Sidebar */}
            <NavigationRail />

            {/* Main Content Area */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out min-w-0 overflow-x-hidden",
                    isSidebarCollapsed ? "md:ml-20" : "md:ml-64" // Provide space for fixed sidebar in md+
                )}
            >
                <div className="w-full h-full p-4 sm:p-6 lg:p-8">
                    {/* We'll load the active route here */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
