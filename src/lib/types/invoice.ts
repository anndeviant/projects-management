import { Project } from './project';
import { Transaction } from './transaction';

export interface Invoice {
    id: string;
    created_at: string;
    project_id: string;
    transaction_id?: string | null;
    invoice_number: string;
    invoice_date?: string;
    due_date?: string;
    total_amount: number;
    status?: string;
    file_url?: string | null;
    notes?: string | null;
    project?: Project;
    transaction?: Transaction;
}

export interface CreateInvoiceData {
    project_id: string;
    transaction_id?: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    total_amount: number;
    status?: InvoiceStatus;
    file_url?: string;
    notes?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
    id: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
