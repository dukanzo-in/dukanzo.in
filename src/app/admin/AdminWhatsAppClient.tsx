'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Smartphone, Wifi, WifiOff, RefreshCw, LogOut, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type Status = 'CONNECTED' | 'WAITING_FOR_QR' | 'CONNECTING' | 'NOT_CONNECTED' | 'DISCONNECTED' | 'LOGGED_OUT' | 'Loading...' | 'Error contacting service' | 'Connection Error';

export function AdminWhatsAppClient() {
    const [status, setStatus] = useState<Status>('Loading...');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getPin = () => new URLSearchParams(window.location.search).get('pin') || '';

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/whatsapp?pin=${getPin()}`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status || 'NOT_CONNECTED');
                setQrCode(data.qr || null);
            } else {
                setStatus('Error contacting service');
            }
        } catch {
            setStatus('Connection Error');
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const handleAction = async (action: 'link' | 'disconnect') => {
        setIsLoading(true);
        try {
            await fetch(`/api/admin/whatsapp?pin=${getPin()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            await fetchStatus();
        } finally {
            setIsLoading(false);
        }
    };

    const isConnected = status === 'CONNECTED';
    const isWaiting = status === 'WAITING_FOR_QR';
    const isConnecting = status === 'CONNECTING';

    const statusColor = isConnected ? '#22c55e' : isWaiting || isConnecting ? '#eab308' : '#ef4444';
    const statusLabel = isConnected ? 'Connected' : isWaiting ? 'Waiting for QR Scan' : isConnecting ? 'Connecting...' : 'Not Connected';

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Status Card */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid #2a2a4a',
                borderRadius: '20px',
                padding: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        borderRadius: '16px',
                        background: isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${statusColor}30`,
                    }}>
                        {isConnected ? <Wifi size={26} color="#22c55e" /> : <WifiOff size={26} color={statusColor} />}
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>WhatsApp Status</div>
                        <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700' }}>{statusLabel}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: statusColor,
                        boxShadow: `0 0 10px ${statusColor}`,
                        animation: isConnected ? 'none' : 'pulse 2s infinite',
                    }} />
                    <button
                        onClick={fetchStatus}
                        style={{
                            background: 'transparent', border: '1px solid #2a2a4a',
                            borderRadius: '10px', padding: '8px', cursor: 'pointer',
                            color: '#64748b', display: 'flex', alignItems: 'center',
                        }}
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* QR Code Area */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid #2a2a4a',
                borderRadius: '20px',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '340px',
                justifyContent: 'center',
            }}>
                {isWaiting && qrCode ? (
                    <>
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '20px',
                            boxShadow: '0 0 60px rgba(234,179,8,0.2)',
                            marginBottom: '24px',
                        }}>
                            <QRCodeSVG value={qrCode} size={220} />
                        </div>
                        <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>
                            Scan with WhatsApp
                        </div>
                        <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>
                            Open WhatsApp → <strong style={{ color: '#94a3b8' }}>Settings → Linked Devices → Link a Device</strong>
                        </div>
                    </>
                ) : isConnected ? (
                    <>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(34,197,94,0.15)',
                            border: '2px solid rgba(34,197,94,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '20px',
                        }}>
                            <ShieldCheck size={36} color="#22c55e" />
                        </div>
                        <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '20px', marginBottom: '8px' }}>
                            WhatsApp Connected!
                        </div>
                        <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
                            OTPs are being delivered via WhatsApp to your customers.
                        </div>
                    </>
                ) : isConnecting ? (
                    <>
                        <Loader2 size={40} color="#eab308" style={{ animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
                        <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '18px', marginBottom: '8px' }}>
                            Connecting...
                        </div>
                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                            Initializing Baileys WhatsApp session.
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(100,116,139,0.15)',
                            border: '2px solid rgba(100,116,139,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '20px',
                        }}>
                            <Smartphone size={36} color="#64748b" />
                        </div>
                        <div style={{ color: '#94a3b8', fontWeight: '600', fontSize: '18px', marginBottom: '8px' }}>
                            No Device Linked
                        </div>
                        <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '28px' }}>
                            Click "Link Device" to generate a QR code and connect your WhatsApp.
                        </div>
                        <button
                            onClick={() => handleAction('link')}
                            disabled={isLoading}
                            style={{
                                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                                border: 'none', borderRadius: '14px',
                                padding: '14px 32px', cursor: 'pointer',
                                color: '#000', fontWeight: '700', fontSize: '16px',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                boxShadow: '0 4px 20px rgba(234,179,8,0.3)',
                                opacity: isLoading ? 0.7 : 1,
                            }}
                        >
                            {isLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Smartphone size={18} />}
                            Link Device
                        </button>
                    </>
                )}
            </div>

            {/* Disconnect */}
            {(isConnected || isWaiting) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => handleAction('disconnect')}
                        disabled={isLoading}
                        style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '12px', padding: '10px 20px',
                            cursor: 'pointer', color: '#ef4444',
                            fontWeight: '600', fontSize: '14px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                    >
                        {isLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <LogOut size={15} />}
                        Disconnect
                    </button>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}
