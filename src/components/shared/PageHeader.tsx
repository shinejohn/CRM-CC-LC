import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    breadcrumbs?: { label: string; href?: string }[];
    icon?: LucideIcon;
}

export function PageHeader({
    title,
    subtitle,
    actions,
    breadcrumbs,
    icon: Icon,
}: PageHeaderProps) {
    return (
        <div className="mb-6">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center space-x-2 text-sm text-[var(--nexus-text-tertiary)] mb-4">
                    {breadcrumbs.map((crumb, idx) => (
                        <div key={idx} className="flex items-center">
                            {idx > 0 && <span className="mx-2">/</span>}
                            {crumb.href ? (
                                <a
                                    href={crumb.href}
                                    className="hover:text-[var(--nexus-accent-primary)] transition-colors"
                                >
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="text-[var(--nexus-text-secondary)]">
                                    {crumb.label}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-[var(--nexus-bg-secondary)] rounded-lg">
                            <Icon className="w-6 h-6 text-[var(--nexus-accent-primary)]" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--nexus-text-primary)]">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-[var(--nexus-text-tertiary)] mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
