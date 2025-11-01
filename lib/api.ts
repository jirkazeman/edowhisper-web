import type { ParoRecord, RecordFormData, AIRole } from "./types";
import { supabase } from "./supabase";

// Records API (calls server-side API routes)
export const recordsAPI = {
  // Get all records
  getAll: async (): Promise<ParoRecord[]> => {
    try {
      const response = await fetch("/api/records");
      const result = await response.json();

      if (!response.ok || result.error) {
        console.error("Error fetching records:", result.error);
        throw new Error(result.error || "Failed to fetch records");
      }

      return result.data || [];
    } catch (error) {
      console.error("Error in recordsAPI.getAll:", error);
      throw error;
    }
  },

  // Get single record by ID
  getById: async (id: string): Promise<ParoRecord | null> => {
    const { data, error } = await supabase
      .from("paro_records")
      .select("*")
      .eq("id", id)
      .eq("deleted", false)
      .single();

    if (error) {
      console.error("Error fetching record:", error);
      return null;
    }

    return data;
  },

  // Create new record
  create: async (
    formData: RecordFormData, 
    userId: string, 
    llmOriginal?: any
  ): Promise<ParoRecord | null> => {
    const { data, error } = await supabase
      .from("paro_records")
      .insert({
        user_id: userId,
        form_data: formData,
        timestamp: new Date().toISOString(),
        deleted: false,
        llm_original: llmOriginal || null, // Uložit původní LLM výstup pro fine-tuning
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating record:", error);
      throw error;
    }

    return data;
  },

  // Update record
  update: async (id: string, formData: Partial<RecordFormData>): Promise<void> => {
    const { error } = await supabase
      .from("paro_records")
      .update({
        form_data: formData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  },

  // Soft delete record
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("paro_records")
      .update({ deleted: true })
      .eq("id", id);

    if (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  },
};

// AI Roles API
export const aiRolesAPI = {
  // Get all AI roles
  getAll: async (): Promise<AIRole[]> => {
    try {
      const response = await fetch("/api/ai-roles");
      const result = await response.json();

      if (!response.ok || result.error) {
        console.error("Error fetching AI roles:", result.error);
        throw new Error(result.error || "Failed to fetch AI roles");
      }

      return result.data || [];
    } catch (error) {
      console.error("Error in aiRolesAPI.getAll:", error);
      throw error;
    }
  },

  // Get single AI role by ID
  getById: async (id: string): Promise<AIRole | null> => {
    const { data, error } = await supabase
      .from("ai_roles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching AI role:", error);
      return null;
    }

    return data;
  },

  // Create new AI role
  create: async (name: string, systemPrompt: string, userId: string): Promise<AIRole | null> => {
    const { data, error } = await supabase
      .from("ai_roles")
      .insert({
        user_id: userId,
        name,
        system_prompt: systemPrompt,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating AI role:", error);
      throw error;
    }

    return data;
  },

  // Update AI role
  update: async (id: string, name: string, systemPrompt: string): Promise<void> => {
    const { error } = await supabase
      .from("ai_roles")
      .update({
        name,
        system_prompt: systemPrompt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating AI role:", error);
      throw error;
    }
  },

  // Delete AI role
  delete: async (id: string): Promise<void> => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    const { error } = await supabase.from("ai_roles").delete().eq("id", id);

    if (error) {
      console.error("Error deleting AI role:", error);
      throw error;
    }
  },
};

// Auth helpers
export const authAPI = {
  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error);
      throw error;
    }

    return data;
  },

  // Sign out
  signOut: async () => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    if (!supabase) {
      return null;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // Get session
  getSession: async () => {
    if (!supabase) {
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },
};
