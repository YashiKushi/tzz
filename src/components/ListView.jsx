import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { getTagClass } from './TagFilter';

const STATUS_LABELS = {
  new: { label: 'Новый', class: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  contacted: { label: 'В контакте', class: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  qualifying: { label: 'Переговоры', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  won: { label: 'Сделка 🚀', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  lost: { label: 'Отказ', class: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
};

export default function ListView({ leads, onSelectLead, onDeleteLead, onUpdateStatus }) {
  if (leads.length === 0) {
    return (
      <div className="table-wrapper text-center py-12 text-slate-400">
        <p className="text-base font-semibold">Лиды не найдены</p>
        <p className="text-xs text-slate-500 mt-1">Измените параметры поиска или добавьте нового лида</p>
      </div>
    );
  }

  const getSourceDot = (source) => {
    switch (source) {
      case 'Telegram Bot':
        return (
          <span className="text-slate-300 text-xs font-medium inline-flex items-center">
            <span className="source-dot bg-sky-400"></span> TG Бот
          </span>
        );
      case 'Telegram Personal':
        return (
          <span className="text-slate-300 text-xs font-medium inline-flex items-center">
            <span className="source-dot bg-purple-400"></span> TG Личный
          </span>
        );
      default:
        return (
          <span className="text-slate-300 text-xs font-medium inline-flex items-center">
            <span className="source-dot bg-emerald-400"></span> Вручную
          </span>
        );
    }
  };

  return (
    <div className="table-wrapper">
      <table className="clean-table">
        <thead>
          <tr>
            <th style={{ width: '18%' }}>Имя лида</th>
            <th style={{ width: '18%' }}>Контакт</th>
            <th style={{ width: '28%' }}>Запрос / Задача</th>
            <th style={{ width: '12%' }}>Источник</th>
            <th style={{ width: '14%' }}>Теги</th>
            <th style={{ width: '12%' }}>Статус</th>
            <th style={{ width: '110px' }}>Дата</th>
            <th style={{ width: '70px', textAlign: 'right' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => {
            const statusInfo = STATUS_LABELS[lead.status] || STATUS_LABELS.new;

            return (
              <tr key={lead.id} className="cursor-pointer" onClick={() => onSelectLead(lead)}>
                <td className="font-semibold text-slate-100">{lead.name}</td>
                <td className="font-mono text-cyan-400 text-xs">{lead.contact}</td>
                <td className="text-slate-300 text-xs" title={lead.request}>
                  {lead.request || '—'}
                </td>
                <td>{getSourceDot(lead.source)}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {lead.tags && lead.tags.map(t => (
                      <span key={t} className={`tag-chip ${getTagClass(t)} text-[10px] px-1.5 py-0.5`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <select
                    className={`status-select-pill ${statusInfo.class}`}
                    value={lead.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(lead.id, e.target.value);
                    }}
                  >
                    <option value="new" className="bg-slate-900 text-slate-200">Новый</option>
                    <option value="contacted" className="bg-slate-900 text-slate-200">В контакте</option>
                    <option value="qualifying" className="bg-slate-900 text-slate-200">Переговоры</option>
                    <option value="won" className="bg-slate-900 text-slate-200">Сделка 🚀</option>
                    <option value="lost" className="bg-slate-900 text-slate-200">Отказ</option>
                  </select>
                </td>
                <td className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="icon-btn"
                      onClick={() => onSelectLead(lead)}
                      title="Редактировать"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => onDeleteLead(lead.id)}
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
