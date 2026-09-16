import React, { useState } from 'react';
import { SchoolClass, AppData, SchoolLevel } from '../types';
import { Plus, Trash2, Building2 } from 'lucide-react';

interface ManageClassesTabProps {
  appData: AppData;
  onAddClass: (name: string, levelId?: string) => void;
  onDeleteClass: (id: string) => void;
}

export const ManageClassesTab: React.FC<ManageClassesTabProps> = ({ appData, onAddClass, onDeleteClass }) => {
  const [newClassName, setNewClassName] = useState('');
  const [newLevelId, setNewLevelId] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    onAddClass(newClassName.trim(), newLevelId || undefined);
    setNewClassName('');
    setNewLevelId('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manage Classes</h2>
          <p className="text-sm text-gray-500">Create and organize school classes</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          placeholder="New Class Name (e.g. Grade 10-A)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        {appData.levels && appData.levels.length > 0 && (
          <select
            value={newLevelId}
            onChange={(e) => setNewLevelId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">No Level assigned</option>
            {appData.levels.sort((a, b) => a.order - b.order).map(lvl => (
              <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
            ))}
          </select>
        )}
        <button
          type="submit"
          disabled={!newClassName.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </form>

      <div className="space-y-3">
        {appData.classes.map(c => {
          const levelName = appData.levels?.find(l => l.id === c.levelId)?.name || 'Unassigned Level';
          return (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 transition">
              <div>
                <h3 className="font-bold text-gray-800">{c.name}</h3>
                <p className="text-xs text-gray-500">{levelName} &bull; {c.students.length} Students &bull; {c.subjects.length} Subjects</p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete class ${c.name}? This removes all its students and subjects.`)) {
                    onDeleteClass(c.id);
                  }
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                title="Delete Class"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {appData.classes.length === 0 && (
          <div className="text-center py-8 text-gray-500">No classes created yet.</div>
        )}
      </div>
    </div>
  );
};
