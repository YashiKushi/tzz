import React, { useState } from 'react';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';

export default function UserbotSimulatorModal({ onClose, onSimulate }) {
  const [senderName, setSenderName] = useState('Михаил Романов');
  const [tgHandle, setTgHandle] = useState('@mike_tech_agency');
  const [messageText, setMessageText] = useState('Здравствуйте! Пишу вам в личку Telegram. Нам нужен аудит текущей CRM системы и интеграция с веб-сайтом.');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate({
      senderName,
      tgHandle,
      messageText,
      extractedTags: ['TG Личный', 'Аудит', 'Интеграция']
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="modal-title">Симуляция подключенного Telegram (Пункт 2)</h2>
              <p className="text-xs text-gray-400">Перехват входящего личного сообщения через Userbot API</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white p-1" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-3 mb-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 leading-relaxed">
            <span className="font-bold">Как это работает в прод-версии:</span> Сервер с Pyrogram / Telethon подписывается на событие <code className="text-purple-300">NewMessage</code> личного аккаунта Telegram. Входящие диалоги от незнакомых контактов автоматически парсятся и добавляются в CRM с источником <strong>"Telegram Personal"</strong>.
          </div>

          <div className="form-group">
            <label className="form-label">Имя отправителя в Telegram</label>
            <input
              type="text"
              className="form-input"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telegram @username или Телефон</label>
            <input
              type="text"
              className="form-input font-mono text-purple-300"
              value={tgHandle}
              onChange={(e) => setTgHandle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Текст личного сообщения</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn-primary bg-gradient-to-r from-purple-600 to-indigo-600">
              <Send className="w-4 h-4" />
              <span>Отправить симуляцию в CRM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
