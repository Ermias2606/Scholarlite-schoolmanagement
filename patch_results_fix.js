import fs from 'fs';
let content = fs.readFileSync('src/components/ResultsTab.tsx', 'utf8');

const oldS = `              <span>Save Marks</span>
            </button>
          )}`;

const newS = `              <span>Save Marks</span>
            </button>
            </>
          )}`;

content = content.replace(oldS, newS);

fs.writeFileSync('src/components/ResultsTab.tsx', content);
