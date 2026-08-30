'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Smartphone, LogOut, RefreshCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function AdminWhatsAppClient() {
    const [status, setStatus] = useState<string>('Loading...');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/admin/whatsapp');
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status);
                setQrCode(data.qr);
            } else {
                setStatus('Error contacting service');
            }
        } catch (err) {
            setStatus('Connection Error');
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (action: 'link' | 'disconnect') => {
        setIsLoading(true);
        try {
            await fetch('/api/admin/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            await fetchStatus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-primary" />
                            WhatsApp Connection
                        </CardTitle>
                        <CardDescription>Manage the Baileys service connection.</CardDescription>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 border">
                        Status: <span className="text-primary">{status}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {status === 'WAITING_FOR_QR' && qrCode ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 rounded-xl border">
                        <QRCodeSVG value={qrCode} size={256} className="bg-white p-4 rounded-xl shadow-sm" />
                        <p className="mt-4 text-sm text-muted-foreground text-center">
                            Scan this QR code with the Dukanzo WhatsApp account.<br/>
                            Open WhatsApp &gt; Linked Devices &gt; Link a device.
                        </p>
                    </div>
                ) : status === 'CONNECTED' ? (
                    <div className="p-8 bg-green-50 text-green-700 rounded-xl border border-green-200 flex flex-col items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Smartphone className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-lg">WhatsApp Connected</h3>
                        <p className="text-sm mt-1 opacity-80">The Baileys service is actively connected and ready to send messages.</p>
                    </div>
                ) : (
                    <div className="p-8 bg-neutral-50 rounded-xl border text-center text-muted-foreground">
                        {status === 'CONNECTING' ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                                <p>Connecting to WhatsApp Service...</p>
                            </div>
                        ) : (
                            <p>No active WhatsApp connection.</p>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex gap-4">
                {status !== 'CONNECTED' && status !== 'CONNECTING' && status !== 'WAITING_FOR_QR' && (
                    <Button onClick={() => handleAction('link')} disabled={isLoading} className="gap-2">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                        Link Device
                    </Button>
                )}
                {(status === 'CONNECTED' || status === 'WAITING_FOR_QR') && (
                    <Button variant="destructive" onClick={() => handleAction('disconnect')} disabled={isLoading} className="gap-2">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        Disconnect Device
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
