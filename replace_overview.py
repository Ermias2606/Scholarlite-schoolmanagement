import re

with open('src/components/OverviewTab.tsx', 'r') as f:
    content = f.read()

# Make sure status is accounted for in pending approvals
# Update OverviewTab top section stats based on role
# We can replace the 4 stat cards with role-specific stats.

new_stats_logic = """  const totalTerms = semesters.length;

  const isAdmin = ['super_admin', 'school_admin', 'admin'].includes(currentUser.role);
  const isTeacher = ['class_teacher', 'subject_teacher'].includes(currentUser.role);

  // Admin Specific Metric
  const pendingStudentsCount = appData.classes.reduce((sum, c) => 
    sum + c.students.filter(s => s.status === 'pending').length
  , 0);

  const totalStaff = appData.users?.length || 0;

  // Aggregate student academic metrics across visible classes for the active term"""

content = content.replace("  const totalTerms = semesters.length;\n\n  // Aggregate student", new_stats_logic)

# Replace the 4 metric cards block
cards_old = """      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003366] flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">Total Classes</p>
          <p className="text-2xl font-black text-gray-900">{totalClasses}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-[#00A896] flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">Total Students</p>
          <p className="text-2xl font-black text-gray-900">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">Active Subjects</p>
          <p className="text-2xl font-black text-gray-900">{totalSubjects}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">Active Terms</p>
          <p className="text-2xl font-black text-gray-900">{totalTerms}</p>
        </div>
      </div>"""

cards_new = """      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003366] flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">{isAdmin ? 'Total Classes' : 'Assigned Classes'}</p>
          <p className="text-2xl font-black text-gray-900">{totalClasses}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-[#00A896] flex items-center justify-center mb-3 relative z-10">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1 relative z-10">Total Students</p>
          <p className="text-2xl font-black text-gray-900 relative z-10">{totalStudents}</p>
        </div>
        
        {isAdmin ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-xs font-semibold mb-1">Pending Approvals</p>
              <p className={`text-2xl font-black ${pendingStudentsCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{pendingStudentsCount}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-xs font-semibold mb-1">Total Staff</p>
              <p className="text-2xl font-black text-gray-900">{totalStaff}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-xs font-semibold mb-1">Assigned Subjects</p>
              <p className="text-2xl font-black text-gray-900">{currentUser.assignedSubjects?.length || totalSubjects}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-center items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-xs font-semibold mb-1">Mark Entries</p>
              <button 
                onClick={() => onNavigateTab('results')}
                className="text-xs font-bold text-emerald-600 mt-2 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-full transition"
              >
                Go to Entries
              </button>
            </div>
          </>
        )}
      </div>"""

content = content.replace(cards_old, cards_new)

header_old = """          <p className="text-white/80 text-sm sm:text-base mt-2">
            {currentUser.role === 'admin'
              ? `Principal administrative workspace for ${settings.name}. Manage school cohorts, verify terminal grades, and inspect institutional audit logs.`
              : currentUser.role === 'class_teacher'
              ? `Class management cockpit. You have authority over student rosters, terminal attendance, and report cards for your assigned class.`
              : `Academic faculty portal. Record continuous assessment scores and review student course performance.`}
          </p>"""

header_new = """          <p className="text-white/80 text-sm sm:text-base mt-2">
            {['super_admin', 'school_admin', 'admin'].includes(currentUser.role)
              ? `Principal administrative workspace for ${settings.name}. Manage school cohorts, verify terminal grades, and inspect institutional audit logs.`
              : currentUser.role === 'class_teacher'
              ? `Class management cockpit. You have authority over student rosters, terminal attendance, and report cards for your assigned class.`
              : `Academic faculty portal. Record continuous assessment scores and review student course performance.`}
          </p>"""

content = content.replace(header_old, header_new)

with open('src/components/OverviewTab.tsx', 'w') as f:
    f.write(content)

