import React, { useState } from 'react';
import { AppData, SchoolLevel } from '../types';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../utils/storage';

interface ManageLevelsTabProps {
  appData: AppData;
  onUpdateLevels: (levels: SchoolLevel[]) => void;
  onAddAuditLog?: (action: string, details: string) => void;
}

export const ManageLevelsTab: React.FC<ManageLevelsTabProps> = ({ appData, onUpdateLevels, onAddAuditLog }) => {
  const [newLevelName, setNewLevelName] = useState('');
  const levels = appData.levels || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLevelName.trim();
    if (!trimmed) return;
    const newLvl: SchoolLevel = {
      id: generateId('lvl'),
      name: trimmed,
      order: levels.length + 1
    };
    const nextLevels = [...levels, newLvl];
    onUpdateLevels(nextLevels);
    setNewLevelName('');
    if (onAddAuditLog) onAddAuditLog('Add Level', `Added school level: ${trimmed}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete level ${name}? Classes assigned to this level will lose their assignment.`)) {
      const nextLevels = levels.filter(l => l.id !== id);
      onUpdateLevels(nextLevels);
      if (onAddAuditLog) onAddAuditLog('Delete Level', `Deleted school level: ${name}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manage School Levels</h2>
          <p className="text-sm text-gray-500">Super Admin Configuration</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newLevelName}
          onChange={(e) => setNewLevelName(e.target.value)}
          placeholder="New Level Name (e.g. Primary School)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
        />
        <button
          type="submit"
          disabled={!newLevelName.trim()}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add Level
        </button>
      </form>

      <div className="space-y-3">
        {levels.sort((a,b) => a.order - b.order).map(lvl => (
          <div key={lvl.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 transition">
            <h3 className="font-bold text-gray-800">{lvl.name}</h3>
            <button
              onClick={() => handleDelete(lvl.id, lvl.name)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
              title="Delete Level"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {levels.length === 0 && (
          <div className="text-center py-8 text-gray-500">No school levels defined.</div>
        )}
      </div>
    </div>
  );
};
