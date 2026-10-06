import React from 'react';
import { Kanban, List, FileText, Plus, Bot, Send, Zap } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenBotConfigModal,
  botStatus,
  leadsCount
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="logo-section">
          <div className="logo-badge">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="brand-title">Agency LeadFlow CRM</h1>
            <p className="brand-subtitle">Мини-CRM воронки продаж и сбора лидов</p>
          </div>
        </div>

        {/* View switcher tabs */}
        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
            onClick={() => setActiveTab('kanban')}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Канбан</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <List className="w-3.5 h-3.5" />
            <span>Список ({leadsCount})</span>
          </button>

        </div>

        {/* Header Actions */}
        <div className="header-actions">
          <button
            className="status-chip"
            onClick={onOpenBotConfigModal}
            title="Подключение Telegram Бота"
          >
            <span className={botStatus.active ? "pulse-dot" : "w-2 h-2 rounded-full bg-amber-400"}></span>
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>{botStatus.active ? "TG Бот: Активен" : "TG Бот: Настройка"}</span>
          </button>

          <button className="btn-primary" onClick={onOpenAddModal}>
            <Plus className="w-4 h-4" />
            <span>Добавить лида</span>
          </button>
        </div>
      </div>
    </header>
  );
}
