export interface Customer {
    id: string;
    name: string;
    email: string;
    status: "active" | "inactive" | "lead";
    ltv: number;
    last_contact: string;
    business_name?: string;
    contact_name?: string;
    phone?: string;
    subscription_tier?: "free" | "influencer" | "expert" | "sponsor";
    community?: string;
    created_at?: string;
    last_activity_at?: string;
    lifetime_value?: number;
    health_score?: number;
    tags?: string[];
    assigned_am?: string;
}

export interface Contact {
    id: string;
    customer_id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    first_name?: string;
    last_name?: string;
    is_primary?: boolean;
    created_at?: string;
}

export interface Deal {
    id: string;
    title: string;
    value: number;
    stage: "discovery" | "proposal" | "negotiation" | "won" | "lost";
    probability: number;
    expected_close: string;
    customer_id?: string;
    assigned_to?: string;
    created_at?: string;
    updated_at?: string;
    notes?: string;
    services?: string[];
}

export interface Activity {
    id: string;
    type: "call" | "email" | "meeting" | "note";
    description: string;
    date: string;
    user_id: string;
    customer_id?: string;
    subject?: string;
    status?: "pending" | "completed" | "cancelled";
    due_date?: string;
    completed_at?: string;
    created_by?: string;
    created_at?: string;
}
