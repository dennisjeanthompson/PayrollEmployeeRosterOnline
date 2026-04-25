const fs = require('fs');
const path = require('path');

const clientSrcPath = path.join(__dirname, 'client', 'src');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      filelist.push(filePath);
    }
  });
  return filelist;
};

const files = walkSync(clientSrcPath);

let replacedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('AttachMoney')) {
    console.log(`Modifying: ${file}`);
    
    if (!content.includes('import PesoIcon')) {
      const firstImportIndex = content.indexOf('import ');
      if (firstImportIndex !== -1) {
        content = content.slice(0, firstImportIndex) + 'import PesoIcon from "@/components/PesoIcon";\n' + content.slice(firstImportIndex);
      } else {
        content = 'import PesoIcon from "@/components/PesoIcon";\n' + content;
      }
    }

    content = content.replace(/\bAttachMoney(\s+as\s+[A-Za-z]+)?\b\s*,?\s*/g, '');
    
    content = content.replace(/<MoneyIcon/g, '<PesoIcon');
    content = content.replace(/<\/MoneyIcon>/g, '</PesoIcon>');
    content = content.replace(/\{MoneyIcon\}/g, '{PesoIcon}');
    
    content = content.replace(/<DollarIcon/g, '<PesoIcon');
    content = content.replace(/<\/DollarIcon>/g, '</PesoIcon>');
    content = content.replace(/\{DollarIcon\}/g, '{PesoIcon}');
    
    content = content.replace(/<DollarSign/g, '<PesoIcon');
    content = content.replace(/<\/DollarSign>/g, '</PesoIcon>');
    content = content.replace(/\{DollarSign\}/g, '{PesoIcon}');
    
    content = content.replace(/<AttachMoney/g, '<PesoIcon');
    content = content.replace(/<\/AttachMoney>/g, '</PesoIcon>');
    content = content.replace(/\{AttachMoney\}/g, '{PesoIcon}');
    
    content = content.replace(/\bicon:\s*MoneyIcon\b/g, 'icon: PesoIcon');
    content = content.replace(/\bicon:\s*DollarIcon\b/g, 'icon: PesoIcon');
    content = content.replace(/\bicon:\s*DollarSign\b/g, 'icon: PesoIcon');
    content = content.replace(/\bicon:\s*AttachMoney\b/g, 'icon: PesoIcon');

    content = content.replace(/import\s*{\s*}\s*from\s*['"]@mui\/icons-material['"];\n?/g, '');

    fs.writeFileSync(file, content, 'utf8');
    replacedCount++;
  }
});

console.log(`Replaced in ${replacedCount} files.`);
