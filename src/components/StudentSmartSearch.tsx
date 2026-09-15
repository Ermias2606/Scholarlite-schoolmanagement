import React, { useState, useEffect, useRef } from 'react';
import { Search, User, GraduationCap, X } from 'lucide-react';
import { AppData, Student, SchoolClass } from '../types';

interface SearchResult {
  student: Student;
  schoolClass: SchoolClass;
}

interface StudentSmartSearchProps {
  appData: AppData;
  onSelect?: (result: SearchResult) => void;
}

export const StudentSmartSearch: React.FC<StudentSmartSearchProps> = ({ appData, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const matched: SearchResult[] = [];

    appData.classes.forEach(c => {
      c.students.forEach(s => {
        if (
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toString() === q ||
          (s.admissionNumber || '').toLowerCase().includes(q)
        ) {
          matched.push({ student: s, schoolClass: c });
        }
      });
    });

    setResults(matched.slice(0, 8)); // limit to 8 results
    setIsOpen(true);
  }, [query, appData]);

  return (
    <div ref={wrapperRef} className="relative hidden md:block w-64 lg:w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && results.length > 0) setIsOpen(true);
          }}
          placeholder="Smart search student ID or name..."
          className="w-full pl-9 pr-8 py-1.5 bg-gray-100 border-transparent focus:bg-white border focus:border-[#00A896] rounded-xl text-xs outline-none transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute top-full mt-1.5 left-0 w-full md:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Search Results ({results.length})
          </div>
          <div className="max-h-80 overflow-y-auto p-1">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No students found matching "{query}"
              </div>
            ) : (
              results.map((res) => (
                <div
                  key={res.student.id}
                  className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-default transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-[#00A896]/10 flex items-center justify-center text-[#00A896] flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {res.student.name}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {res.student.admissionNumber || `Roll #${res.student.rollNo}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {res.schoolClass.name}
                      </span>
                      <span>&bull;</span>
                      <span>{res.student.gender}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
