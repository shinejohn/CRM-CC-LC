import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { Customer, Contact, Deal, Activity } from "@/services/types/crm.types";

export function useCustomers() {
    const [data, setData] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get("/crm/customers")
            .then((res) => setData(res.data.data))
            .catch(() => setData([]))
            .finally(() => setIsLoading(false));
    }, []);

    return { customers: data, isLoading };
}

export function useContacts() {
    const [data, setData] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get("/crm/contacts")
            .then((res) => setData(res.data.data))
            .catch(() => setData([]))
            .finally(() => setIsLoading(false));
    }, []);

    return { contacts: data, isLoading };
}

export function useDeals() {
    const [data, setData] = useState<Deal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get("/crm/deals")
            .then((res) => setData(res.data.data))
            .catch(() => setData([]))
            .finally(() => setIsLoading(false));
    }, []);

    return { deals: data, isLoading };
}

export function useActivities() {
    const [data, setData] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get("/crm/activities")
            .then((res) => setData(res.data.data))
            .catch(() => setData([]))
            .finally(() => setIsLoading(false));
    }, []);

    return { activities: data, isLoading };
}
