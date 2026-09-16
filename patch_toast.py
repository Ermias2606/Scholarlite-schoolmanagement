import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';")
content = content.replace("  Home,", "  Home,\n  CheckCircle2,")

# 2. Add state and trigger
state_addition = """
  const [showSaveToast, setShowSaveToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSaveToast = () => {
    setShowSaveToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowSaveToast(false);
    }, 2500);
  };
"""

content = content.replace("const [isAuthLoading, setIsAuthLoading] = useState(true);", "const [isAuthLoading, setIsAuthLoading] = useState(true);\n" + state_addition)

# 3. Modify updateAppData
old_update = """  const updateAppData = (updater: (prev: AppData) => AppData) => {
    setAppData((prev) => {
      const next = updater(prev);
      saveAppData(next); // Local backup
      if (auth.currentUser) {
        saveAppDataToCloud(next).then(success => {
          if (!success) {
            console.error('Failed to save to cloud sync');
          }
        });
      }
      return next;
    });
  };"""

new_update = """  const updateAppData = (updater: (prev: AppData) => AppData) => {
    setAppData((prev) => {
      const next = updater(prev);
      saveAppData(next); // Local backup
      if (auth.currentUser) {
        saveAppDataToCloud(next).then(success => {
          if (!success) {
            console.error('Failed to save to cloud sync');
          } else {
            triggerSaveToast();
          }
        });
      } else {
        triggerSaveToast();
      }
      return next;
    });
  };"""

content = content.replace(old_update, new_update)

# 4. Add the Toast component at the end
toast_jsx = """
      {/* Auto-save Toast */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900/90 backdrop-blur-sm text-white rounded-xl shadow-lg border border-gray-700/50 pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Auto-saved</span>
          </motion.div>
        )}
      </AnimatePresence>
"""

content = content.replace("{/* Offline Status Toast */}", toast_jsx + "\n      {/* Offline Status Toast */}")

with open('src/App.tsx', 'w') as f:
    f.write(content)
