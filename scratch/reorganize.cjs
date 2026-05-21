const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname, '..');
const SRC_DIR = path.join(WORKSPACE, 'src');

// Recursive helper to get all files in a directory
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// 1. Gather all files in src
const allSrcFiles = getAllFiles(SRC_DIR);
console.log(`Found ${allSrcFiles.length} files in src/`);

const pathMap = {};
const moves = [];

// Determine destination for each file
allSrcFiles.forEach(fileOldPath => {
  const relPath = path.relative(SRC_DIR, fileOldPath).replace(/\\/g, '/');
  let fileNewPath = null;
  
  if (relPath === 'game.js' || relPath === 'boot.js') {
    // Keep boot.js and game.js in the root of src/
    fileNewPath = fileOldPath;
  } else if (relPath === 'bus_anim.png') {
    // This is a duplicate since it already exists in assets/sprites/bus_anim.png
    console.log(`Duplicate found: src/bus_anim.png. Will be deleted.`);
    fileNewPath = 'DELETE';
  } else if (!relPath.includes('/')) {
    // Files directly in src/
    if (relPath === 'config.js' || relPath === 'game_congif.js' || relPath === 'manager.js' || relPath === 'dialogueManager.js' || relPath === 'eventManager.js') {
      fileNewPath = path.join(SRC_DIR, 'core', relPath);
    } else if (relPath === 'TitleScene.js' || relPath === 'IntroScene.js' || relPath === 'GameOverScene.js' || relPath === 'GameScene.js' || relPath === 'prematricula_scene.js' || relPath === 'end.js' || relPath === 'title.js') {
      fileNewPath = path.join(SRC_DIR, 'scenes', 'core', relPath);
    } else if (relPath === 'Cafeteria.js' || relPath === 'MapaFuera.js' || relPath === 'Parada.js' || relPath === 'Pasillo.js' || relPath === 'level3.js') {
      fileNewPath = path.join(SRC_DIR, 'scenes', 'maps', relPath);
    } else if (relPath === 'bombilla.js' || relPath === 'bus.js' || relPath === 'toy.js' || relPath === 'trigger.js') {
      fileNewPath = path.join(SRC_DIR, 'objects', relPath);
    } else {
      // Default fallback just in case
      fileNewPath = path.join(SRC_DIR, 'core', relPath);
    }
  } else {
    // Files inside subfolders
    const parts = relPath.split('/');
    const firstFolder = parts[0];
    const rest = parts.slice(1).join('/');
    
    if (firstFolder === 'battleScene' || firstFolder === 'encounters') {
      fileNewPath = path.join(SRC_DIR, 'battle', rest);
    } else if (firstFolder === 'gates') {
      fileNewPath = path.join(SRC_DIR, 'puzzles', rest);
    } else if (firstFolder === 'item') {
      fileNewPath = path.join(SRC_DIR, 'items', rest);
    } else if (firstFolder === 'mazmorras') {
      fileNewPath = path.join(SRC_DIR, 'scenes', 'dungeons', rest);
    } else if (firstFolder === 'menuScenes') {
      fileNewPath = path.join(SRC_DIR, 'scenes', 'menus', rest);
    } else if (firstFolder === 'personajes') {
      if (rest === 'player.js') {
        fileNewPath = path.join(SRC_DIR, 'entities', 'player', rest);
      } else {
        fileNewPath = path.join(SRC_DIR, 'entities', 'npcs', rest);
      }
    } else {
      // If there is any other folder, keep it as is
      fileNewPath = fileOldPath;
    }
  }

  if (fileNewPath && fileNewPath !== 'DELETE') {
    pathMap[path.normalize(fileOldPath)] = path.normalize(fileNewPath);
    moves.push({ from: fileOldPath, to: fileNewPath });
  } else if (fileNewPath === 'DELETE') {
    moves.push({ from: fileOldPath, to: 'DELETE' });
  }
});

