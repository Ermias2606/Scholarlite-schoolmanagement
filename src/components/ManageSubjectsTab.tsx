import React, { useState } from 'react';
import { AppData, Subject } from '../types';
import { Plus, Trash2, BookOpen, Edit2 } from 'lucide-react';
import { SubjectModal } from './SubjectModal';

interface ManageSubjectsTabProps {
  appData: AppData;
  onSaveSubject: (classId: string, subject: Subject, originalName?: string) => void;
  onDeleteSubject: (classId: string, subjectName: string) => void;
}

export const ManageSubjectsTab: React.FC<ManageSubjectsTabProps> = ({ appData, onSaveSubject, onDeleteSubject }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(appData.classes[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const activeClass = appData.classes.find(c => c.id === selectedClassId);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage Subjects</h2>
            <p className="text-sm text-gray-500">Configure subjects and assessments per class</p>
          </div>
        </div>
        
        {appData.classes.length > 0 && (
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium"
          >
            {appData.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {!activeClass ? (
        <div className="text-center py-8 text-gray-500">Please create a class first.</div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Subjects for {activeClass.name}</h3>
            <button
              onClick={() => {
                setEditingSubject(null);
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>

          <div className="space-y-3">
            {activeClass.subjects.map(sub => {
              const maxScore = sub.assessments.reduce((sum, a) => sum + a.maxScore, 0);
              return (
                <div key={sub.name} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 transition">
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      {sub.name}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">{maxScore} pts total</span>
                    </h4>
                    <div className="text-xs text-gray-500 mt-1 flex gap-2 flex-wrap">
                      {sub.assessments.map(a => (
                        <span key={a.id} className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">{a.name} ({a.maxScore})</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingSubject(sub);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete subject ${sub.name}?`)) {
                          onDeleteSubject(activeClass.id, sub.name);
                        }
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {activeClass.subjects.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                No subjects assigned to this class yet.
              </div>
            )}
          </div>
        </>
      )}

      {isModalOpen && activeClass && (
        <SubjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(subject) => onSaveSubject(activeClass.id, subject, editingSubject?.name)}
          existingSubject={editingSubject || undefined}
        />
      )}
    </div>
  );
};
