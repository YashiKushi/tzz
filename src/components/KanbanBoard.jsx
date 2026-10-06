import React from 'react';
import { Bot, UserCheck, MessageSquare, Clock, Phone, Edit3 } from 'lucide-react';
import { getTagClass } from './TagFilter';

const STAGES = [
  { id: 'new', name: 'Новый лид', color: '#818cf8', icon: Bot },
  { id: 'contacted', name: 'В контакте', color: '#38bdf8', icon: Phone },
  { id: 'qualifying', name: 'Переговоры / КП', color: '#fbbf24', icon: MessageSquare },
  { id: 'won', name: 'Сделка заключена', color: '#34d399', icon: UserCheck },
  { id: 'lost', name: 'Отказ', color: '#fb7185', icon: Clock }
];

export default function KanbanBoard({ leads, onSelectLead, onUpdateStatus }) {
  const getLeadsByStatus = (status) => {
    return leads.filter(l => l.status === status);
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'Telegram Bot':
        return (
          <span className="text-slate-300 text-xs font-medium flex items-center">
            <span className="source-dot bg-sky-400"></span>
            TG Бот
          </span>
        );
      case 'Telegram Personal':
        return (
          <span className="text-slate-300 text-xs font-medium flex items-center">
            <span className="source-dot bg-purple-400"></span>
            TG Личный
          </span>
        );
      default:
        return (
          <span className="text-slate-300 text-xs font-medium flex items-center">
            <span className="source-dot bg-emerald-400"></span>
            Вручную
          </span>
        );
    }
  };

  return (
    <div className="kanban-grid">
      {STAGES.map(stage => {
        const stageLeads = getLeadsByStatus(stage.id);
        const IconComponent = stage.icon;

        return (
          <div key={stage.id} className="kanban-column">
            {/* Column Header */}
            <div className="column-header">
              <div className="column-title-group" style={{ color: stage.color }}>
                <IconComponent className="w-3.5 h-3.5" />
                <span>{stage.name}</span>
              </div>
              <span className="lead-count-badge">{stageLeads.length}</span>
            </div>

            {/* Column Body Cards */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-0.5">
              {stageLeads.length === 0 ? (
                <div className="text-center py-10 px-3 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                  Нет лидов
                </div>
              ) : (
                stageLeads.map(lead => (
                  <div
                    key={lead.id}
                    className="lead-card"
                    onClick={() => onSelectLead(lead)}
                  >
                    {/* Header: Name + Contact + Tiny Edit Button */}
                    <div className="lead-card-header">
                      <div>
                        <h3 className="lead-name">{lead.name}</h3>
                        <div className="lead-contact-text">{lead.contact}</div>
                      </div>

                      <button
                        className="icon-btn-tiny"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        title="Редактировать лида"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Request Snippet Box */}
                    {lead.request && (
                      <div className="lead-request-box" title={lead.request}>
                        {lead.request}
                      </div>
                    )}

                    {/* Tags List */}
                    {lead.tags && lead.tags.length > 0 && (
                      <div className="lead-tags-list">
                        {lead.tags.map(tag => (
                          <span key={tag} className={`tag-chip ${getTagClass(tag)} text-[10px] py-0.5 px-1.5`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta Row: Source Dot + Date */}
                    <div className="lead-meta-row">
                      {getSourceBadge(lead.source)}
                      <span>
                        {new Date(lead.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Stage Selector Row */}
                    <div className="lead-stage-row">
                      <span>Этап:</span>
                      <select
                        className="status-select-pill"
                        value={lead.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(lead.id, e.target.value);
                        }}
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
