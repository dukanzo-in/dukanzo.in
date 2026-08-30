import { initAuthCreds, BufferJSON, AuthenticationState } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';

export const createSupabaseAuthState = async (supabaseUrl: string, supabaseKey: string) => {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const writeData = async (data: unknown, key: string) => {
        const jsonStr = JSON.stringify(data, BufferJSON.replacer);
        await supabase
            .from('whatsapp_auth_state')
            .upsert({ id: key, data: JSON.parse(jsonStr), updated_at: new Date().toISOString() });
    };

    const readData = async (key: string) => {
        const { data, error } = await supabase
            .from('whatsapp_auth_state')
            .select('data')
            .eq('id', key)
            .single();

        if (error || !data) return null;
        return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
    };

    const removeData = async (key: string) => {
        await supabase
            .from('whatsapp_auth_state')
            .delete()
            .eq('id', key);
    };

    const creds = await readData('creds') || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type: string, ids: string[]) => {
                    const data: { [key: string]: unknown } = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = BufferJSON.reviver('', value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data: Record<string, Record<string, unknown>>) => {
                    const tasks: Promise<void>[] = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                },
            },
        } as AuthenticationState,
        saveCreds: () => writeData(creds, 'creds'),
    };
};
