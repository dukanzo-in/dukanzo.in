import { AuthenticationState } from '@whiskeysockets/baileys';
export declare const createSupabaseAuthState: (supabaseUrl: string, supabaseKey: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
//# sourceMappingURL=authAdapter.d.ts.map