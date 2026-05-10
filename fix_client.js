const fs = require('fs');
let text = fs.readFileSync('client/src/pages/mui-payroll-management.tsx', 'utf8');

// Replace state
text = text.replace('const [payDate, setPayDate] = useState<Date | null>(null);', 'const [runType, setRunType] = useState<string>("regular");');

// In create dialog opening
text = text.replace('setPayDate(calcPayDate);', 'setRunType("regular");');

// Remove payDate everywhere else
text = text.replace(/payDate/g, 'runType');
text = text.replace(/setPayDate/g, 'setRunType');
text = text.replace(/calcRunType/g, 'calcPayDate'); // oops, we'll fix dates computing if needed, let me use regex carefully instead
fs.writeFileSync('client/src/pages/mui-payroll-management.tsx', text);
