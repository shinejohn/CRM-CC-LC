/**
 * Command Center navigation config.
 *
 * Source of truth for the verb-based navigation structure (Define, Attract,
 * Sell, Deliver, Measure, Automate). Paths here mirror the routes registered
 * in `AppRouter.tsx`. Consumed by navigation UI and verified by the structure
 * check (scripts/verify/structure.js).
 */

export interface NavItem {
  /** Stable key for the item. */
  key: string;
  /** Display label. */
  label: string;
  /** Absolute route path within the app. */
  path: string;
  /** Optional lucide-react icon name. */
  icon?: string;
}

export interface NavSection {
  /** One of the six verbs (or a top-level grouping). */
  verb: string;
  label: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    verb: 'dashboard',
    label: 'Dashboard',
    items: [{ key: 'dashboard', label: 'Dashboard', path: '/command-center/dashboard', icon: 'LayoutDashboard' }],
  },
  {
    verb: 'define',
    label: 'Define',
    items: [
      { key: 'define', label: 'Overview', path: '/command-center/define', icon: 'Compass' },
      { key: 'define.profile', label: 'Business Profile', path: '/command-center/define/profile', icon: 'Building2' },
      { key: 'define.faq', label: 'FAQ', path: '/command-center/define/faq', icon: 'HelpCircle' },
    ],
  },
  {
    verb: 'attract',
    label: 'Attract',
    items: [
      { key: 'attract', label: 'Overview', path: '/command-center/attract', icon: 'Megaphone' },
      { key: 'attract.campaigns', label: 'Campaigns', path: '/command-center/attract/campaigns', icon: 'Send' },
      { key: 'attract.articles', label: 'Articles', path: '/command-center/attract/articles', icon: 'FileText' },
      { key: 'attract.events', label: 'Events', path: '/command-center/attract/events', icon: 'Calendar' },
      { key: 'attract.inbox', label: 'Inbound Inbox', path: '/command-center/attract/inbox', icon: 'Inbox' },
    ],
  },
  {
    verb: 'sell',
    label: 'Sell',
    items: [
      { key: 'sell', label: 'Overview', path: '/command-center/sell', icon: 'Handshake' },
      { key: 'sell.pipeline', label: 'Pipeline', path: '/command-center/sell/pipeline', icon: 'Kanban' },
      { key: 'sell.customers', label: 'Customers', path: '/command-center/sell/customers', icon: 'Users' },
      { key: 'sell.contacts', label: 'Contacts', path: '/command-center/sell/contacts', icon: 'Contact' },
      { key: 'sell.activities', label: 'Activities', path: '/command-center/sell/activities', icon: 'CalendarClock' },
      { key: 'sell.proposals', label: 'Proposals', path: '/command-center/sell/proposals', icon: 'FileSignature' },
    ],
  },
  {
    verb: 'deliver',
    label: 'Deliver',
    items: [
      { key: 'deliver', label: 'Overview', path: '/command-center/deliver', icon: 'Package' },
      { key: 'deliver.orders', label: 'Orders', path: '/command-center/deliver/orders', icon: 'ShoppingCart' },
      { key: 'deliver.billing', label: 'Billing', path: '/command-center/deliver/billing', icon: 'CreditCard' },
      { key: 'deliver.invoices', label: 'Invoices', path: '/command-center/deliver/invoices', icon: 'Receipt' },
      { key: 'deliver.collections', label: 'Collections', path: '/command-center/deliver/collections', icon: 'AlertCircle' },
    ],
  },
  {
    verb: 'measure',
    label: 'Measure',
    items: [
      { key: 'measure', label: 'Overview', path: '/command-center/measure', icon: 'BarChart3' },
      { key: 'measure.reports', label: 'Reports', path: '/command-center/measure/reports', icon: 'LineChart' },
      { key: 'measure.analytics', label: 'Analytics', path: '/command-center/measure/analytics', icon: 'Activity' },
      { key: 'measure.email-health', label: 'Email Health', path: '/command-center/measure/email-health', icon: 'MailCheck' },
      { key: 'measure.contact-health', label: 'Contact Health', path: '/command-center/measure/contact-health', icon: 'HeartPulse' },
    ],
  },
  {
    verb: 'automate',
    label: 'Automate',
    items: [
      { key: 'automate', label: 'Overview', path: '/command-center/automate', icon: 'Workflow' },
      { key: 'automate.workflows', label: 'Workflows', path: '/command-center/automate/workflows', icon: 'GitBranch' },
      { key: 'automate.employees', label: 'AI Employees', path: '/command-center/automate/employees', icon: 'Bot' },
      { key: 'automate.processes', label: 'Processes', path: '/command-center/automate/processes', icon: 'Cog' },
    ],
  },
];

export default navigation;
