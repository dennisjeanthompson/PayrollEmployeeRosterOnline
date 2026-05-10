const fs = require('fs');
let text = fs.readFileSync('server/routes.ts', 'utf8');
text = text.replace('let payDate: string | null = null;', 'let runType: string | null = null;');
text = text.replace(`payDate = period.payDate
            ? (period.payDate instanceof Date ? period.payDate.toISOString() : String(period.payDate))
            : null;`, `runType = period.runType || null;`);
text = text.replace('payDate,', 'runType,');
text = text.replace(/payDate/g, 'runType');
fs.writeFileSync('server/routes.ts', text);
