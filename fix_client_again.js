const fs = require('fs');
let text = fs.readFileSync('client/src/pages/mui-payroll-management.tsx', 'utf8');

text = text.replace(/payDate: string/g, 'runType: string');
text = text.replace(/const \[payDate, setPayDate\] = useState<Date \| null>\(null\);/g, 'const [runType, setRunType] = useState<string>("regular");');
text = text.replace(/payDate: format\(payDate, "yyyy-MM-dd"\)/g, 'runType');
text = text.replace(/!startDate \|\| !endDate \|\| !payDate/g, '!startDate || !endDate');
// Just do a simple runType change in the select box later. Let me rewrite the JSX.
fs.writeFileSync('client/src/pages/mui-payroll-management.tsx', text);
