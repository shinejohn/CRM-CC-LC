export interface Invoice {
    id: string;
    customer_id: string;
    customer_name: string;
    amount: number;
    status: "paid" | "pending" | "overdue" | "draft";
    issue_date: string;
    due_date: string;
    items: InvoiceItem[];
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
}

export interface CollectionMetrics {
    total_outstanding: number;
    overdue_amount: number;
    collection_rate: number;
    days_sales_outstanding: number;
    active_invoices: number;
}
