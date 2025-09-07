"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Invoice, CreateInvoiceData, UpdateInvoiceData } from "@/lib/types/invoice";
import { toast } from "sonner";

export function useInvoices(projectId: string) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("invoices")
                .select(`
          *,
          project:projects(*)
        `)
                .eq("project_id", projectId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setInvoices(data || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            toast.error(`Error fetching invoices: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [projectId, supabase]);

    const createInvoice = async (invoiceData: CreateInvoiceData): Promise<{ success: boolean; data?: Invoice; error?: string }> => {
        try {
            const { data, error } = await supabase
                .from("invoices")
                .insert([invoiceData])
                .select(`
          *,
          project:projects(*)
        `)
                .single();

            if (error) throw error;

            setInvoices((prev) => [data, ...prev]);
            toast.success("Invoice berhasil dibuat");
            return { success: true, data };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            toast.error(`Error creating invoice: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    const updateInvoice = async (id: string, invoiceData: UpdateInvoiceData): Promise<Invoice | null> => {
        try {
            const { data, error } = await supabase
                .from("invoices")
                .update(invoiceData)
                .eq("id", id)
                .select(`
          *,
          project:projects(*)
        `)
                .single();

            if (error) throw error;

            setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? data : invoice)));
            toast.success("Invoice berhasil diperbarui");
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            toast.error(`Error updating invoice: ${errorMessage}`);
            return null;
        }
    };

    const deleteInvoice = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase.from("invoices").delete().eq("id", id);

            if (error) throw error;

            setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
            toast.success("Invoice berhasil dihapus");
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            toast.error(`Error deleting invoice: ${errorMessage}`);
            return false;
        }
    };

    // Calculate statistics
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);

    useEffect(() => {
        if (projectId) {
            fetchInvoices();
        }
    }, [projectId, fetchInvoices]);

    return {
        invoices,
        loading,
        error,
        totalInvoices,
        totalAmount,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        refetch: fetchInvoices,
    };
}

export function useInvoice(invoiceId: string) {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchInvoice = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("invoices")
                .select(`
          *,
          project:projects(*)
        `)
                .eq("id", invoiceId)
                .single();

            if (error) throw error;

            setInvoice(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            toast.error(`Error fetching invoice: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [invoiceId, supabase]);

    useEffect(() => {
        if (invoiceId) {
            fetchInvoice();
        }
    }, [invoiceId, fetchInvoice]);

    return {
        invoice,
        loading,
        error,
        refetch: fetchInvoice,
    };
}
