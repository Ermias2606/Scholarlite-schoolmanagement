import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BookOpen } from 'lucide-react';
import { AssessmentComponent, Subject } from '../types';
import { generateId } from '../utils/storage';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject, originalName?: string) => void;
  editingSubject?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubject,
}) => {
  const [name, setName] = useState('');
  const [assessments, setAssessments] = useState<AssessmentComponent[]>([]);
  const [compName, setCompName] = useState('');
  const [compMaxScore, setCompMaxScore] = useState<number | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setAssessments(JSON.parse(JSON.stringify(editingSubject.assessments || [])));
    } else {
      setName('');
      setAssessments([
        { id: generateId('asm'), name: 'Continuous Assessment', maxScore: 40 },
        { id: generateId('asm'), name: 'Final Exam', maxScore: 60 },
      ]);
    }
    setCompName('');
    setCompMaxScore('');
    setError('');
  }, [editingSubject, isOpen]);

  if (!isOpen) return null;

  const handleAddComponent = () => {
    setError('');
    const trimmed = compName.trim();
    const score = Number(compMaxScore);

    if (!trimmed) {
      setError('Please provide a name for the assessment component.');
      return;
    }
    if (isNaN(score) || score <= 0) {
      setError('Assessment maximum score must be greater than 0.');
      return;
    }
    if (assessments.some((a) => a.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('An assessment component with this name already exists.');
      return;
    }

    setAssessments([
      ...assessments,
      { id: generateId('asm'), name: trimmed, maxScore: score },
    ]);
    setCompName('');
    setCompMaxScore('');
  };

  const handleRemoveComponent = (id: string) => {
    setAssessments(assessments.filter((a) => a.id !== id));
  };

  const totalMaxScore = assessments.reduce((sum, a) => sum + (Number(a.maxScore) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Subject name is required.');
      return;
    }
    if (assessments.length === 0) {
      setError('At least one assessment component is required.');
      return;
    }

    onSave(
      {
        name: trimmedName,
        assessments,
      },
      editingSubject ? editingSubject.name : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#003366]/10 text-[#003366] rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {editingSubject ? `Edit Subject: ${editingSubject.name}` : 'Add New Subject'}
              </h3>
              <p className="text-xs text-gray-500">Configure subject grading and assessment split</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Advanced Mathematics"
              disabled={!!editingSubject}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20 outline-none text-sm transition disabled:bg-gray-100"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">Assessment Components</label>
              <span className="text-xs font-bold text-[#003366] bg-[#003366]/5 px-2 py-0.5 rounded">
                Total Max: {totalMaxScore} pts
              </span>
            </div>

            {/* Existing assessments list */}
            <div className="space-y-2 mb-3">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm"
                >
                  <span className="font-medium text-gray-800">{a.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                      {a.maxScore} marks
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(a.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                      title="Remove assessment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {assessments.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">No assessment components added yet.</p>
              )}
            </div>

            {/* Add component inputs */}
            <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-xs font-medium text-gray-600 mb-2">Add Assessment Component:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="Component (e.g. Midterm)"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-xs outline-none focus:border-[#00A896]"
                />
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={compMaxScore}
                  onChange={(e) => setCompMaxScore(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Max"
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 text-xs outline-none focus:border-[#00A896] text-center"
                />
                <button
                  type="button"
                  onClick={handleAddComponent}
                  className="flex items-center gap-1 px-3 py-2 bg-[#00A896] hover:bg-[#008f80] text-white text-xs font-bold rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-sm font-semibold shadow-sm transition"
            >
              Save Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
