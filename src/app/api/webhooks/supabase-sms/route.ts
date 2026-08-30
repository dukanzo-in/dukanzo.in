import { NextResponse } from 'next/server';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const WHATSAPP_SERVICE_SECRET = process.env.WHATSAPP_SERVICE_SECRET || '';
const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET || 'dev_secret'; // In prod, secure this

export async function POST(req: Request) {
    // 1. Verify the caller is Supabase
    const url = new URL(req.url);
    if (url.searchParams.get('secret') !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await req.json();
        const phone = payload?.user?.phone;
        const otp = payload?.sms?.otp || (payload?.sms?.message?.match(/\d{6}/)?.[0]);
        
        if (!phone || !otp) {
            return NextResponse.json({ error: 'Missing phone or OTP in payload' }, { status: 400 });
        }

        const message = `Your Dukanzo verification code is: ${otp}`;

        // 2. Forward to the Baileys service securely
        const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/send-message`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_SERVICE_SECRET}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, message })
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error("Failed to forward SMS to Baileys:", errData);
            return NextResponse.json({ error: 'Failed to deliver message via Baileys' }, { status: 502 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
