require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { initBot, notifyStatusChange } = require('./telegramBot');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Server-Sent Events (SSE) subscribers for real-time lead updates
let sseClients = [];

function broadcastSSE(event, data) {
  sseClients.forEach(client => {
    client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });
}

// SSE Connection Endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// --- REST API ENDPOINTS ---

// GET /api/leads - List leads with optional tag filtering
app.get('/api/leads', (req, res) => {
  let leads = db.getLeads();
  const { tag, search, status } = req.query;

  if (tag) {
    leads = leads.filter(l => l.tags && l.tags.includes(tag));
  }
  if (status) {
    leads = leads.filter(l => l.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.contact.toLowerCase().includes(q) ||
      l.request.toLowerCase().includes(q) ||
      (l.notes && l.notes.toLowerCase().includes(q))
    );
  }

  res.json({ leads, total: leads.length });
});

// GET /api/tags - Get list of all active tags
app.get('/api/tags', (req, res) => {
  const tags = db.getAllTags();
  res.json({ tags });
});

// POST /api/leads - Create lead manually (Point 3)
app.post('/api/leads', (req, res) => {
  const { name, contact, request, source, tags, status, notes } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ error: 'Поля "Имя" и "Контакт" обязательны' });
  }

  const newLead = db.addLead({
    name,
    contact,
    request: request || '',
    source: source || 'Manual Input',
    status: status || 'new',
    tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Manual'],
    notes: notes || ''
  });

  broadcastSSE('lead_created', newLead);
  res.status(201).json(newLead);
});

// PUT /api/leads/:id - Update lead (status, tags, notes, details)
app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const oldLead = db.getLeads().find(l => l.id === id);

  if (!oldLead) {
    return res.status(404).json({ error: 'Лид не найден' });
  }

  const updated = db.updateLead(id, req.body);

  // If status changed and lead came from Telegram bot, send bot notification
  if (req.body.status && req.body.status !== oldLead.status && updated.tgUserId) {
    const statusLabels = {
      new: 'Новый',
      contacted: 'В контакте',
      qualifying: 'Переговоры / Квалификация',
      won: 'Сделка заключена 🚀',
      lost: 'Отклонен / Закрыт'
    };
    notifyStatusChange(updated.tgUserId, statusLabels[updated.status] || updated.status);
  }

  broadcastSSE('lead_updated', updated);
  res.json(updated);
});

// DELETE /api/leads/:id - Delete lead
app.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const success = db.deleteLead(id);
  if (!success) {
    return res.status(404).json({ error: 'Лид не найден' });
  }
  broadcastSSE('lead_deleted', { id });
  res.json({ success: true, id });
});

// GET /api/bot-status - Check if bot is running
app.get('/api/bot-status', (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  res.json({
    active: !!(token && token.trim() !== '' && telegramBotInstance),
    hasToken: !!(token && token.trim() !== '')
  });
});

// Initialize Telegram Bot
const telegramBotInstance = initBot(process.env.TELEGRAM_BOT_TOKEN, (newLead) => {
  broadcastSSE('lead_created', newLead);
});

// Serve frontend in production build if built
const path = require('path');
const distPath = path.join(__dirname, '../dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Сервер Mini-CRM запущен на порту http://localhost:${PORT}`);
});
