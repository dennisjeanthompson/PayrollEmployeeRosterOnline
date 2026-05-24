import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = path.join(process.cwd(), 'client/src');
let filesModified = 0;

walkDir(targetDir, (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to match: import { Icon1, Icon2 } from "@mui/icons-material";
  // Allows multiline imports
  const regex = /import\s+{([^}]+)}\s+from\s+['"]@mui\/icons-material['"];/g;
  
  let newContent = content;
  let hasChanges = false;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    hasChanges = true;
    const fullMatch = match[0];
    const icons = match[1].split(',').map(i => i.trim()).filter(i => i);
    
    let replacement = '';
    for (const icon of icons) {
      replacement += `import ${icon} from '@mui/icons-material/${icon}';\n`;
    }
    
    newContent = newContent.replace(fullMatch, replacement.trim());
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
    filesModified++;
  }
});

console.log(`Finished. Modified ${filesModified} files.`);
