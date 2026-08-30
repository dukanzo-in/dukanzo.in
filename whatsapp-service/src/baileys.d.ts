export declare class WhatsAppService {
    private sock;
    private supabaseUrl;
    private supabaseKey;
    private supabaseAdmin;
    private qrCode;
    private status;
    constructor();
    private updateStatus;
    getStatus(): {
        status: string;
        qr: string | null;
    };
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendMessage(phone: string, text: string): Promise<void>;
}
//# sourceMappingURL=baileys.d.ts.map