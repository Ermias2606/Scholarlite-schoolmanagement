import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const authCodeOld = `        setCurrentUser(profile);
      } else {
        // No user logged in
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);`;

const authCodeNew = `        setCurrentUser(profile);
        
        // Route to the appropriate dashboard
        if (profile) {
          if (profile.role === 'subject_teacher' || profile.role === 'class_teacher') {
            setActiveTab('teacher_dashboard');
          } else if (profile.role === 'student') {
            setActiveTab('overview');
          } else {
            setActiveTab('overview'); // admin/super_admin
          }
        }
      } else {
        // No user logged in
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);`;

content = content.replace(authCodeOld, authCodeNew);

const loadingCodeOld = `          {/* Elegant modern spinner */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-white/10 border-t-[#00A896] rounded-full animate-spin" />
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/70 font-semibold tracking-wider uppercase text-sm"
            >
              Loading workspace
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }`;

const loadingCodeNew = `          {/* Elegant modern spinner */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-white/10 border-t-[#00A896] rounded-full animate-spin" />
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/70 font-semibold tracking-wider uppercase text-sm"
            >
              Loading workspace
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }`;

fs.writeFileSync('src/App.tsx', content);
