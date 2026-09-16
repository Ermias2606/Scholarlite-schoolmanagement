import fs from 'fs';
let content = fs.readFileSync('src/index.css', 'utf8');

if (!content.includes('.print-page-break')) {
  content = content.replace(
    /(\.printable-report-card tr)/,
    ".print-page-break {\n    page-break-after: always !important;\n    break-after: page !important;\n  }\n\n  $1"
  );
  fs.writeFileSync('src/index.css', content);
}
