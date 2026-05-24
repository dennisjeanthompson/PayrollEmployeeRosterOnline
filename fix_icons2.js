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
  
  // Regex to match our wrongly generated imports from the last script
  // e.g. import Warning as WarningIcon from '@mui/icons-material/Warning as WarningIcon';
  const badAliasRegex = /import\s+([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)\s+from\s+['"]@mui\/icons-material\/([^'"]+)['"];/g;
  
  let newContent = content;
  let hasChanges = false;
  
  let match;
  while ((match = badAliasRegex.exec(content)) !== null) {
    hasChanges = true;
    const fullMatch = match[0];
    const originalName = match[1];
    const aliasName = match[2];
    
    let replacement = `import ${aliasName} from '@mui/icons-material/${originalName}';`;
    newContent = newContent.replace(fullMatch, replacement);
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed aliases: ${filePath}`);
    filesModified++;
  }
});

console.log(`Finished fixing. Modified ${filesModified} files.`);
