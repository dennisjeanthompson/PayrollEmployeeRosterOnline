const fs = require('fs');
let text = fs.readFileSync('server/routes.ts', 'utf8');
text = text.replace('deductSSS: skipStatutory ? false : (branchDeductionSettings.deductSSS ?? true),', 'deductSSS: skipStatutory ? false : (branchDeductionSettings.deductSSS ?? true),'); // already done?
text = text.replace('deductSSS: branchDeductionSettings.deductSSS ?? true,', 'deductSSS: skipStatutory ? false : (branchDeductionSettings.deductSSS ?? true),');
text = text.replace('deductPhilHealth: branchDeductionSettings.deductPhilHealth ?? true,', 'deductPhilHealth: skipStatutory ? false : (branchDeductionSettings.deductPhilHealth ?? true),');
text = text.replace('deductPagibig: branchDeductionSettings.deductPagibig ?? true,', 'deductPagibig: skipStatutory ? false : (branchDeductionSettings.deductPagibig ?? true),');
fs.writeFileSync('server/routes.ts', text);
