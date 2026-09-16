import re

with open('src/components/OverviewTab.tsx', 'r') as f:
    content = f.read()

# Add imports
if "motion/react" not in content:
    content = content.replace("import React from 'react';", "import React, { useState } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';")

# Add lucide icons
icons_to_add = "  Plus,\n  FilePlus2,\n  CalendarPlus,\n  UserPlus,\n  Settings as SettingsIcon,"
content = content.replace("  CheckCircle2,\n} from 'lucide-react';", f"  CheckCircle2,\n{icons_to_add}\n}} from 'lucide-react';")

# Add QuickActions FAB at the end of the component
fab_code = """
      {/* Quick Actions FAB (Admin Only) */}
      {currentUser.role === 'admin' && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
          <AnimatePresence>
            {isFabOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="flex flex-col gap-2 pointer-events-auto"
              >
                <button
                  onClick={() => onNavigateTab('manage_students')}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-indigo-600 transition group"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">Register Student</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <UserPlus className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={() => onNavigateTab('calendar')}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-emerald-600 transition group"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600">Add School Event</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CalendarPlus className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={() => onNavigateTab('results')}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-amber-600 transition group"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-amber-600">Generate Report Cards</span>
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <FilePlus2 className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={() => onNavigateTab('manage_staff')}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-rose-600 transition group"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-rose-600">Create Department / Staff</span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-14 h-14 rounded-full bg-[#003366] text-white shadow-xl shadow-blue-900/20 flex items-center justify-center hover:bg-[#002244] transition-all transform pointer-events-auto ${isFabOpen ? 'rotate-45 bg-[#00A896]' : 'hover:scale-105'}`}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
"""

content = content.replace("export const OverviewTab: React.FC<OverviewTabProps> = ({", "export const OverviewTab: React.FC<OverviewTabProps> = ({")
if "const [isFabOpen, setIsFabOpen] = useState(false);" not in content:
    content = content.replace("  const currentYear = appData.settings.academicYear;", "  const currentYear = appData.settings.academicYear;\n  const [isFabOpen, setIsFabOpen] = useState(false);")

content = content.replace("    </div>\n  );\n};", fab_code + "\n    </div>\n  );\n};")

with open('src/components/OverviewTab.tsx', 'w') as f:
    f.write(content)

