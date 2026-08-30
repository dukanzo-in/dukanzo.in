import makeWASocket, { DisconnectReason, ConnectionState, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { createSupabaseAuthState } from './authAdapter.js';
import { createClient } from '@supabase/supabase-js';

const logger = pino({ level: 'silent' }); // Keep it silent in production unless debugging

export class WhatsAppService {
    private sock: ReturnType<typeof makeWASocket> | null = null;
    private supabaseUrl: string;
    private supabaseKey: string;
    private supabaseAdmin: ReturnType<typeof createClient>;
    private qrCode: string | null = null;
    private status: string = 'NOT_CONNECTED';
    
    constructor() {
        this.supabaseUrl = process.env.SUPABASE_URL || '';
        this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        if (!this.supabaseUrl || !this.supabaseKey) {
            throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
        }
        this.supabaseAdmin = createClient(this.supabaseUrl, this.supabaseKey);
    }

    private async updateStatus(newStatus: string, qr: string | null = null) {
        this.status = newStatus;
        this.qrCode = qr;
        try {
            await (this.supabaseAdmin
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('whatsapp_connection') as any)
                .upsert({ 
                    id: 'default', 
                    status: newStatus, 
                    updated_at: new Date().toISOString(),
                    // Optionally we could store the QR in the DB so Next.js doesn't need to poll the Express API directly,
                    // but calling the Express API /api/status is faster and safer for transient QR codes.
                });
        } catch (error) {
            console.error("Failed to update status in DB", error);
        }
    }

    public getStatus() {
        return {
            status: this.status,
            qr: this.qrCode
        };
    }

    public async connect() {
        if (this.status === 'CONNECTED' || this.status === 'CONNECTING') return;
        
        await this.updateStatus('CONNECTING');
        
        const { state, saveCreds } = await createSupabaseAuthState(this.supabaseUrl, this.supabaseKey);

        this.sock = makeWASocket({
            auth: state,
            logger,
            printQRInTerminal: false,
            browser: Browsers.macOS('Desktop'),
            syncFullHistory: false
        });

        this.sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                await this.updateStatus('WAITING_FOR_QR', qr);
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    await this.updateStatus('CONNECTING');
                    setTimeout(() => this.connect(), 5000); // Backoff
                } else {
                    await this.updateStatus('LOGGED_OUT');
                    // If logged out, delete auth state from DB
                    await this.supabaseAdmin.from('whatsapp_auth_state').delete().neq('id', 'dummy');
                }
            } else if (connection === 'open') {
                const phone = this.sock?.user?.id?.split(':')[0] || null;
                await this.updateStatus('CONNECTED');
                if (phone) {
                    await (this.supabaseAdmin
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .from('whatsapp_connection') as any)
                        .update({ phone_number: phone })
                        .eq('id', 'default');
                }
            }
        });

        this.sock.ev.on('creds.update', saveCreds);
    }

    public async disconnect() {
        if (this.sock) {
            this.sock.logout();
            this.sock = null;
        }
        await this.updateStatus('DISCONNECTED');
        await this.supabaseAdmin.from('whatsapp_auth_state').delete().neq('id', 'dummy');
    }

    public async sendMessage(phone: string, text: string) {
        if (this.status !== 'CONNECTED' || !this.sock) {
            throw new Error("WhatsApp is not connected");
        }
        
        // Normalize phone to format expected by Baileys
        const jid = `${phone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
        await this.sock.sendMessage(jid, { text });
    }
}
