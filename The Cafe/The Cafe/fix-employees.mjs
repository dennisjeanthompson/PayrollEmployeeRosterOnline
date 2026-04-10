import fs from 'fs';

const filePath = './client/src/pages/mui-employees.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix the refetchEmployees/refetchStats calls to use startTransition
content = content.replace(
  /(\s+)refetchEmployees\(\);\s*\n\s+refetchStats\(\);/,
  '$1startTransition(() => {\n$1  refetchEmployees();\n$1  refetchStats();\n$1});'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed!');
