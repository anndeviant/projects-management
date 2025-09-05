export interface Project {
    id: string;
    created_at: string;
    updated_at?: string;
    name: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    total_budget?: number | null;
    customer_name?: string | null;
    customer_desc?: string | null;
}

export interface CreateProjectData {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    total_budget?: number;
    customer_name?: string;
    customer_desc?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
    id: string;
}

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