// Helper function to resolve imports
function getNewImportPath(fileOldPath, fileNewPath, importPath, pathMap) {
  if (!importPath.startsWith('.')) {
    return importPath; // External library
  }
  
  const oldDir = path.dirname(fileOldPath);
  let oldTargetAbs = path.resolve(oldDir, importPath);
  
  // Try resolving with .js or other extensions if needed (usually it is already absolute enough)
  let normOldTargetAbs = path.normalize(oldTargetAbs);
  let newTargetAbs = pathMap[normOldTargetAbs];
  
  if (!newTargetAbs) {
    // If it ends without .js, try appending it
    if (!oldTargetAbs.endsWith('.js') && fs.existsSync(oldTargetAbs + '.js')) {
      normOldTargetAbs = path.normalize(oldTargetAbs + '.js');
      newTargetAbs = pathMap[normOldTargetAbs];
    }
  }
  
  if (!newTargetAbs) {
    // If the imported file was not moved (or it is an asset we didn't track), 
    // calculate relative path from the new file directory to the old asset location
    const newDir = path.dirname(fileNewPath);
    let rel = path.relative(newDir, normOldTargetAbs);
    rel = rel.replace(/\\/g, '/');
    if (!rel.startsWith('.')) {
      rel = './' + rel;
    }
    return rel;
  }
  
  const newDir = path.dirname(fileNewPath);
  let rel = path.relative(newDir, newTargetAbs);
  rel = rel.replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  return rel;
}

// 2. Perform moves
console.log('Moving files...');
moves.forEach(m => {
  if (m.to === 'DELETE') {
    console.log(`Deleting duplicate: ${m.from}`);
    if (fs.existsSync(m.from)) {
      fs.unlinkSync(m.from);
    }
  } else if (m.from !== m.to) {
    const destDir = path.dirname(m.to);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    console.log(`Moving: ${path.relative(WORKSPACE, m.from)} -> ${path.relative(WORKSPACE, m.to)}`);
    fs.renameSync(m.from, m.to);
  }
});

// Helper to update imports in a single file
function updateFileImports(filePath, fileOldPath, pathMap) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const importRegex = /(import\s+(?:[\w*\s{},]*\s+from\s+)?['"])([^'"]+)(['"])/g;
  const exportRegex = /(export\s+(?:[\w*\s{},]*\s+from\s+)?['"])([^'"]+)(['"])/g;
  
  let modified = false;
  
  content = content.replace(importRegex, (match, prefix, importPath, suffix) => {
    const newImportPath = getNewImportPath(fileOldPath, filePath, importPath, pathMap);
    if (newImportPath !== importPath) {
      modified = true;
      return `${prefix}${newImportPath}${suffix}`;
    }
    return match;
  });
  
  content = content.replace(exportRegex, (match, prefix, importPath, suffix) => {
    const newImportPath = getNewImportPath(fileOldPath, filePath, importPath, pathMap);
    if (newImportPath !== importPath) {
      modified = true;
      return `${prefix}${newImportPath}${suffix}`;
    }
    return match;
  });
  
  if (modified) {
    console.log(`Updated imports in: ${path.relative(WORKSPACE, filePath)}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// 3. Update imports in all moved JS files (and non-moved like game.js/boot.js)
console.log('Updating imports...');
moves.forEach(m => {
  if (m.to !== 'DELETE' && m.to.endsWith('.js')) {
    updateFileImports(m.to, m.from, pathMap);
  }
});

// 4. Delete old empty subfolders in src
console.log('Cleaning up empty folders...');
const oldFolders = [
  'battleScene',
  'encounters',
  'gates',
  'item',
  'mazmorras',
  'menuScenes',
  'personajes'
];

oldFolders.forEach(folder => {
  const folderPath = path.join(SRC_DIR, folder);
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);
    if (files.length === 0) {
      console.log(`Removing empty folder: src/${folder}`);
      fs.rmdirSync(folderPath);
    } else {
      console.log(`Folder src/${folder} is not empty, keeping it. Contents:`, files);
    }
  }
});

console.log('Reorganization complete!');
