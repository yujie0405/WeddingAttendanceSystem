// src/pages/admin/AdminPage.tsx
import React, { useState } from 'react';
import type { Role, Tag } from '../types';
import { INITIAL_TAGS, INITIAL_ANGPAO } from '../data';

interface Props {
  currentUser?: { name: string; role: Role };
}

export const AdminPage: React.FC<Props> = () => {
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);
  const [newTagName, setNewTagName] = useState('');

  // 礼金汇总（仅在后台可见）
  const totalAngpaoRM = INITIAL_ANGPAO.reduce((sum, item) => sum + (item.isVoided ? 0 : item.amount), 0);

  // 添加自定义标签
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: `t_${Date.now()}`,
      name: newTagName.trim(),
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    };
    setTags([...tags, newTag]);
    setNewTagName('');
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter((t) => t.id !== tagId));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-xl font-bold text-slate-800">后台管理与系统配置</h2>
        <p className="text-xs text-gray-500 mt-0.5">仅管理员可查看礼金汇总与自定义标签设置</p>
      </div>

      {/* 1. 礼金汇总统计模块 (敏感财务数据仅在此处显示) */}
      <div className="bg-amber-900 text-white p-5 rounded-2xl shadow-sm space-y-2">
        <div className="flex justify-between items-center text-amber-200 text-xs">
          <span>累计已收取礼金 (后台统计)</span>
          <i className="fa-solid fa-lock"></i>
        </div>
        <div className="text-3xl font-extrabold text-amber-300">
          RM {totalAngpaoRM.toLocaleString()}
        </div>
        <p className="text-[11px] text-amber-200/80">
          前端签到页面已全面隐藏具体金额，确保现场宾客隐私。
        </p>
      </div>

      {/* 2. 后台自定义标签管理 (你要求的标签列表) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <i className="fa-solid fa-[#tags] text-amber-600"></i>
          自定义宾客标签管理
        </h3>

        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            placeholder="输入新标签名称 (如: 素食者, VIP...)"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            新增标签
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 ${tag.color}`}
            >
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteTag(tag.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};