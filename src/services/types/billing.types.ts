export interface Invoice {
    id: string;
    customer_id: string;
    customer_name: string;
    amount: number;
    status: "paid" | "pending" | "overdue" | "draft" | "sent" | "cancelled";
    issue_date: string;
    due_date: string;
    items: InvoiceItem[];
    invoice_number?: string;
    tax?: number;
    total?: number;
    paid_date?: string;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

export interface Order {
    id: string;
    customer_id: string;
    customer_name: string;
    amount: number;
    status: "completed" | "processing" | "cancelled" | "refunded";
    date: string;
    order_number?: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

export interface Collection {
    id: string;
    invoice_id: string;
    customer_id: string;
    customer_name: string;
    amount_due: number;
    amount_collected: number;
    status: "pending" | "partial" | "collected" | "written_off";
    due_date: string;
    last_contact_date?: string;
    notes?: string;
}

export interface CollectionMetrics {
    total_outstanding: number;
    overdue_amount: number;
    collection_rate: number;
    days_sales_outstanding: number;
    active_invoices: number;
}
