const fs = require('fs');
const f = fs.readFileSync('client/src/pages/schedule-v2.tsx', 'utf8');
const lines = f.split('\n');
lines.forEach((l, i) => {
  if (l.includes('shifts') && l.includes('branch') && l.includes('invalidate')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
  if (l.includes('shifts') && l.includes('branch') && l.includes('refetch')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
