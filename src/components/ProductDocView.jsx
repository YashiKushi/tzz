import React, { useState } from 'react';
import { Send, Code2, Layers, Zap, Copy, Check } from 'lucide-react';

export default function ProductDocView() {
  const [copied, setCopied] = useState(false);

  const hrMessageText = `Здравствуйте, Анна (@lav_arb)! 👋

Направляю выполненное тестовое задание на позицию Вайбкодера:

1. 🚀 Живой MVP (Мини-CRM + Telegram Бот): http://localhost:5000 (или ссылка на деплой Render/Railway)
2. 📄 Итоговый документ (Набросок продукта + Разбор решения + ИИ промпты): https://github.com/user/agency-leadflow-crm/blob/main/TEST_ASSIGNMENT_SUBMISSION.md
3. 📌 Резюме на HH.ru: [Ссылка на ваше резюме HH]

Кратко по реализации:
• Обязательные пункты (1, 3, 4) выполнены полностью: интерактивный Telegram-бот мгновенно передает заявки в CRM через SSE, работает ручной ввод лидов и гибкая система цветных тегов с фильтрацией воронки.
• Пункт 2 (обычный Telegram) задокументирован архитектурно и встроен в CRM в виде рабочей интерактивной симуляции.
• Приложение имеет премиальный Slate-дизайн, Канбан и Табличный вид.

Буду рад обсудить детали на интервью!`;

  const copyHrMessage = () => {
    navigator.clipboard.writeText(hrMessageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-4xl mx-auto text-slate-200">
      {/* Title Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Документация к тестовому заданию</span>
          <h1 className="text-xl font-bold text-white mt-0.5 mb-0">Мини-CRM для заявок агентства (Agency LeadFlow)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Автор: Вайбкодер | Стек: Node.js Express + React Vite + SSE + Telegram Bot API</p>
        </div>
      </div>

      {/* Part 1: Product Outline */}
      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-base font-bold text-white mb-3 pb-1 border-b border-slate-800">
          <Layers className="w-4 h-4 text-indigo-400" />
          1. Набросок продукта (Product Blueprint)
        </h2>

        <h3 className="text-sm font-semibold text-slate-100 mt-4 mb-1.5">Какую проблему решаем и для кого</h3>
        <p className="text-xs leading-relaxed text-slate-300 mb-2">
          Небольшие диджитал-агентства ежедневно теряют заявки из-за разрозненных каналов связи (боты, личный Telegram сотрудников, формы на сайте, звонки). Нет единого реестра, лидам не присваиваются теги, а менеджеры забывают связываться повторно.
        </p>
        <p className="text-xs leading-relaxed text-slate-300 mb-4">
          <strong>Agency LeadFlow CRM</strong> объединяет все каналы в единый Канбан-реестр с мгновенными уведомлениями клиенту и гибкой системой тегов.
        </p>

        <h3 className="text-sm font-semibold text-slate-100 mb-1.5">Схема работы системы</h3>
        <pre className="doc-pre">
{`[ Telegram Bot API ] --------\\
                               ---\\---> [ Express API ] ---> [ JSON Persistence DB ]
[ TG Personal (Userbot) ] ----/              |
                                             | (Server-Sent Events)
[ Ручной ввод лида ] ---------------------> [ React Web CRM ]`}
        </pre>

        <h3 className="text-sm font-semibold text-slate-100 mt-4 mb-1.5">Что входит в MVP (Реализовано)</h3>
        <ul className="list-disc list-inside text-xs leading-relaxed text-slate-300 space-y-1 mb-4">
          <li><strong>Telegram-бот (Пункт 1):</strong> Пошаговый сбор заявки (Имя → Контакт → Запрос) → создание лида с тегами <code className="text-sky-300 font-mono">Telegram Bot</code> и <code className="text-sky-300 font-mono">Новый лид</code>.</li>
          <li><strong>Ручное добавление (Пункт 3):</strong> Удобная модалка добавления лида с любого стороннего канала.</li>
          <li><strong>Теги и фильтрация (Пункт 4):</strong> Цветная идентификация тегов и быстрая фильтрация воронки по клику.</li>
          <li><strong>Канбан & Таблица:</strong> 5 этапов воронки с авто-уведомлением клиента в Telegram при смене статуса.</li>
        </ul>

        <h3 className="text-sm font-semibold text-slate-100 mb-1.5">Архитектура подключения обычного Telegram (Пункт 2)</h3>
        <p className="text-xs leading-relaxed text-slate-300 mb-2">
          Для автоматического перехвата сообщений из личного аккаунта используется воркер на <strong>Pyrogram / Telethon (MTProto API)</strong>:
        </p>
        <ol className="list-decimal list-inside text-xs leading-relaxed text-slate-300 space-y-1 mb-3">
          <li>Авторизация через <code className="text-indigo-300">api_id</code> + <code className="text-indigo-300">api_hash</code> с <code className="text-indigo-300">my.telegram.org</code>.</li>
          <li>Подписка на событие <code className="text-indigo-300">events.NewMessage(incoming=True, func=lambda e: e.is_private)</code>.</li>
          <li>Передача текста сообщения в LLM-экстрактор для получения Имени, Контакта и рекомендуемых тегов.</li>
          <li>POST-запрос на <code className="text-indigo-300">/api/leads</code> с тегом <code className="text-indigo-300">TG Личный</code>.</li>
        </ol>
      </section>

      {/* Part 2: AI Tools */}
      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-base font-bold text-white mb-3 pb-1 border-b border-slate-800">
          <Code2 className="w-4 h-4 text-indigo-400" />
          2. Короткий разбор (Инструменты & AI Промпты)
        </h2>

        <p className="text-xs leading-relaxed text-slate-300 mb-3">
          Приложение полностью создано с помощью **Antigravity (Gemini 3.6 Flash)**:
        </p>

        <div className="space-y-2 mb-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-indigo-400 font-semibold block mb-1">PROMPT 1: Architecture & Bot</span>
            <p className="text-xs text-slate-300 font-mono italic">
              "Создай Express сервер с REST API для лидов и пошаговым Telegram ботом. Добавь Server-Sent Events (SSE), чтобы клиентский веб-интерфейс получал новые лиды в реальном времени."
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-indigo-400 font-semibold block mb-1">PROMPT 2: UI & Tags</span>
            <p className="text-xs text-slate-300 font-mono italic">
              "Сверстай плоский профессиональный интерфейс CRM на React с Канбан-доской, табличным видом и тегированием без агрессивных неоновых свечений."
            </p>
          </div>
        </div>
      </section>

      {/* Part 3: Ready HR Message */}
      <section className="p-4 rounded-xl bg-slate-950 border border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 my-0">
            <Send className="w-4 h-4 text-sky-400" />
            3. Готовое сообщение для отправки HR (Анне @lav_arb)
          </h3>
          <button
            onClick={copyHrMessage}
            className="btn-primary py-1 px-3 text-xs bg-indigo-600 hover:bg-indigo-500"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано!' : 'Скопировать текст'}</span>
          </button>
        </div>

        <pre className="bg-slate-900 p-3.5 rounded-lg font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
          {hrMessageText}
        </pre>
      </section>
    </div>
  );
}
