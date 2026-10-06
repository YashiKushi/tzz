import React from 'react';
import { Tag as TagIcon, X } from 'lucide-react';

const TAG_COLOR_MAP = {
  'Telegram Bot': 'tag-blue',
  'TG Личный': 'tag-purple',
  'Manual': 'tag-emerald',
  'Новый лид': 'tag-cyan',
  'Hot': 'tag-rose',
  'VIP': 'tag-amber',
  'Разработка': 'tag-purple',
  'Консалтинг': 'tag-blue',
  'CRM': 'tag-emerald',
  'Интеграция': 'tag-amber'
};

export function getTagClass(tagName) {
  return TAG_COLOR_MAP[tagName] || 'tag-gray';
}

export default function TagFilter({ tags, selectedTag, onSelectTag, leads }) {
  // Compute count of leads per tag
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = leads.filter(l => l.tags && l.tags.includes(tag)).length;
    return acc;
  }, {});

  return (
    <div className="tag-bar glass-panel">
      <span className="tag-label flex items-center gap-1">
        <TagIcon className="w-3.5 h-3.5 text-indigo-400" />
        Теги:
      </span>

      <div
        className={`tag-chip ${!selectedTag ? 'active bg-indigo-600/30 text-indigo-200 border-indigo-500' : 'tag-gray'}`}
        onClick={() => onSelectTag(null)}
      >
        <span>Все ({leads.length})</span>
      </div>

      {tags.map((tag) => {
        const isSelected = selectedTag === tag;
        const colorClass = getTagClass(tag);
        const count = tagCounts[tag] || 0;

        return (
          <div
            key={tag}
            className={`tag-chip ${colorClass} ${isSelected ? 'active ring-2 ring-indigo-400 font-bold' : ''}`}
            onClick={() => onSelectTag(isSelected ? null : tag)}
          >
            <span>{tag}</span>
            <span className="text-[10px] opacity-75 bg-black/20 px-1.5 py-0.5 rounded-full">{count}</span>
            {isSelected && <X className="w-3 h-3 ml-0.5" />}
          </div>
        );
      })}
    </div>
  );
}
