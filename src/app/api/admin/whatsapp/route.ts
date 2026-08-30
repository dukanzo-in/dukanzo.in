import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
const WHATSAPP_SERVICE_SECRET = process.env.WHATSAPP_SERVICE_SECRET || '';

// Check admin PIN from cookie or header
async function requireAdmin(req: Request) {
    const adminPin = process.env.ADMIN_PIN || '0000';
    
    // Check cookie
    const cookieStore = await cookies();
    if (cookieStore.get('admin_authed')?.value === adminPin) return true;
    
    // Check X-Admin-Pin header (sent by the client)
    const headerPin = req.headers.get('X-Admin-Pin');
    if (headerPin === adminPin) return true;

    // Check URL param via Referer (fallback: check query param from URL)
    const url = new URL(req.url);
    const pinParam = url.searchParams.get('pin');
    if (pinParam === adminPin) return true;

    return false;
}

export async function GET(req: Request) {
    if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { action } = body;
        
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
