import re

with open('src/components/LandingView.tsx', 'r') as f:
    content = f.read()

# Add framer-motion import
if "import { motion" not in content:
    content = content.replace("import React, { useEffect, useState } from 'react';", "import React, { useEffect, useState } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';")

# Refine visually. 
# We'll replace the main container with motion.div and add AnimatePresence for transitions.

with open('src/components/LandingView.tsx', 'w') as f:
    f.write(content)
