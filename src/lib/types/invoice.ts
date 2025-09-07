import { Project } from './project';

export interface Invoice {
    id: string;
    created_at: string;
    project_id: string;
    description: string;
    price: number;
    quantity: number;
    total_amount: number;
    project?: Project;
}

export interface CreateInvoiceData {
    project_id: string;
    description: string;
    price: number;
    quantity: number;
    total_amount: number;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
    id: string;
}
