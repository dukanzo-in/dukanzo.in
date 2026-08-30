import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminWhatsAppClient } from './AdminWhatsAppClient';

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.phone) {
        redirect('/auth');
    }
    
    const adminPhone = process.env.ADMIN_PHONE?.replace(/[^0-9+]/g, '');
    const userPhone = session.user.phone.replace(/[^0-9+]/g, '');
    
    if (!adminPhone || (userPhone !== adminPhone && `+${userPhone}` !== adminPhone)) {
        // Not an admin, redirect home
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="container max-w-4xl mx-auto px-4">
                <div className="mb-8 border-b pb-6">
                    <h1 className="text-3xl font-black tracking-tight text-primary">Dukanzo Admin</h1>
                    <p className="text-muted-foreground mt-2">Internal systems and configuration.</p>
                </div>
                
                <AdminWhatsAppClient />
            </div>
        </div>
    );
}
