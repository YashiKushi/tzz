const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data if empty
const INITIAL_LEADS = [
  {
    id: 'lead-101',
    name: 'Александр Смирнов',
    contact: '@alex_smirnov_tech',
    request: 'Нужен мобильный сервис записи в салон под ключ с веб-панелью администратора.',
    source: 'Telegram Bot',
    status: 'new',
    tags: ['Telegram Bot', 'Hot', 'Разработка'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: 'Заявка пришла через бота. Запросил примерную стоимость и сроки.'
  },
  {
    id: 'lead-102',
    name: 'Ольга Васильева',
    contact: '+7 (999) 456-78-90',
    request: 'Автоматизация отдела продаж, интеграция 1С и Telegram бота.',
    source: 'Manual Input',
    status: 'qualifying',
    tags: ['VIP', 'Интеграция', 'CRM'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: 'Звонок от партнера. Бюджет высокий, встреча во вторник.'
  },
  {
    id: 'lead-103',
    name: 'Дмитрий Ковалев',
    contact: '@dmitry_koval',
    request: 'Консультация по архитектуре высоконагруженного веб-сервиса.',
    source: 'Telegram Personal',
    status: 'contacted',
    tags: ['TG Личный', 'Консалтинг'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    notes: 'Личное сообщение в TG. Отправлен прайс-лист.'
  }
];

class DB {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_LEADS, null, 2), 'utf8');
    }
  }

  getLeads() {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading DB:', err);
      return [];
    }
  }

  saveLeads(leads) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing DB:', err);
    }
  }

  addLead(leadData) {
    const leads = this.getLeads();
    const newLead = {
      id: 'lead-' + Date.now(),
      name: leadData.name || 'Аноним',
      contact: leadData.contact || 'Не указан',
      request: leadData.request || '',
      source: leadData.source || 'Telegram Bot',
      status: leadData.status || 'new',
      tags: leadData.tags || ['Telegram Bot'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: leadData.notes || '',
      tgUserId: leadData.tgUserId || null,
      tgUsername: leadData.tgUsername || null
    };
    leads.unshift(newLead);
    this.saveLeads(leads);
    return newLead;
  }

  updateLead(id, updates) {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) return null;

    leads[index] = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveLeads(leads);
    return leads[index];
  }

  deleteLead(id) {
    let leads = this.getLeads();
    const initialLen = leads.length;
    leads = leads.filter(l => l.id !== id);
    this.saveLeads(leads);
    return leads.length < initialLen;
  }

  getAllTags() {
    const leads = this.getLeads();
    const tagSet = new Set();
    leads.forEach(l => {
      if (Array.isArray(l.tags)) {
        l.tags.forEach(t => tagSet.add(t));
      }
    });
    // Add standard system tags if missing
    ['Telegram Bot', 'TG Личный', 'Manual', 'Hot', 'VIP', 'Разработка', 'Консалтинг', 'CRM'].forEach(t => tagSet.add(t));
    return Array.from(tagSet);
  }
}

module.exports = new DB();
