import React from 'react';
import type { Tag } from '../types';

interface Props {
  allTags: Tag[];
  selectedTagIds: string[];
  onChange: (ids: string[]) => void;
}

export const TagListingSelector: React.FC<Props> = ({ allTags, selectedTagIds, onChange }) => {
  const toggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter(tId => tId !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
      {allTags.map(tag => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
              isSelected ? `${tag.color} ring-2 ring-amber-400 font-bold shadow-sm` : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <i className={`fa-solid ${isSelected ? 'fa-check-square' : 'fa-square'}`}></i>
            {tag.name}
          </button>
        );
      })}
    </div>
  );
};