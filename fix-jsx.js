const fs = require('fs');
const path = require('path');

// List of files to fix
const filesToFix = [
  'src/app/holidays/page.tsx',
  'src/app/work-groups/page.tsx', 
  'src/app/leave-types/page.tsx'
];

filesToFix.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix common issues
    // Ensure proper closing of JSX fragments and components
    content = content.replace(/\)\s*$/m, ')\n}');
    
    // Write back the file
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('All files processed.');