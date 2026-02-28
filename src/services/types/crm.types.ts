export interface Customer {
    id: string;
    name: string;
    email: string;
    status: "active" | "inactive" | "lead";
    ltv: number;
    last_contact: string;
}

export interface Contact {
    id: string;
    customer_id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
}

export interface Deal {
    id: string;
    title: string;
    value: number;
    stage: "discovery" | "proposal" | "negotiation" | "won" | "lost";
    probability: number;
    expected_close: string;
}

export interface Activity {
    id: string;
    type: "call" | "email" | "meeting" | "note";
    description: string;
    date: string;
    user_id: string;
}
