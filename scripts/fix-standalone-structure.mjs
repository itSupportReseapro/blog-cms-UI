import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const standaloneRoot = path.join(__dirname, '..', '.next', 'standalone');
const projectPath = path.join(standaloneRoot, 'projects', 'gugu', 'blog-cms');

// Check if the nested project folder exists
if (fs.existsSync(projectPath)) {
  console.log('Fixing standalone structure...');
  
  // Get all items in the nested project folder
  const items = fs.readdirSync(projectPath);
  
  // Move each item to the standalone root
  items.forEach((item) => {
    const sourcePath = path.join(projectPath, item);
    const destPath = path.join(standaloneRoot, item);
    
    // Remove destination if it exists (to handle overwrites)
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    
    // Move the item
    fs.renameSync(sourcePath, destPath);
    console.log(`  Moved ${item} to standalone root`);
  });
  
  // Remove the nested projects folder
  fs.rmSync(path.join(standaloneRoot, 'projects'), { recursive: true, force: true });
  console.log('✓ Standalone structure fixed!');
} else {
  console.log('✓ Standalone structure is already correct');
}
