import React, { useState } from 'react';
import { X, Bot, Check, Key, HelpCircle, AlertTriangle } from 'lucide-react';

export default function BotConfigModal({ botStatus, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="modal-title">Подключение Telegram Бота</h2>
              <p className="text-xs text-gray-400">Пункт 1 задания — автосбор заявок</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white p-1" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${botStatus.active ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200' : 'bg-amber-950/30 border-amber-800/40 text-amber-200'}`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {botStatus.active ? (
                <>
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Бот активен и принимает заявки!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Токен бота не задан в .env файле</span>
                </>
              )}
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {botStatus.active
                ? 'Бот слушаёт входящие сообщения в Telegram. Каждый ответивший на вопросы бота будет автоматически добавлен в воронку с тегом "Telegram Bot".'
                : 'Для запуска реального бота укажите ваш TELEGRAM_BOT_TOKEN в файле .env или протестируйте создание лида вручную / через симулятор.'}
            </p>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-400" />
              Как привязать своего Telegram бота:
            </h4>
            <ol className="list-decimal list-inside space-y-2 leading-relaxed bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
              <li>Откройте Telegram и найдите бота <code className="text-sky-300 font-mono">@BotFather</code>.</li>
              <li>Отправьте команду <code className="text-sky-300 font-mono">/newbot</code> и следуйте инструкциям.</li>
              <li>Скопируйте полученный HTTP API Token.</li>
              <li>Вставьте его в файл <code className="text-sky-300 font-mono">.env</code> сервера:
                <pre className="bg-black/40 p-2 rounded mt-1 font-mono text-[11px] text-emerald-400">TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ</pre>
              </li>
              <li>Перезапустите сервер (<code className="text-sky-300 font-mono">npm run dev</code>). Бот мгновенно начнет принимать заявки!</li>
            </ol>
          </div>

          <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800 text-xs text-gray-400">
            <span className="font-semibold text-gray-200">Пошаговый сценарий бота:</span>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Пользователь пишет <code>/start</code></li>
              <li>Бот запрашивает Имя клиента</li>
              <li>Бот запрашивает Контакт (телефон или кнопка Telegram)</li>
              <li>Бот запрашивает Запрос / Задача</li>
              <li>Заявка сохраняется в CRM с тегами <code>Telegram Bot</code> и <code>Новый лид</code>, а интерфейс обновляется мгновенно без перезагрузки!</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
