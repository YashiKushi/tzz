import React, { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Plus } from 'lucide-react';
import { getTagClass } from './TagFilter';

export default function LeadModal({ lead, availableTags, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    request: '',
    source: 'Manual Input',
    status: 'new',
    tags: ['Manual'],
    notes: ''
  });

  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        contact: lead.contact || '',
        request: lead.request || '',
        source: lead.source || 'Manual Input',
        status: lead.status || 'new',
        tags: lead.tags || [],
        notes: lead.notes || ''
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleTag = (tag) => {
    setFormData(prev => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      };
    });
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim();
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setNewTagInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contact.trim()) {
      alert('Пожалуйста, заполните Имя и Контакт');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {lead ? 'Редактирование лида' : 'Новый лид'}
          </h2>
          <button className="text-slate-400 hover:text-white p-1 rounded transition-colors" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="form-group">
              <label className="form-label">Имя клиента *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Александр Смирнов"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Контакт (Тел / TG / Email) *</label>
              <input
                type="text"
                name="contact"
                className="form-input font-mono text-cyan-400 text-xs"
                placeholder="@username или +7 (999) 000-00-00"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Request */}
          <div className="form-group">
            <label className="form-label">Запрос / Описание задачи</label>
            <textarea
              name="request"
              rows={3}
              className="form-textarea"
              placeholder="Разработка веб-сервиса, автоматизация продаж..."
              value={formData.request}
              onChange={handleChange}
            />
          </div>

          {/* Source & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="form-group">
              <label className="form-label">Источник</label>
              <select
                name="source"
                className="form-select"
                value={formData.source}
                onChange={handleChange}
              >
                <option value="Manual Input">Ручной ввод</option>
                <option value="Telegram Bot">Telegram Бот</option>
                <option value="Telegram Personal">Telegram Личный</option>
                <option value="Website">Сайт</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Статус воронки</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="new">Новый лид</option>
                <option value="contacted">В контакте</option>
                <option value="qualifying">Переговоры / КП</option>
                <option value="won">Сделка заключена 🚀</option>
                <option value="lost">Отказ</option>
              </select>
            </div>
          </div>

          {/* Tags Picker */}
          <div className="form-group">
            <label className="form-label flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5 text-indigo-400" />
              Присвоить теги:
            </label>

            {/* Selected Active Tags */}
            <div className="modal-tag-picker min-h-[42px]">
              {formData.tags.length === 0 ? (
                <span className="text-xs text-slate-500 py-1 px-1">Теги не выбраны</span>
              ) : (
                formData.tags.map(t => (
                  <span
                    key={t}
                    className={`tag-chip ${getTagClass(t)} text-xs cursor-pointer flex items-center gap-1`}
                    onClick={() => handleToggleTag(t)}
                  >
                    {t} <X className="w-3 h-3 hover:text-rose-400" />
                  </span>
                ))
              )}
            </div>

            {/* Available Quick Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {availableTags.map(t => {
                const isSelected = formData.tags.includes(t);
                if (isSelected) return null;
                return (
                  <button
                    key={t}
                    type="button"
                    className="modal-quick-tag"
                    onClick={() => handleToggleTag(t)}
                  >
                    + {t}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                className="form-input text-xs py-1.5"
                placeholder="Новый тег (напр., Срочно, VIP)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary py-1.5 text-xs whitespace-nowrap"
                onClick={handleAddCustomTag}
              >
                <Plus className="w-3.5 h-3.5" /> Добавить
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Заметки менеджера</label>
            <textarea
              name="notes"
              rows={2}
              className="form-textarea"
              placeholder="Дополнительная информация по сделке..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div className="modal-footer">
            {lead && onDelete && (
              <button
                type="button"
                className="btn-secondary text-rose-400 border-rose-900/40 hover:bg-rose-950/40 mr-auto"
                onClick={() => onDelete(lead.id)}
              >
                Удалить
              </button>
            )}

            <button type="button" className="btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn-primary">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
