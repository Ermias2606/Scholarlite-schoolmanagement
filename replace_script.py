import re

with open('src/components/LandingView.tsx', 'r') as f:
    content = f.read()

replacement = """
  return (
    <section
      id="view-landing"
      className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#00A896]/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#003366]/10 blur-3xl" />

      <div className="absolute top-6 right-6 z-10">
        <PWAInstallButton className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm" />
      </div>

      <div className={`relative w-full ${landingState === 'portals' ? 'max-w-4xl' : 'max-w-[420px]'} bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 text-center z-10 transition-all duration-500`}>
        {landingState === 'login' && (
          <div className="flex justify-start mb-4">
            <button
              onClick={() => {
                setLandingState('portals');
                setSelectedPortal(null);
                setLoginError(null);
              }}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Portals
            </button>
          </div>
        )}

        {/* Pulsing Emblem */}
        <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center p-2 relative">
          <img
            id="landing-logo-img"
            src={appData.settings.logo || '/icon.svg'}
            alt="School Logo"
            className="w-full h-full object-contain rounded-full"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icon.svg';
            }}
          />
        </div>

        <h1
          id="landing-school-name"
          className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1.5"
        >
          {appData.settings.name}
        </h1>

        {landingState === 'portals' ? (
          <>
            <p className="text-sm font-semibold text-[#00A896] uppercase tracking-wider mb-3">
              Academic Year {appData.settings.academicYear}
            </p>

            {/* Dynamic Slogan Carousel */}
            <div className="h-6 flex items-center justify-center px-2 mb-10">
              <p
                key={currentSloganIndex}
                className="text-sm font-medium text-gray-500 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                &ldquo;{slogans[currentSloganIndex]}&rdquo;
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <button
                onClick={() => {
                  setSelectedPortal('student');
                  setLandingState('login');
                }}
                className="group relative p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-[#00A896] shadow-sm hover:shadow-xl hover:shadow-[#00A896]/10 transition-all duration-300 flex flex-col items-center text-center cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Student & Parent Portal</h3>
                <p className="text-sm text-gray-500 relative z-10">Access grades, check attendance, review teacher remarks, and stay updated with assignments.</p>
                <div className="mt-6 flex items-center text-[#00A896] font-semibold text-sm relative z-10 group-hover:gap-2 transition-all">
                  Sign In <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedPortal('staff');
                  setLandingState('login');
                }}
                className="group relative p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-[#003366] shadow-sm hover:shadow-xl hover:shadow-[#003366]/10 transition-all duration-300 flex flex-col items-center text-center cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">School Staff Portal</h3>
                <p className="text-sm text-gray-500 relative z-10">Manage classes, submit grades, mark attendance, and access administrative tools.</p>
                <div className="mt-6 flex items-center text-[#003366] font-semibold text-sm relative z-10 group-hover:gap-2 transition-all">
                  Sign In <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="mt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              {selectedPortal === 'staff' ? 'Staff Sign In' : 'Student & Parent Sign In'}
            </h2>
            
            {/* Login Mode Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setLoginMode('credentials')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMode === 'credentials'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('quick')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMode === 'quick'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00A896]" />
                <span>Demo Access</span>
              </button>
            </div>

            {loginMode === 'credentials' ? (
              /* Credential Login Form */
              <form onSubmit={handleCredentialSubmit} className="space-y-4 text-left">
                {loginError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                {authSuccessUser && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Welcome, <strong>{authSuccessUser.name}</strong>! Entering {authSuccessUser.role.replace('_', ' ')} portal...
                    </span>
                  </div>
                )}

                {/* Google Sign In Button */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                <div className="relative mb-5 mt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-400 font-medium text-xs">or sign in with email</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Username or Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="input-login-username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setLoginError(null);
                        }}
                        placeholder={selectedPortal === 'staff' ? "e.g. admin or teacher" : "e.g. student roll no or email"}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition bg-gray-50/50 hover:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setLoginError(null);
                        }}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition bg-gray-50/50 hover:bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-sm shadow-md transition active:scale-98 cursor-pointer mt-6"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Quick Role Switcher Cards */
              <div className="space-y-5 text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1 text-center">
                  Select Demo Persona
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPortal === 'staff' && adminUser && (
                    <button
                      type="button"
                      onClick={() => onEnter(adminUser)}
                      className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-amber-50 hover:border-amber-200 transition text-left cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between">
                        <ShieldCheck className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          Admin
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-bold text-gray-900 leading-tight">
                          {adminUser.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">@{adminUser.username}</div>
                      </div>
                    </button>
                  )}

                  {selectedPortal === 'staff' && classTeacherUser && (
                    <button
                      type="button"
                      onClick={() => onEnter(classTeacherUser)}
                      className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 transition text-left cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between">
                        <GraduationCap className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Teacher
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-bold text-gray-900 leading-tight">
                          {classTeacherUser.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">@{classTeacherUser.username}</div>
                      </div>
                    </button>
                  )}

                  {selectedPortal === 'staff' && subjectTeacherUser && (
                    <button
                      type="button"
                      onClick={() => onEnter(subjectTeacherUser)}
                      className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition text-left cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between">
                        <BookOpen className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                          Faculty
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-bold text-gray-900 leading-tight">
                          {subjectTeacherUser.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">@{subjectTeacherUser.username}</div>
                      </div>
                    </button>
                  )}

                  {selectedPortal === 'student' && studentUser && (
                    <button
                      type="button"
                      onClick={() => onEnter(studentUser)}
                      className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-teal-50 hover:border-teal-200 transition text-left cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between">
                        <UserCheck className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                          Student
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-bold text-gray-900 leading-tight">
                          {studentUser.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">@{studentUser.username}</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col items-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <span className="inline-flex items-center gap-1 font-medium text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-[#00A896]" />
            Offline-Ready Progressive Web App
          </span>
          <span>Role-Based Access with Credentials &bull; PDF Print Engine</span>
        </div>
      </div>
    </section>
  );
"""

new_content = re.sub(r'  return \(\s*<section.*', replacement, content, flags=re.DOTALL)

with open('src/components/LandingView.tsx', 'w') as f:
    f.write(new_content)
