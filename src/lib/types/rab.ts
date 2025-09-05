import { Project } from './project';

// RAB adalah budget_items di database
export interface RAB {
    id: string;
    created_at: string;
    project_id: string;
    status?: string;
    item_name: string;
    purchasing_source: string;
    quantity: number;
    unit_price: number;
    shipping_tax?: number;
    total_price: number;
    purchase_link?: string | null;
    project?: Project;
}

export interface CreateRABData {
    project_id: string;
    item_name: string;
    purchasing_source: string;
    quantity: number;
    unit_price: number;
    shipping_tax?: number;
    purchase_link?: string;
    status?: string;
}

export interface UpdateRABData extends Partial<CreateRABData> {
    id: string;
}

export type RABStatus = 'planning' | 'pending' | 'ordered' | 'delivered' | 'completed';
