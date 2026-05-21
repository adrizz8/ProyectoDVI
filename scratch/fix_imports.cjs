const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname, '..');
const SRC_DIR = path.join(WORKSPACE, 'src');

// Recursive helper to get all JS files in src/
function getAllJsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allJsFiles = getAllJsFiles(SRC_DIR);
console.log(`Found ${allJsFiles.length} JS files to check.`);

// Map of basenames to their new absolute paths
const fileBasenameMap = {};
allJsFiles.forEach(filePath => {
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext); // e.g. "dialogueManager"
  
  if (!fileBasenameMap[base]) {
    fileBasenameMap[base] = [];
  }
  fileBasenameMap[base].push(filePath);
});

// Helper to normalize drive letters to lowercase in Windows paths
function normalizePath(p) {
  const norm = path.normalize(p);
  if (process.platform === 'win32' && norm.match(/^[a-zA-Z]:/)) {
    return norm[0].toLowerCase() + norm.slice(1);
  }
  return norm;
}

let fixedCount = 0;

allJsFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /(import\s+(?:[\w*\s{},]*\s+from\s+)?['"])([^'"]+)(['"])/g;
  const exportRegex = /(export\s+(?:[\w*\s{},]*\s+from\s+)?['"])([^'"]+)(['"])/g;
  
  let modified = false;
  
  function processImport(match, prefix, importPath, suffix) {
    if (!importPath.startsWith('.')) {
      return match; // external library
    }
    
    // Resolve old absolute path
    const fileDir = path.dirname(filePath);
    let resolvedAbs = path.resolve(fileDir, importPath);
    
    // Check if it exists exactly or with .js
    let exists = fs.existsSync(resolvedAbs) && fs.statSync(resolvedAbs).isFile();
    if (!exists) {
      if (fs.existsSync(resolvedAbs + '.js')) {
        resolvedAbs = resolvedAbs + '.js';
        exists = true;
      }
    }
    
    if (exists) {
      // It exists, but let's make sure the extension is explicitly .js if it is a JS file
      // to avoid resolution issues in Vite/ESModules
      if (resolvedAbs.endsWith('.js') && !importPath.endsWith('.js')) {
        let newRel = importPath + '.js';
        modified = true;
        return `${prefix}${newRel}${suffix}`;
      }
      return match; // all good
    }
    
    // If it doesn't exist, it's a broken import! Let's heal it.
    const importExt = path.extname(importPath);
    const importBase = path.basename(importPath, importExt); // e.g. "dialogueManager"
    
    const candidates = fileBasenameMap[importBase] || [];
    if (candidates.length === 1) {
      const targetAbs = candidates[0];
      let newRel = path.relative(fileDir, targetAbs);
      newRel = newRel.replace(/\\/g, '/');
      if (!newRel.startsWith('.')) {
        newRel = './' + newRel;
      }
      
      console.log(`Healing broken import in ${path.relative(WORKSPACE, filePath)}: "${importPath}" -> "${newRel}"`);
      modified = true;
      fixedCount++;
      return `${prefix}${newRel}${suffix}`;
    } else if (candidates.length > 1) {
      console.warn(`Ambiguous broken import in ${path.relative(WORKSPACE, filePath)}: "${importPath}". Multiple files found with base "${importBase}":`, candidates.map(c => path.relative(WORKSPACE, c)));
    } else {
      console.warn(`Could not find any file for broken import in ${path.relative(WORKSPACE, filePath)}: "${importPath}"`);
    }
    
    return match;
  }
  
  content = content.replace(importRegex, processImport);
  content = content.replace(exportRegex, processImport);
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log(`Self-healing complete. Fixed ${fixedCount} imports.`);
