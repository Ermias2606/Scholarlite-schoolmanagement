import fs from 'fs';
let content = fs.readFileSync('src/utils/calculations.ts', 'utf8');

const oldDownload = `export function downloadRosterTemplateCSV(): void {
  const content = 'Roll_No,Student_Name,Gender\\n1,Alice Johnson,Female\\n2,David Miller,Male\\n3,Samira Khan,Female';
  downloadCSV('Student_Roster_Template.csv', content);
}`;

const newDownload = `export function downloadRosterTemplateCSV(): void {
  const content = 'Roll_No,Student_Name,Gender,Parent_Name,Parent_Contact\\n1,Alice Johnson,Female,John Johnson,555-0101\\n2,David Miller,Male,Sarah Miller,555-0102\\n3,Samira Khan,Female,Ali Khan,555-0103';
  downloadCSV('Student_Roster_Template.csv', content);
}`;

content = content.replace(oldDownload, newDownload);

const oldParse = `export function parseRosterCSV(csv: string): { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }[] {
  const lines = csv.trim().split(/\\r?\\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other' }[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^"(.*)"$/, '$1'));
    if (parts.length >= 2) {
      const rollNo = parseInt(parts[0], 10);
      const name = parts[1];
      const rawGender = (parts[2] || 'Other').toLowerCase();
      let gender: 'Male' | 'Female' | 'Other' = 'Other';
      if (rawGender.startsWith('m')) gender = 'Male';
      else if (rawGender.startsWith('f')) gender = 'Female';

      if (!isNaN(rollNo) && name) {
        results.push({ rollNo, name, gender });
      }
    }
  }
  return results;
}`;

const newParse = `export function parseRosterCSV(csv: string): { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string }[] {
  const lines = csv.trim().split(/\\r?\\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: { rollNo: number; name: string; gender: 'Male' | 'Female' | 'Other'; parentName?: string; parentContact?: string }[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^"(.*)"$/, '$1'));
    if (parts.length >= 2) {
      const rollNo = parseInt(parts[0], 10);
      const name = parts[1];
      const rawGender = (parts[2] || 'Other').toLowerCase();
      let gender: 'Male' | 'Female' | 'Other' = 'Other';
      if (rawGender.startsWith('m')) gender = 'Male';
      else if (rawGender.startsWith('f')) gender = 'Female';
      const parentName = parts[3] || '';
      const parentContact = parts[4] || '';

      if (!isNaN(rollNo) && name) {
        results.push({ rollNo, name, gender, parentName, parentContact });
      }
    }
  }
  return results;
}`;

content = content.replace(oldParse, newParse);

fs.writeFileSync('src/utils/calculations.ts', content);
