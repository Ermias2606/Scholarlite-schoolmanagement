import fs from 'fs';
let content = fs.readFileSync('src/components/IdCardBackTemplate.tsx', 'utf8');

const oldTerms = `        <p className="mt-2">
          <strong className="text-gray-900 block mb-0.5 uppercase tracking-wider text-[6px]">Emergency Contact:</strong>
          If found, please return to:<br/>
          <strong>{settings.name}</strong><br/>
          Admin Office<br/>
          Phone: +1 234 567 8900
        </p>`;

const newTerms = `        <p className="mt-2">
          <strong className="text-gray-900 block mb-0.5 uppercase tracking-wider text-[6px]">Guardian Contact:</strong>
          {student.parentName ? (
            <>
              <strong>{student.parentName}</strong><br/>
              Phone: {student.parentContact || 'N/A'}<br/>
            </>
          ) : (
            <>
              Parent/Guardian not listed.<br/>
            </>
          )}
        </p>
        <p className="mt-2">
          <strong className="text-gray-900 block mb-0.5 uppercase tracking-wider text-[6px]">If found, return to:</strong>
          <strong>{settings.name}</strong><br/>
        </p>`;

content = content.replace(oldTerms, newTerms);
fs.writeFileSync('src/components/IdCardBackTemplate.tsx', content);
