import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const WHATSAPP_SERVICE_SECRET = process.env.WHATSAPP_SERVICE_SECRET || '';

// Reusable auth check
async function requireAdmin() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.phone) return false;
    
    const adminPhone = process.env.ADMIN_PHONE?.replace(/[^0-9+]/g, '');
    const userPhone = session.user.phone.replace(/[^0-9+]/g, '');
    
    if (!adminPhone || userPhone !== adminPhone && `+${userPhone}` !== adminPhone) {
        return false;
    }
    return true;
}

export async function GET() {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/status`, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_SERVICE_SECRET}`
            }
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return NextResponse.json({ error: 'Failed to contact WhatsApp service', details: (error as Error).message }, { status: 502 });
    }
}

export async function POST(req: Request) {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { action } = await req.json();
        
        let endpoint = '';
        if (action === 'link') endpoint = '/api/link';
        else if (action === 'disconnect') endpoint = '/api/disconnect';
        else return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

        const response = await fetch(`${WHATSAPP_SERVICE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_SERVICE_SECRET}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return NextResponse.json({ error: 'Failed to contact WhatsApp service', details: (error as Error).message }, { status: 502 });
    }
}
