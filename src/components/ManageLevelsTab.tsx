import React, { useState } from 'react';
import { AppData, SchoolLevel, Department, Branch, UserProfile } from '../types';
import { generateId } from '../utils/storage';
import { 
  Layers, Plus, Trash2, Edit2, ShieldCheck, MapPin, Building, Briefcase 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ManageLevelsTabProps {
  appData: AppData;
  onUpdateLevels: (levels: SchoolLevel[]) => void;
  onUpdateDepartments: (departments: Department[]) => void;
  onUpdateBranches: (branches: Branch[]) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export const ManageLevelsTab: React.FC<ManageLevelsTabProps> = ({
  appData,
  onUpdateLevels,
  onUpdateDepartments,
  onUpdateBranches,
  onAddAuditLog,
}) => {
  const [activeOrgTab, setActiveOrgTab] = useState<'levels' | 'departments' | 'branches'>('levels');
  const staff = appData.users.filter(u => u.role !== 'student');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Layers className="w-6 h-6 text-indigo-600" />
          Organization Structure
        </h2>
        <p className="text-sm text-gray-500 mb-6">Manage School Levels, Departments, and Branches, and assign organizational leaders.</p>
        
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
          <button
            onClick={() => setActiveOrgTab('levels')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeOrgTab === 'levels' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            School Levels
          </button>
          <button
            onClick={() => setActiveOrgTab('departments')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeOrgTab === 'departments' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Departments
          </button>
          <button
            onClick={() => setActiveOrgTab('branches')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeOrgTab === 'branches' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Building className="w-4 h-4 inline mr-2" />
            Branches
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeOrgTab === 'levels' && (
            <motion.div key="levels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LevelsManager 
                levels={appData.levels || []} 
                staff={staff}
                onUpdate={onUpdateLevels} 
                onAudit={onAddAuditLog} 
              />
            </motion.div>
          )}
          {activeOrgTab === 'departments' && (
            <motion.div key="departments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DepartmentsManager 
                departments={appData.departments || []} 
                staff={staff}
                onUpdate={onUpdateDepartments} 
                onAudit={onAddAuditLog} 
              />
            </motion.div>
          )}
          {activeOrgTab === 'branches' && (
            <motion.div key="branches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BranchesManager 
                branches={appData.branches || []} 
                staff={staff}
                onUpdate={onUpdateBranches} 
                onAudit={onAddAuditLog} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Levels Manager ---
const LevelsManager = ({ levels, staff, onUpdate, onAudit }: any) => {
  const [name, setName] = useState('');
  const [headId, setHeadId] = useState('');
  
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newLevel = { id: generateId('lvl'), name, order: levels.length + 1, headId };
    onUpdate([...levels, newLevel]);
    onAudit('Add School Level', `Created ${name}`);
    setName('');
    setHeadId('');
  };

  const handleDelete = (id: string, lvlName: string) => {
    if(confirm(`Delete ${lvlName}?`)) {
      onUpdate(levels.filter((l: any) => l.id !== id));
      onAudit('Delete School Level', `Removed ${lvlName}`);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Level Name (e.g. Primary)" 
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-indigo-500"
          required 
        />
        <select
          value={headId}
          onChange={e => setHeadId(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-indigo-500"
        >
          <option value="">-- Assign Level Head (Optional) --</option>
          {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
        </select>
        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 whitespace-nowrap">
          Add Level
        </button>
      </form>
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-bold">Level Name</th>
              <th className="px-4 py-3 font-bold">Level Head</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {levels.map((l: any) => {
              const head = staff.find((s: any) => s.id === l.headId);
              return (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-bold text-gray-900">{l.name}</td>
                  <td className="px-4 py-3 text-gray-600">{head ? head.name : <span className="text-gray-400 italic">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(l.id, l.name)} className="p-1.5 text-gray-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {levels.length === 0 && <tr><td colSpan={3} className="text-center py-6 text-gray-500">No school levels defined.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Departments Manager ---
const DepartmentsManager = ({ departments, staff, onUpdate, onAudit }: any) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [headId, setHeadId] = useState('');
  
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newDept = { id: generateId('dept'), name, description: desc, headId };
    onUpdate([...departments, newDept]);
    onAudit('Add Department', `Created ${name}`);
    setName(''); setDesc(''); setHeadId('');
  };

  const handleDelete = (id: string, deptName: string) => {
    if(confirm(`Delete ${deptName}?`)) {
      onUpdate(departments.filter((d: any) => d.id !== id));
      onAudit('Delete Department', `Removed ${deptName}`);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Department Name (e.g. Science)" 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-indigo-500"
            required 
          />
          <select
            value={headId}
            onChange={e => setHeadId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-indigo-500"
          >
            <option value="">-- Assign Department Head --</option>
            {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
            placeholder="Short Description..." 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-indigo-500"
          />
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 whitespace-nowrap">
            Add Dept
          </button>
        </div>
      </form>
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-bold">Department</th>
              <th className="px-4 py-3 font-bold">H.O.D.</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map((d: any) => {
              const head = staff.find((s: any) => s.id === d.headId);
              return (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-bold text-gray-900">{d.name} <span className="text-xs text-gray-400 font-normal block">{d.description}</span></td>
                  <td className="px-4 py-3 text-gray-600">{head ? head.name : <span className="text-gray-400 italic">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(d.id, d.name)} className="p-1.5 text-gray-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {departments.length === 0 && <tr><td colSpan={3} className="text-center py-6 text-gray-500">No departments defined.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Branches Manager ---
const BranchesManager = ({ branches, staff, onUpdate, onAudit }: any) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [headId, setHeadId] = useState('');
  
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newBranch = { id: generateId('br'), name, location, branchHeadId: headId };
    onUpdate([...branches, newBranch]);
    onAudit('Add Branch', `Created ${name}`);
    setName(''); setLocation(''); setHeadId('');
  };

  const handleDelete = (id: string, brName: string) => {
    if(confirm(`Delete ${brName}?`)) {
      onUpdate(branches.filter((b: any) => b.id !== id));
      onAudit('Delete Branch', `Removed ${brName}`);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Branch Name (e.g. North Campus)" 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-indigo-500"
            required 
          />
          <select
            value={headId}
            onChange={e => setHeadId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-indigo-500"
          >
            <option value="">-- Assign Branch Manager --</option>
            {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="Address / Location" 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-indigo-500"
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 whitespace-nowrap">
            Add Branch
          </button>
        </div>
      </form>
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-bold">Branch Name</th>
              <th className="px-4 py-3 font-bold">Branch Head</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {branches.map((b: any) => {
              const head = staff.find((s: any) => s.id === b.branchHeadId);
              return (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-bold text-gray-900">{b.name} <span className="text-xs text-gray-400 font-normal block">{b.location}</span></td>
                  <td className="px-4 py-3 text-gray-600">{head ? head.name : <span className="text-gray-400 italic">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(b.id, b.name)} className="p-1.5 text-gray-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {branches.length === 0 && <tr><td colSpan={3} className="text-center py-6 text-gray-500">No branches defined.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
