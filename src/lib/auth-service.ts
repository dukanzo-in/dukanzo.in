import { createClient } from "@/lib/supabase/client";

export interface AuthResponse {
  success: boolean;
  error?: string;
}

export interface SessionResponse extends AuthResponse {
  sessionEstablished: boolean;
}

/**
 * Abstracted Authentication Service — Email + Password via Supabase Auth
 */
export const AuthService = {
  /**
   * Sign in with email and password
   */
  async loginWithEmail(email: string, password: string): Promise<SessionResponse> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, sessionEstablished: false, error: "Incorrect email or password." };
        }
        if (error.message.includes("Email not confirmed")) {
          return { success: false, sessionEstablished: false, error: "Please verify your email first. Check your inbox." };
        }
        return { success: false, sessionEstablished: false, error: error.message };
      }
      return { success: true, sessionEstablished: !!data.session };
    } catch {
      return { success: false, sessionEstablished: false, error: "An unexpected error occurred." };
    }
  },

  /**
   * Sign up with email and password — Supabase sends a verification email automatically
   */
  async signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message.includes("already registered")) {
          return { success: false, error: "This email is already registered. Try logging in." };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch {
      return { success: false, error: "An unexpected error occurred." };
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<AuthResponse> {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch {
      return { success: false, error: "An unexpected error occurred." };
    }
  },

  /**
   * Update user's password (after clicking reset link)
   */
  async updatePassword(password: string): Promise<AuthResponse> {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: "An unexpected error occurred." };
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
  },
};
