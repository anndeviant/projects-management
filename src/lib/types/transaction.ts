import { Project } from './project';

export interface Transaction {
    id: string;
    created_at: string;
    project_id: string;
    transaction_date?: string;
    description: string;
    debit?: number | null;
    credit?: number | null;
    transaction_type: string;
    proof_document_url?: string | null;
    project?: Project;
}

export interface CreateTransactionData {
    project_id: string;
    transaction_date: string;
    description: string;
    debit?: number;
    credit?: number;
    transaction_type: TransactionType;
    proof_document_url?: string;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
    id: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';

export const TRANSACTION_TYPE_OPTIONS = [
    { value: 'income', label: 'Pemasukan' },
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'adjustment', label: 'Penyesuaian' },
] as const;
