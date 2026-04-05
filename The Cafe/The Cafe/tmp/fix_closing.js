const fs = require('fs');
let s = fs.readFileSync('c:\\Users\\admin\\.antigravity\\cuddly-sniffle\\The Cafe\\The Cafe\\client\\src\\pages\\mui-payroll.tsx', 'utf8');
const before = '          </Paper>\n        )}';
const beforeCr = '          </Paper>\r\n        )}';
s = s.replace(before, '          </Paper>\n          </motion.div>\n        )}');
s = s.replace(beforeCr, '          </Paper>\r\n          </motion.div>\r\n        )}');
fs.writeFileSync('c:\\Users\\admin\\.antigravity\\cuddly-sniffle\\The Cafe\\The Cafe\\client\\src\\pages\\mui-payroll.tsx', s);
console.log("Fixed closing tag");
