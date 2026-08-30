import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WhatsAppService } from './baileys.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const internalSecret = process.env.WHATSAPP_SERVICE_SECRET;

app.use(cors());
app.use(express.json());

const waService = new WhatsAppService();

// Middleware to protect internal endpoints
const requireSecret = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!internalSecret || authHeader !== `Bearer ${internalSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/status', requireSecret, (req, res) => {
    res.json(waService.getStatus());
});

app.post('/api/link', requireSecret, async (req, res) => {
    try {
        await waService.connect();
        res.json({ success: true, message: 'Connection started' });
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.post('/api/disconnect', requireSecret, async (req, res) => {
    try {
        await waService.disconnect();
        res.json({ success: true });
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.post('/api/send-message', requireSecret, async (req, res) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message are required' });
    }

    try {
        await waService.sendMessage(phone, message);
        res.json({ success: true });
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.listen(port, () => {
    console.log(`WhatsApp Service listening on port ${port}`);
    // Optionally auto-connect on startup
    waService.connect().catch(console.error);
});
