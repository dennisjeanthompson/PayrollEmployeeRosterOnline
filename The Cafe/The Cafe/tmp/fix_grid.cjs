const fs = require('fs');
const filePath = 'c:\\Users\\admin\\.antigravity\\cuddly-sniffle\\The Cafe\\The Cafe\\client\\src\\pages\\mui-payroll.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Remove the extra </Grid> closing tag (line 266)
// The pattern is: ))}  \r\n  </Grid>\r\n  </Grid>
// We need to make it: ))}  \r\n  </Grid>
const extraGridPattern = /(\)\)\})\r?\n\s*<\/Grid>\r?\n(\s*<\/Grid>)/;
const match = content.match(extraGridPattern);
if (match) {
  content = content.replace(extraGridPattern, '$1\r\n$2');
  console.log('Fixed: Removed extra </Grid> closing tag');
} else {
  console.log('Pattern not found for extra Grid fix');
  // Try to find similar
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '))}' && i + 1 < lines.length && lines[i+1].trim() === '</Grid>' && i + 2 < lines.length && lines[i+2].trim() === '</Grid>') {
      console.log(`Found at line ${i+1}: removing line ${i+2}`);
      lines.splice(i+1, 1);
      content = lines.join('\n');
      console.log('Fixed via line splice');
      break;
    }
  }
}

fs.writeFileSync(filePath, content);
console.log('Done');
