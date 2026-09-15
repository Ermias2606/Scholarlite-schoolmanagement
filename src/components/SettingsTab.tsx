import React, { useState, useRef } from 'react';
import {
  Building2,
  Calendar,
  Sparkles,
  Download,
  Upload,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
  Users,
  History,
  ShieldCheck,
  Award,
  Sun,
  Moon,
} from 'lucide-react';
import { AppData, Settings, UserProfile } from '../types';
import { exportBackupJSON, parseAndValidateBackupJSON } from '../utils/storage';
import { DEFAULT_APP_DATA } from '../utils/defaultData';
import { StaffManagementSection } from './StaffManagementSection';
import { AuditLogSection } from './AuditLogSection';
import { useTheme } from '../utils/theme';

interface SettingsTabProps {
  appData: AppData;
  currentUser?: UserProfile;
  onUpdateSettings: (settings: Settings) => void;
  onUpdateLevels?: (levels: any[]) => void;
  onRestoreData: (restored: AppData) => void;
  onFactoryReset: () => void;
  onUpdateUsers?: (users: UserProfile[]) => void;
  onAddAuditLog?: (action: string, details: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  appData,
  currentUser,
  onUpdateSettings,
  onUpdateLevels,
  onRestoreData,
  onFactoryReset,
  onUpdateUsers,
  onAddAuditLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'staff' | 'audit'>('config');
  const { theme, toggleTheme } = useTheme();

  const [schoolName, setSchoolName] = useState(appData.settings.name);
  const [academicYear, setAcademicYear] = useState(appData.settings.academicYear);
  const [logoPreview, setLogoPreview] = useState(appData.settings.logo || '/icon.svg');
  const [newSemester, setNewSemester] = useState('');
  const [newSlogan, setNewSlogan] = useState('');
  const [newLevelName, setNewLevelName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const restoreFileRef = useRef<HTMLInputElement | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = schoolName.trim();
    const trimmedYear = academicYear.trim();

    if (!trimmedName || !trimmedYear) {
      alert('School name and academic year are required.');
      return;
    }

    onUpdateSettings({
      ...appData.settings,
      name: trimmedName,
      academicYear: trimmedYear,
      logo: logoPreview,
    });

    if (onAddAuditLog) {
      onAddAuditLog('Update School Settings', `Updated name to "${trimmedName}", year "${trimmedYear}"`);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddSemester = () => {
    const trimmed = newSemester.trim();
    if (!trimmed) return;
    if (appData.settings.semesters.includes(trimmed)) {
      alert('This term already exists.');
      return;
    }

    onUpdateSettings({
      ...appData.settings,
      semesters: [...appData.settings.semesters, trimmed],
    });

    if (onAddAuditLog) {
      onAddAuditLog('Add Academic Term', `Added term "${trimmed}"`);
    }

    setNewSemester('');
  };

  const handleRemoveSemester = (term: string) => {
    if (appData.settings.semesters.length <= 1) {
      alert('At least one academic term is required.');
      return;
    }
    if (confirm(`Remove ${term}? Existing marks recorded for this term will be preserved.`)) {
      onUpdateSettings({
        ...appData.settings,
        semesters: appData.settings.semesters.filter((t) => t !== term),
      });
      if (onAddAuditLog) {
        onAddAuditLog('Remove Academic Term', `Removed term "${term}"`);
      }
    }
  };

  const handleAddSlogan = () => {
    const trimmed = newSlogan.trim();
    if (!trimmed) return;
    onUpdateSettings({
      ...appData.settings,
      slogans: [...appData.settings.slogans, trimmed],
    });
    setNewSlogan('');
  };

  const handleRemoveSlogan = (slogan: string) => {
    onUpdateSettings({
      ...appData.settings,
      slogans: appData.settings.slogans.filter((s) => s !== slogan),
    });
  };

  const handleAddLevel = () => {
    const trimmed = newLevelName.trim();
    if (!trimmed) return;
    if ((appData.levels || []).some(l => l.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('This level already exists.');
      return;
    }

    if (onUpdateLevels) {
      const order = (appData.levels || []).length + 1;
      onUpdateLevels([...(appData.levels || []), { id: `level_${Date.now()}`, name: trimmed, order }]);
      if (onAddAuditLog) {
        onAddAuditLog('Add School Level', `Added school level "${trimmed}"`);
      }
    }
    setNewLevelName('');
  };

  const handleRemoveLevel = (levelId: string, levelName: string) => {
    if (confirm(`Remove ${levelName}?`)) {
      if (onUpdateLevels) {
        onUpdateLevels((appData.levels || []).filter((l) => l.id !== levelId));
      }
      if (onAddAuditLog) {
        onAddAuditLog('Remove School Level', `Removed level "${levelName}"`);
      }
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const restored = parseAndValidateBackupJSON(text);
        if (!restored) {
          alert('Invalid backup JSON format. Please verify the file.');
          return;
        }
        if (
          confirm(
            `Restore backup from file? This will overwrite the current database with ${restored.classes.length} classes.`
          )
        ) {
          onRestoreData(restored);
          if (onAddAuditLog) {
            onAddAuditLog('Restore Backup JSON', `Restored ${restored.classes.length} classes from file`);
          }
          alert('Data successfully restored!');
        }
      } catch (err) {
        alert('Failed to read backup file: ' + String(err));
      } finally {
        if (restoreFileRef.current) restoreFileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = () => {
    if (
      confirm(
        'Reset to default demo data? This will load pre-configured classes (Grade 10-A, Grade 9-B) and sample marks.'
      )
    ) {
      onRestoreData(DEFAULT_APP_DATA);
      if (onAddAuditLog) {
        onAddAuditLog('Load Demo Data', 'Reset database to factory demo snapshot');
      }
      alert('Demo data loaded successfully!');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeSubTab === 'config'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#FFC300]" />
          <span>School &amp; Academics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeSubTab === 'staff'
              ? 'bg-[#00A896] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff &amp; Role Permissions</span>
          {appData.users && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeSubTab === 'staff' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {appData.users.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <History className="w-4 h-4 text-[#00A896]" />
          <span>Institutional Audit Trail</span>
          {appData.auditLogs && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeSubTab === 'audit' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {appData.auditLogs.length}
            </span>
          )}
        </button>
      </div>

      {/* 1. School Configuration Subtab */}
      {activeSubTab === 'config' && (
        <div className="space-y-6">
          {/* School Identity */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-[#003366] font-bold text-base">
              <Building2 className="w-5 h-5 text-[#00A896]" />
              <span>School Identity &amp; Academic Year</span>
            </div>

            {saveSuccess && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>School identity saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveIdentity} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    School / Institution Name
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Springfield High School"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold outline-none focus:border-[#00A896]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Current Academic Year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2024/2025"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold outline-none focus:border-[#00A896]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  School Logo / Crest (Used on Reports and Header)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-gray-200 bg-gray-50 p-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-[#003366] hover:file:bg-gray-200 cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      PNG, SVG, or JPG recommended. Stored locally offline.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Save Identity
                </button>
              </div>
            </form>
          </div>

          {/* Grading System Scale Preview */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-[#003366] font-bold text-base">
              <Award className="w-5 h-5 text-[#FFC300]" />
              <span>Standard Grading Scale &amp; GPA System</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Standardized weighted grading criteria used across class summaries, whole term master sheets, rank lists, and report cards.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4 text-center">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="text-lg font-black text-emerald-800">A+</div>
                <div className="text-xs font-bold text-emerald-700">90% - 100%</div>
                <div className="text-[11px] text-emerald-600 mt-0.5">GPA 4.0</div>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl">
                <div className="text-lg font-black text-teal-800">A</div>
                <div className="text-xs font-bold text-teal-700">80% - 89%</div>
                <div className="text-[11px] text-teal-600 mt-0.5">GPA 3.7</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="text-lg font-black text-blue-800">B</div>
                <div className="text-xs font-bold text-blue-700">70% - 79%</div>
                <div className="text-[11px] text-blue-600 mt-0.5">GPA 3.0</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="text-lg font-black text-amber-800">C</div>
                <div className="text-xs font-bold text-amber-700">60% - 69%</div>
                <div className="text-[11px] text-amber-600 mt-0.5">GPA 2.0</div>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl">
                <div className="text-lg font-black text-orange-800">D</div>
                <div className="text-xs font-bold text-orange-700">50% - 59%</div>
                <div className="text-[11px] text-orange-600 mt-0.5">GPA 1.0</div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                <div className="text-lg font-black text-rose-800">F</div>
                <div className="text-xs font-bold text-rose-700">&lt; 50%</div>
                <div className="text-[11px] text-rose-600 mt-0.5">GPA 0.0</div>
              </div>
            </div>
          </div>

          {/* School Levels Configuration */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-[#003366] font-bold text-base">
              <Building2 className="w-5 h-5 text-[#00A896]" />
              <span>School Levels / Sections</span>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {(appData.levels || []).sort((a, b) => a.order - b.order).map((level) => (
                  <span
                    key={level.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {level.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveLevel(level.id, level.name)}
                      className="text-indigo-500 hover:text-red-600 rounded-full p-0.5 transition cursor-pointer"
                      title="Remove level"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  placeholder="e.g. Pre-School or High School"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddLevel}
                  className="flex items-center gap-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Level</span>
                </button>
              </div>
            </div>
          </div>

          {/* Academic Terms Configuration */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-[#003366] font-bold text-base">
              <Calendar className="w-5 h-5 text-[#00A896]" />
              <span>Academic Terms / Semesters</span>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {appData.settings.semesters.map((term) => (
                  <span
                    key={term}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#00A896]/10 text-[#00A896] border border-[#00A896]/20"
                  >
                    {term}
                    <button
                      type="button"
                      onClick={() => handleRemoveSemester(term)}
                      className="text-[#00A896] hover:text-red-600 rounded-full p-0.5 transition cursor-pointer"
                      title="Remove term"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  placeholder="e.g. Term 3 or Final Semester"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium outline-none focus:border-[#00A896]"
                />
                <button
                  type="button"
                  onClick={handleAddSemester}
                  className="flex items-center gap-1 px-4 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Landing Page Slogans */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-[#003366] font-bold text-base">
              <Sparkles className="w-5 h-5 text-[#FFC300]" />
              <span>Landing Page Slogan Carousel</span>
            </div>

            <div className="mt-4">
              <div className="space-y-2 mb-4">
                {appData.settings.slogans.map((slogan) => (
                  <div
                    key={slogan}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800"
                  >
                    <span className="truncate pr-2">&ldquo;{slogan}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlogan(slogan)}
                      className="text-gray-400 hover:text-red-600 p-1 transition cursor-pointer"
                      title="Remove slogan"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSlogan}
                  onChange={(e) => setNewSlogan(e.target.value)}
                  placeholder="Add inspiring slogan for welcome screen..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium outline-none focus:border-[#00A896]"
                />
                <button
                  type="button"
                  onClick={handleAddSlogan}
                  className="flex items-center gap-1 px-4 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slogan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Application Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700 text-[#003366] dark:text-blue-400 font-bold text-base">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <span>Application Preferences</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">Dark Mode</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle between light and dark themes</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-[#003366] font-bold text-base">
              <Download className="w-5 h-5 text-[#00A896]" />
              <span>Data Backup &amp; Disaster Recovery (JSON)</span>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-gray-500">
                Export a complete JSON snapshot containing all your school settings, class structures, student rosters, and recorded marks. You can restore this file at any time on any device.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => exportBackupJSON(appData)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Full Backup (JSON)</span>
                </button>

                <input
                  type="file"
                  ref={restoreFileRef}
                  accept=".json"
                  className="hidden"
                  onChange={handleRestoreFile}
                />

                <button
                  onClick={() => restoreFileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span>Restore Backup (JSON)</span>
                </button>

                <button
                  onClick={handleResetToDemo}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
                  title="Reset to default sample data"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                  <span>Load Sample Demo Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="bg-white rounded-3xl border border-red-200 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2 pb-3 border-b border-red-100 text-rose-600 font-bold text-base">
              <AlertOctagon className="w-5 h-5" />
              <span>Danger Zone: Factory Reset</span>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              This operation will permanently erase all classes, students, assessment definitions, and recorded scores from browser storage. Ensure you have exported a JSON backup beforehand.
            </p>

            <div className="mt-4">
              <button
                onClick={() => {
                  if (
                    confirm(
                      'Are you absolutely sure you want to perform a FACTORY RESET? All classes, students, and marks will be permanently cleared.'
                    )
                  ) {
                    onFactoryReset();
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
              >
                Factory Reset (Clear All Data)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Staff & Role Access Subtab */}
      {activeSubTab === 'staff' && onUpdateUsers && onAddAuditLog && (
        <StaffManagementSection
          users={appData.users || []}
          classes={appData.classes}
          onUpdateUsers={onUpdateUsers}
          onAddAuditLog={onAddAuditLog}
        />
      )}

      {/* 3. Audit Trail Subtab */}
      {activeSubTab === 'audit' && (
        <AuditLogSection logs={appData.auditLogs || []} />
      )}
    </div>
  );
};
