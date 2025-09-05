'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Project, CreateProjectData, UpdateProjectData } from '@/lib/types';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setProjects((data as Project[]) || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const createProject = async (projectData: CreateProjectData) => {
        try {
            setError(null);

            // Force refresh session before making request
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
                console.error('Session refresh error:', refreshError);
            }

            // Debug: Check authentication state
            const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
            console.log('Authentication state:', {
                isAuthenticated: !!currentSession,
                user: currentSession?.user?.email,
                userId: currentSession?.user?.id,
                role: currentSession?.user?.role,
                aud: currentSession?.user?.aud,
                accessToken: currentSession?.access_token ? 'present' : 'missing',
                error: sessionError
            });

            if (!currentSession) {
                throw new Error('User not authenticated. Please login first.');
            }

            if (!currentSession.access_token) {
                throw new Error('No access token found. Please login again.');
            }

            // Debug: Log the data being sent
            console.log('Project data to insert:', projectData);

            const { data, error } = await supabase
                .from('projects')
                .insert([projectData])
                .select('*')
                .single();

            // Debug: Log the full error details
            if (error) {
                console.error('Supabase insert error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            if (data) {
                const newProject = data as Project;
                setProjects(prev => [newProject, ...prev]);
                return { data: newProject, error: null };
            }

            return { data: null, error: 'No data returned' };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    };

    const updateProject = async (projectData: UpdateProjectData) => {
        try {
            setError(null);

            const { data, error } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', projectData.id)
                .select('*')
                .single();

            if (error) throw error;

            if (data) {
                const updatedProject = data as Project;
                setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
                return { data: updatedProject, error: null };
            }

            return { data: null, error: 'No data returned' };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    };

    const deleteProject = async (id: string) => {
        try {
            setError(null);

            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProjects(prev => prev.filter(p => p.id !== id));
            return { error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
            setError(errorMessage);
            return { error: errorMessage };
        }
    };

    const getProject = async (id: string) => {
        try {
            setError(null);

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return { data: data as Project, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        loading,
        error,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        getProject
    };
};

export const useProject = (id: string) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchProject = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            setProject(data as Project);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch project');
        } finally {
            setLoading(false);
        }
    }, [id, supabase]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    return {
        project,
        loading,
        error,
        refetch: fetchProject
    };
};
