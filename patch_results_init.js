import fs from 'fs';
let content = fs.readFileSync('src/components/ResultsTab.tsx', 'utf8');

const lines = content.split('\n');
// Find index of isSubjectApproved
const isSubjectApprovedIndex = lines.findIndex(line => line.includes("const isSubjectApproved = activeClass?.students"));
if (isSubjectApprovedIndex !== -1) {
  const line = lines[isSubjectApprovedIndex];
  lines.splice(isSubjectApprovedIndex, 1);
  
  // Find where to insert it: after activeSubject
  const activeSubjectIndex = lines.findIndex(line => line.includes("const activeSubject = availableSubjects.find"));
  lines.splice(activeSubjectIndex + 1, 0, line);
  
  fs.writeFileSync('src/components/ResultsTab.tsx', lines.join('\n'));
  console.log("Patched successfully");
} else {
  console.log("Could not find isSubjectApproved");
}
