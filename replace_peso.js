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
    
    // Add import statement for PesoIcon if not present
    if (!content.includes('import PesoIcon')) {
      // Find the first import
      const firstImportIndex = content.indexOf('import ');
      if (firstImportIndex !== -1) {
        content = content.slice(0, firstImportIndex) + 'import PesoIcon from "@/components/PesoIcon";\n' + content.slice(firstImportIndex);
      } else {
        content = 'import PesoIcon from "@/components/PesoIcon";\n' + content;
      }
    }

    // Handle imports like `AttachMoney as MoneyIcon` or just `AttachMoney`
    // We will remove AttachMoney from @mui/icons-material
    content = content.replace(/\bAttachMoney(\s+as\s+[A-Za-z]+)?\b\s*,?\s*/g, '');
    
    // Replace all usages of the alias with PesoIcon
    // First, find what alias was used in this file for AttachMoney
    let replacedUsage = false;
    
    // Now just globally replace MoneyIcon, DollarIcon, DollarSign, AttachMoney with PesoIcon
    // We only do this if we knew AttachMoney was imported here
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
    
    // Also handle variable assignments like `icon: MoneyIcon` -> `icon: PesoIcon`
    content = content.replace(/\bicon:\s*MoneyIcon\b/g, 'icon: PesoIcon');
    content = content.replace(/\bicon:\s*DollarIcon\b/g, 'icon: PesoIcon');
    content = content.replace(/\bicon:\s*DollarSign\b/g, 'icon: PesoIcon');
    content = content.replace(/\bicon:\s*AttachMoney\b/g, 'icon: PesoIcon');

    // Clean up empty imports from @mui/icons-material
    content = content.replace(/import\s*{\s*}\s*from\s*['"]@mui\/icons-material['"];/g, '');

    fs.writeFileSync(file, content, 'utf8');
    replacedCount++;
  }
});

console.log(`Replaced in ${replacedCount} files.`);
