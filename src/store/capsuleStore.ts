import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Capsule, CapsuleContent, CapsuleCollaborator } from '../types/database';

interface CapsuleState {
  capsules: Capsule[];
  loading: boolean;
  error: string | null;
  createCapsule: (capsule: Partial<Capsule>) => Promise<Capsule>;
  fetchCapsules: () => Promise<void>;
  addContent: (content: Partial<CapsuleContent>) => Promise<CapsuleContent>;
  addCollaborator: (collaborator: Partial<CapsuleCollaborator>) => Promise<void>;
  deleteCapsule: (id: string) => Promise<void>;
}

export const useCapsuleStore = create<CapsuleState>((set) => ({
  capsules: [],
  loading: false,
  error: null,

  createCapsule: async (capsule) => {
    try {
      const { data, error } = await supabase
        .from('capsules')
        .insert([capsule])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        capsules: [...state.capsules, data],
      }));

      return data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchCapsules: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ capsules: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addContent: async (content) => {
    try {
      const { data, error } = await supabase
        .from('capsule_contents')
        .insert([content])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  addCollaborator: async (collaborator) => {
    try {
      const { error } = await supabase
        .from('capsule_collaborators')
        .insert([collaborator]);

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteCapsule: async (id) => {
    try {
      const { error } = await supabase
        .from('capsules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        capsules: state.capsules.filter((capsule) => capsule.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));