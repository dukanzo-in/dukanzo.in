import { createClient } from "@/lib/supabase/client";

export interface OTPResponse {
  success: boolean;
  error?: string;
}

export interface VerifyOTPResponse extends OTPResponse {
  sessionEstablished: boolean;
}

/**
 * Abstracted Authentication Service
 * Currently utilizes Supabase Auth for session management.
 * The OTP transport (WhatsApp) is handled via Supabase's configured provider,
 * but this service wraps the calls to allow replacing the provider later without changing UI logic.
 */
export const AuthService = {
  /**
   * Sends an OTP via WhatsApp to the provided phone number.
   * Phone number should include country code (e.g., +919876543210)
   */
  async sendOTP(phone: string): Promise<OTPResponse> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'whatsapp', // Suggests WhatsApp if provider supports it
        }
      });

      if (error) {
        console.error("AuthService sendOTP Error:", error.message);
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          return { success: false, error: "Too many requests. Please wait before trying again." };
        }
        return { success: false, error: "Failed to send OTP. Please check the number and try again." };
      }

      return { success: true };
    } catch (err) {
      console.error("Unexpected error in sendOTP:", err);
      return { success: false, error: "An unexpected error occurred. Please try again later." };
    }
  },

  /**
   * Verifies the OTP entered by the user.
   */
  async verifyOTP(phone: string, code: string): Promise<VerifyOTPResponse> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms', // 'sms' is the generic type used for phone OTP verification in Supabase
      });

      if (error) {
        console.error("AuthService verifyOTP Error:", error.message);
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          return { success: false, sessionEstablished: false, error: "That code isn't correct or has expired." };
        }
        return { success: false, sessionEstablished: false, error: "Verification failed. Please try again." };
      }

      // Session is established automatically by Supabase Auth upon successful verification
      return { success: true, sessionEstablished: !!data.session };
    } catch (err) {
      console.error("Unexpected error in verifyOTP:", err);
      return { success: false, sessionEstablished: false, error: "An unexpected error occurred. Please try again later." };
    }
  },

  /**
   * Logs in a user with Phone and Password
   */
  async login(phone: string, password: string): Promise<VerifyOTPResponse> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });

      if (error) {
        return { success: false, sessionEstablished: false, error: error.message };
      }
      return { success: true, sessionEstablished: !!data.session };
    } catch (err) {
      console.error(err);
      return { success: false, sessionEstablished: false, error: "An unexpected error occurred." };
    }
  },

  /**
   * Registers a new user with Phone and Password. 
   * This will trigger an OTP verification SMS from Supabase.
   */
  async signUp(phone: string, password: string): Promise<OTPResponse> {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signUp({
        phone,
        password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, error: "This phone number is already registered. Please log in." };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "An unexpected error occurred." };
    }
  },

  /**
   * Updates the user's password. The user must be logged in (e.g. after verifying a reset OTP).
   */
  async updatePassword(password: string): Promise<OTPResponse> {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "An unexpected error occurred." };
    }
  },

  /**
   * Signs the user out
   */
  async signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
};
