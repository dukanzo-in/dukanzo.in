import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminWhatsAppClient } from './AdminWhatsAppClient';

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ pin?: string }>;
}) {
    const { pin } = await searchParams;
    const adminPin = process.env.ADMIN_PIN || '0000';
    const cookieStore = await cookies();

    // Allow access if correct PIN is supplied in URL or cookie is set
    const isAuthed = cookieStore.get('admin_authed')?.value === adminPin || pin === adminPin;

    if (!isAuthed) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-black text-white mb-2">Dukanzo Admin</h1>
                    <p className="text-neutral-400 text-sm mb-6">Enter your admin PIN to continue.</p>
                    <form action="/admin" method="get">
                        <input
                            name="pin"
                            type="password"
                            placeholder="Enter PIN"
                            className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-lg tracking-widest mb-4 outline-none focus:border-yellow-400"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                        >
                            Enter Admin →
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 py-12">
            <div className="container max-w-4xl mx-auto px-4">
                <div className="mb-8 border-b border-neutral-800 pb-6">
                    <h1 className="text-3xl font-black tracking-tight text-yellow-400">Dukanzo Admin</h1>
                    <p className="text-neutral-400 mt-2">WhatsApp device management and configuration.</p>
                </div>

                <AdminWhatsAppClient />
            </div>
        </div>
    );
}
