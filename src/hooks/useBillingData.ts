import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { Invoice, Order, CollectionMetrics } from "@/services/types/billing.types";

export function useInvoices() {
    const [data, setData] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get("/billing/invoices")
            .then((res) => setData(res.data.data))
            .catch(() => setData([]))
            .finally(() => setIsLoading(false));
    }, []);

    return { invoices: data, isLoading };
}

export function useOrders() {
    const [data, setData] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get("/billing/orders")
            .then((res) => setData(res.data.data))
            .catch(() => setData([]))
            .finally(() => setIsLoading(false));
    }, []);

    return { orders: data, isLoading };
}

export function useCollectionMetrics() {
    const [data, setData] = useState<CollectionMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get("/billing/collections/metrics")
            .then((res) => setData(res.data.data))
            .catch(() => setData(null))
            .finally(() => setIsLoading(false));
    }, []);

    return { metrics: data, isLoading };
}
