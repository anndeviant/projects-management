'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RAB, CreateRABData, UpdateRABData } from '@/lib/types';

export const useRAB = (projectId: string) => {
    const [rabItems, setRABItems] = useState<RAB[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchRABItems = useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('budget_items')
                .select(`
          *,
          project:projects(*)
        `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setRABItems(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch RAB items');
        } finally {
            setLoading(false);
        }
    }, [projectId, supabase]);

    const createRABItem = async (rabData: CreateRABData) => {
        try {
            setError(null);

            // Calculate total price
            const total_price = (rabData.quantity * rabData.unit_price) + (rabData.shipping_tax || 0); const { data, error } = await supabase
                .from('budget_items')
                .insert([{ ...rabData, total_price }])
                .select(`
          *,
          project:projects(*)
        `)
                .single();

            if (error) throw error;

            setRABItems(prev => [data, ...prev]);
            return { data, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create RAB item';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    };

    const updateRABItem = async (rabData: UpdateRABData) => {
        try {
            setError(null);

            // Recalculate total price if quantity or unit_price changed
            const updatedData: UpdateRABData & { total_price?: number } = { ...rabData };
            if (rabData.quantity !== undefined || rabData.unit_price !== undefined || rabData.shipping_tax !== undefined) {
                const currentItem = rabItems.find(item => item.id === rabData.id);
                if (currentItem) {
                    const quantity = rabData.quantity ?? currentItem.quantity;
                    const unit_price = rabData.unit_price ?? currentItem.unit_price;
                    const shipping_tax = rabData.shipping_tax ?? currentItem.shipping_tax ?? 0;
                    updatedData.total_price = (quantity * unit_price) + shipping_tax;
                }
            }

            const { data, error } = await supabase
                .from('budget_items')
                .update(updatedData)
                .eq('id', rabData.id)
                .select(`
          *,
          project:projects(*)
        `)
                .single();

            if (error) throw error;

            setRABItems(prev => prev.map(item => item.id === data.id ? data : item));
            return { data, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update RAB item';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    };

    const deleteRABItem = async (id: string) => {
        try {
            setError(null);

            const { error } = await supabase
                .from('budget_items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRABItems(prev => prev.filter(item => item.id !== id));
            return { error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete RAB item';
            setError(errorMessage);
            return { error: errorMessage };
        }
    };

    const getRABItem = async (id: string) => {
        try {
            setError(null);

            const { data, error } = await supabase
                .from('budget_items')
                .select(`
          *,
          project:projects(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            return { data, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch RAB item';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    };

    // Calculate total RAB amount
    const totalRAB = rabItems.reduce((sum, item) => sum + item.total_price, 0);

    // Get status summary
    const statusSummary = rabItems.reduce((acc, item) => {
        const status = item.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    useEffect(() => {
        fetchRABItems();
    }, [fetchRABItems]);

    return {
        rabItems,
        loading,
        error,
        totalRAB,
        statusSummary,
        fetchRABItems,
        createRABItem,
        updateRABItem,
        deleteRABItem,
        getRABItem
    };
};

export const useRABItem = (id: string) => {
    const [rabItem, setRABItem] = useState<RAB | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchRABItem = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('budget_items')
                .select(`
          *,
          project:projects(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            setRABItem(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch RAB item');
        } finally {
            setLoading(false);
        }
    }, [id, supabase]);

    useEffect(() => {
        fetchRABItem();
    }, [fetchRABItem]);

    return {
        rabItem,
        loading,
        error,
        refetch: fetchRABItem
    };
};
