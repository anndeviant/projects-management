'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Transaction, CreateTransactionData, UpdateTransactionData } from '@/lib/types';

export const useTransactions = (projectId: string) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchTransactions = useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          project:projects(*)
        `)
                .eq('project_id', projectId)
                .order('transaction_date', { ascending: false });

            if (error) throw error;

            setTransactions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    }, [projectId, supabase]);

    const createTransaction = async (transactionData: CreateTransactionData) => {
        try {
            setError(null);

            const { data, error } = await supabase
                .from('transactions')
                .insert([transactionData])
                .select(`
          *,
          project:projects(*)
        `)
                .single();

            if (error) throw error;

            setTransactions(prev => [data, ...prev]);
            return { data, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    };

    const updateTransaction = async (transactionData: UpdateTransactionData) => {
        try {
            setError(null);

            const { data, error } = await supabase
                .from('transactions')
                .update(transactionData)
                .eq('id', transactionData.id)
                .select(`
          *,
          project:projects(*)
        `)
                .single();

            if (error) throw error;

            setTransactions(prev => prev.map(item => item.id === data.id ? data : item));
            return { data, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            setError(null);

            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTransactions(prev => prev.filter(item => item.id !== id));
            return { error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
            setError(errorMessage);
            return { error: errorMessage };
        }
    };

    const getTransaction = async (id: string) => {
        try {
            setError(null);

            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          project:projects(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            return { data, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transaction';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    };

    // Calculate total debit and credit amounts
    const totalDebit = transactions.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = transactions.reduce((sum, item) => sum + (item.credit || 0), 0);
    const balance = totalCredit - totalDebit;

    // Get transaction type summary
    const typeSummary = transactions.reduce((acc, item) => {
        const type = item.transaction_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        loading,
        error,
        totalDebit,
        totalCredit,
        balance,
        typeSummary,
        fetchTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        getTransaction
    };
};

export const useTransaction = (id: string) => {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchTransaction = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          project:projects(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            setTransaction(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
        } finally {
            setLoading(false);
        }
    }, [id, supabase]);

    useEffect(() => {
        fetchTransaction();
    }, [fetchTransaction]);

    return {
        transaction,
        loading,
        error,
        refetch: fetchTransaction
    };
};
