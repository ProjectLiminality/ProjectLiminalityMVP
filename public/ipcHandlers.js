const { dialog, shell, app, ipcMain } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { exec, execSync } = require('child_process');
const { metadataTemplate, getDefaultValue } = require('../src/utils/metadataTemplate.js');
const metadataUtils = require('../src/utils/metadataUtils.js');
const { readMetadata, writeMetadata, updateBidirectionalRelationships } = metadataUtils;
const { createEmailDraft } = require('../src/utils/emailUtils.js');
const Store = require('electron-store');

function setupHandlers(ipcMain) {
  ipcMain.handle('open-file', async (event, repoName, fileName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }
    const filePath = path.join(dreamVaultPath, repoName, fileName);
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      console.error(`Error opening file ${filePath}:`, error);
      return { success: false, error: error.message };
    }
  });
  const store = new Store();
  ipcMain.handle('get-person-nodes', async () => {
    try {
      const dreamVaultPath = store.get('dreamVaultPath', '');
      if (!dreamVaultPath) {
        throw new Error('Dream Vault path not set');
      }

      const repos = await fs.readdir(dreamVaultPath);
      const personNodes = [];

      for (const repo of repos) {
        const metadataPath = path.join(dreamVaultPath, repo, '.pl');
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          if (metadata.type === 'person') {
            personNodes.push({ name: repo, email: metadata.email });
          }
        } catch (error) {
          // Ignore errors for repos without metadata
        }
      }

      return personNodes;
    } catch (error) {
      console.error('Error getting person nodes:', error);
      return [];
    }
  });

  ipcMain.handle('create-email-draft', async (event, repoName, personName) => {
    try {
      const dreamVaultPath = store.get('dreamVaultPath', '');
      if (!dreamVaultPath) {
        throw new Error('Dream Vault path not set');
      }

      const personMetadataPath = path.join(dreamVaultPath, personName, '.pl');
      const personMetadata = JSON.parse(await fs.readFile(personMetadataPath, 'utf8'));
      const recipientEmail = personMetadata.email;

      if (!recipientEmail) {
        return { success: false, message: 'No email address found for the selected person' };
      }

      // Create the bundle
      const repoPath = path.join(dreamVaultPath, repoName);
      const bundlePath = path.join(repoPath, `${repoName}.bundle`);

      try {
        // First, ensure all submodules are initialized and updated
        await execAsync('git submodule update --init --recursive', { cwd: repoPath });
        
        // Create the bundle with all branches and tags, including submodules
        await execAsync(`git bundle create "${bundlePath}" --all --recurse-submodules=on-demand`, { cwd: repoPath });
      } catch (error) {
        console.error(`Error creating bundle for ${repoName}:`, error);
        throw error;
      }

      const subject = `Updates to ${repoName}`;
      const body = `Hello ${personName},

I've made updates to the "${repoName}" repository. Please review these changes when you have a moment.
I've attached a bundle of the repository for your convenience.

Best regards,
[Your Name]`;

      await createEmailDraft([recipientEmail], subject, body, bundlePath);
      return { success: true, message: 'Email draft created successfully with bundle attached' };
    } catch (error) {
      console.error('Error creating email draft:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('read-file', async (event, filePath) => {
    if (!filePath) {
      console.error('Error: filePath is null or undefined');
      return null;
    }
    try {
      const data = await fs.readFile(filePath);
      return data.toString('base64');
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      console.error('Error reading file:', filePath, error);
      return null;
    }
  });

  ipcMain.handle('open-in-finder', async (event, repoName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }
    const repoPath = path.join(dreamVaultPath, repoName);
    await shell.openPath(repoPath);
  });

  ipcMain.handle('open-in-gitfox', async (event, repoName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }
    const repoPath = path.join(dreamVaultPath, repoName);
    return new Promise((resolve, reject) => {
      exec(`cd "${dreamVaultPath}" && gitfox "${repoName}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error opening GitFox: ${error}`);
          reject(error);
        } else {
          console.log(`GitFox opened for ${repoName}`);
          resolve();
        }
      });
    });
  });
  ipcMain.handle('open-directory-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return result.filePaths[0];
  });

  ipcMain.handle('get-dream-vault-path', () => {
    return store.get('dreamVaultPath', '');
  });

  ipcMain.handle('set-dream-vault-path', (event, path) => {
    store.set('dreamVaultPath', path);
  });

  ipcMain.handle('scan-dream-vault', async () => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      return [];
    }

    try {
      const entries = await fs.readdir(dreamVaultPath, { withFileTypes: true });
      const gitRepos = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const repoPath = path.join(dreamVaultPath, entry.name);
          const gitDir = path.join(repoPath, '.git');
          try {
            await fs.access(gitDir);
            gitRepos.push(entry.name);
          } catch (error) {
            // Not a git repository, skip
          }
        }
      }

      return gitRepos;
    } catch (error) {
      console.error('Error scanning DreamVault:', error);
      return [];
    }
  });

  ipcMain.handle('read-metadata', async (event, repoName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    try {
      let metadata = await readMetadata(dreamVaultPath, repoName);

      // Ensure all template fields are present
      for (const [key, defaultValue] of Object.entries(metadataTemplate)) {
        if (!(key in metadata)) {
          metadata[key] = defaultValue;
        }
      }

      // Write back the updated metadata
      await writeMetadata(dreamVaultPath, repoName, metadata);

      return metadata;
    } catch (error) {
      console.error(`Error reading metadata for ${repoName}:`, error);
      throw error;
    }
  });

  ipcMain.handle('write-metadata', async (event, repoName, newMetadata) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    try {
      // Read the existing metadata
      const oldMetadata = await metadataUtils.readMetadata(dreamVaultPath, repoName);

      // Update bidirectional relationships
      await metadataUtils.updateBidirectionalRelationships(dreamVaultPath, repoName, oldMetadata, newMetadata);

      // Write the new metadata
      await metadataUtils.writeMetadata(dreamVaultPath, repoName, newMetadata);
      return true;
    } catch (error) {
      console.error(`Error writing metadata for ${repoName}:`, error);
      throw error;
    }
  });

  ipcMain.handle('get-media-file-path', async (event, repoName) => {
    const dreamVaultPath = store.get('dreamVaultPath');
    const repoPath = path.join(dreamVaultPath, repoName);
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.wav', '.ogg'];
    
    try {
      for (const ext of supportedExtensions) {
        const filePath = path.join(repoPath, `${repoName}${ext}`);
        try {
          await fs.access(filePath);
          return filePath;
        } catch (error) {
          // File doesn't exist, continue to next extension
        }
      }
      
      console.log(`No matching media file found for ${repoName}`);
      return null;
    } catch (error) {
      console.error(`Error searching for media file for ${repoName}:`, error);
      return null;
    }
  });

  ipcMain.handle('get-dreamsong-media-file-path', async (event, repoName, fileName) => {
    const dreamVaultPath = store.get('dreamVaultPath');
    const repoPath = path.join(dreamVaultPath, repoName);
    const filePath = path.join(repoPath, fileName);
    
    try {
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      console.error(`Error accessing DreamSong media file ${fileName} for ${repoName}:`, error);
      return null;
    }
  });

  ipcMain.handle('get-file-stats', async (event, filePath) => {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        mtime: stats.mtime
      };
    } catch (error) {
      console.error(`Error getting file stats for ${filePath}:`, error);
      return null;
    }
  });

  ipcMain.handle('list-files', async (event, repoName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const repoPath = path.join(dreamVaultPath, repoName);
    try {
      const files = await fs.readdir(repoPath);
      return files;
    } catch (error) {
      console.error(`Error listing files for ${repoName}:`, error);
      throw error;
    }
  });

  ipcMain.handle('rename-repo', async (event, oldName, newName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const oldPath = path.join(dreamVaultPath, oldName);
    const newPath = path.join(dreamVaultPath, newName);

    try {
      await fs.rename(oldPath, newPath);
      console.log(`Successfully renamed repo from ${oldName} to ${newName}`);
      return true;
    } catch (error) {
      console.error(`Error renaming repo from ${oldName} to ${newName}:`, error);
      throw error;
    }
  });

  ipcMain.handle('create-new-node', async (event, nodeName) => {
    if (!nodeName) {
      throw new Error('Node name is required');
    }

    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const templatePath = path.join(dreamVaultPath, 'DreamNode');
    const newNodePath = path.join(dreamVaultPath, nodeName);

    try {
      // Check if template exists
      await fs.access(templatePath);

      // Check if a node with the same name already exists
      try {
        await fs.access(newNodePath);
        throw new Error(`A node with the name "${nodeName}" already exists`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Clone the template repository
      const { execSync } = require('child_process');
      execSync(`git clone "${templatePath}" "${newNodePath}"`, { stdio: 'inherit' });

      // Remove the origin remote to disconnect from the template
      execSync('git remote remove origin', { cwd: newNodePath });

      console.log(`Successfully created new node: ${nodeName}`);
      return nodeName;
    } catch (error) {
      console.error('Error creating new node:', error);
      throw error;
    }
  });

  ipcMain.handle('add-file-to-node', async (event, nodeName, fileData) => {
    if (!nodeName || !fileData) {
      throw new Error('Both nodeName and fileData are required');
    }

    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const nodePath = path.join(dreamVaultPath, nodeName);
    const filePath = path.join(nodePath, fileData.name);

    try {
      // Check if the node exists
      await fs.access(nodePath);

      // Write the file to the node directory
      await fs.writeFile(filePath, Buffer.from(fileData.data));

      console.log(`Successfully added file ${fileData.name} to node ${nodeName}`);
      return true;
    } catch (error) {
      console.error(`Error adding file to node ${nodeName}:`, error);
      throw error;
    }
  });

  ipcMain.handle('stage-file', async (event, nodeName, fileName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const nodePath = path.join(dreamVaultPath, nodeName);

    try {
      const { execSync } = require('child_process');
      execSync(`git add "${fileName}"`, { cwd: nodePath });
      console.log(`Successfully staged file ${fileName} in node ${nodeName}`);
      return true;
    } catch (error) {
      console.error(`Error staging file ${fileName} in node ${nodeName}:`, error);
      throw error;
    }
  });

  ipcMain.handle('commit-changes', async (event, nodeName, commitMessage) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const nodePath = path.join(dreamVaultPath, nodeName);

    try {
      const { execSync } = require('child_process');
      execSync(`git commit -m "${commitMessage}"`, { cwd: nodePath });
      console.log(`Successfully committed changes in node ${nodeName}`);
      return true;
    } catch (error) {
      console.error(`Error committing changes in node ${nodeName}:`, error);
      throw error;
    }
  });

  ipcMain.handle('get-all-repo-names-and-types', async () => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    try {
      const entries = await fs.readdir(dreamVaultPath, { withFileTypes: true });
      const gitRepos = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const repoPath = path.join(dreamVaultPath, entry.name);
          const gitDir = path.join(repoPath, '.git');
          const metadataPath = path.join(repoPath, '.pl');
          try {
            await fs.access(gitDir);
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            gitRepos.push({ name: entry.name, type: metadata.type });
          } catch (error) {
            // Not a git repository or metadata not found, skip
          }
        }
      }

      return gitRepos;
    } catch (error) {
      console.error('Error getting all repo names and types:', error);
      throw error;
    }
  });

  ipcMain.handle('add-submodule', async (event, parentRepoName, submoduleRepoName) => {
    console.log(`Received request to add submodule ${submoduleRepoName} to ${parentRepoName}`);
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const parentRepoPath = path.join(dreamVaultPath, parentRepoName);
    const submoduleRepoPath = path.join(dreamVaultPath, submoduleRepoName);

    console.log(`Parent repo path: ${parentRepoPath}`);
    console.log(`Submodule repo path: ${submoduleRepoPath}`);

    try {
      console.log(`Checking if parent repo exists: ${parentRepoPath}`);
      await fs.access(parentRepoPath);
      console.log('Parent repo exists');

      console.log(`Checking if submodule repo exists: ${submoduleRepoPath}`);
      await fs.access(submoduleRepoPath);
      console.log('Submodule repo exists');

      // Ensure submodule is a git repository
      await fs.access(path.join(submoduleRepoPath, '.git'));
      console.log('Submodule is a valid git repository');

      // Add the submodule using a relative path
      console.log('Adding submodule...');
      await execAsync(`git submodule add --force "../${submoduleRepoName}" "${submoduleRepoName}"`, { cwd: parentRepoPath });

      // Initialize and update the submodule
      console.log('Initializing and updating submodule...');
      await execAsync('git submodule update --init --recursive', { cwd: parentRepoPath });

      // Commit the changes
      console.log('Committing changes...');
      await execAsync('git add .', { cwd: parentRepoPath });
      await execAsync(`git commit -m "Add submodule ${submoduleRepoName}"`, { cwd: parentRepoPath });

      console.log(`Successfully added submodule ${submoduleRepoName} to ${parentRepoName}`);
      return true;
    } catch (error) {
      console.error(`Error adding submodule ${submoduleRepoName} to ${parentRepoName}:`, error);
      console.error('Error details:', error.message);
      if (error.stderr) {
        console.error('Error stderr:', error.stderr);
      }
      if (error.stdout) {
        console.error('Error stdout:', error.stdout);
      }
      throw new Error(`Failed to add submodule: ${error.message}\nStderr: ${error.stderr || 'N/A'}\nStdout: ${error.stdout || 'N/A'}`);
    }
  });

  ipcMain.handle('update-submodules', async (event, repoName) => {
    console.log(`Received request to update submodules for ${repoName}`);
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const repoPath = path.join(dreamVaultPath, repoName);

    try {
      const { parseGitModules, getDreamSongDependencies, computePositiveDelta, identifyFriendsToNotify } = require('../src/utils/coherence_beacon_utils.js');

      // Parse current .gitmodules file
      const currentSubmodules = await parseGitModules(repoName);

      // Get dependencies from DreamSong.canvas
      const dreamSongDependencies = await getDreamSongDependencies(repoName);

      // Compute positive delta
      const newSubmodules = computePositiveDelta(currentSubmodules, dreamSongDependencies);

      if (newSubmodules.length === 0) {
        console.log(`No new submodules to add for ${repoName}`);
        return {
          message: "Everything is up to date",
          currentSubmodules,
          dreamSongDependencies,
          newSubmodules: []
        };
      }

      // Add new submodules
      for (const submodule of newSubmodules) {
        await execAsync(`git submodule add --force "../${submodule}" "${submodule}"`, { cwd: repoPath });
      }

      // Update DreamSong.canvas file
      await updateDreamSongCanvas(repoName, dreamSongDependencies);

      // Update metadata with novel submodules
      await updateMetadataWithNovelSubmodules(repoName, newSubmodules);

      // Stage all changes
      await execAsync('git add .', { cwd: repoPath });

      // Commit all changes
      try {
        await execAsync('git commit -m "Update submodules and DreamSong.canvas"', { cwd: repoPath });
        console.log(`Successfully committed changes for ${repoName}`);
      } catch (commitError) {
        // Ignore the commit error and continue
        console.log(`No changes to commit or commit failed for ${repoName}`);
      }

      console.log(`Successfully updated submodules for ${repoName}`);

      return {
        message: "Submodules updated successfully",
        currentSubmodules,
        dreamSongDependencies,
        newSubmodules
      };
    } catch (error) {
      console.error(`Error updating submodules for ${repoName}:`, error);
      throw error;
    }
  });

  ipcMain.handle('trigger-coherence-beacon', async (event, repoName) => {
    console.log(`Received request to trigger Coherence Beacon for ${repoName}`);
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    try {
      const metadata = await readMetadata(dreamVaultPath, repoName);
      const novelSubmodules = metadata.novelSubmodules || [];

      if (novelSubmodules.length === 0) {
        console.log("No novel submodules to notify about at this time.");
        return {
          message: "No novel submodules to notify about at this time.",
          novelSubmodules: []
        };
      }

      console.log(`Novel submodules:`, novelSubmodules);

      const { parseGitModules, getDreamSongDependencies, computePositiveDelta, identifyFriendsToNotify } = require('../src/utils/coherence_beacon_utils.js');
      const friendsToNotify = await identifyFriendsToNotify(novelSubmodules);
      console.log(`Friends to notify:`, friendsToNotify);

      // Group friends by common submodules
      const groupedFriends = groupFriendsBySubmodules(friendsToNotify);
      console.log(`Grouped friends:`, groupedFriends);

      // Create bundle for the parent repository
      const parentBundlePath = await createBundle(repoName);
      console.log(`Created parent bundle: ${parentBundlePath}`);

      // Create bundles for all novel submodules
      const novelSubmoduleBundlePaths = await Promise.all(
        novelSubmodules.map(submodule => createBundle(submodule))
      );
      console.log(`Created novel submodule bundles:`, novelSubmoduleBundlePaths);

      for (const [submodules, friends] of Object.entries(groupedFriends)) {
        const commonSubmodules = submodules.split(',');
        const recipients = friends.map(friend => friend.email);
        const subject = `Updates to ${repoName}${submodules ? ` and related submodules` : ''}`;
        let body = `Hello,\n\nThere are updates to ${repoName}`;

        // Create zip archive with parent and novel submodule bundles
        const attachmentPath = await createZipArchive(parentBundlePath, novelSubmoduleBundlePaths, commonSubmodules);
        console.log(`Created zip archive: ${attachmentPath}`);

        const novelSubmoduleNames = novelSubmodules.filter(submodule => !commonSubmodules.includes(submodule));
        if (novelSubmoduleNames.length > 0) {
          body += ` and the following new submodules: ${novelSubmoduleNames.join(', ')}.\nPlease find the attached zip archive containing the necessary bundles.`;
        } else {
          body += `.\nPlease find the attached bundle for the repository.`;
        }

        body += `\n\nBest regards,\n[Your Name]`;
        
        // Create email draft for the group
        await createEmailDraft(recipients, subject, body, attachmentPath);
        console.log(`Created email draft for recipients:`, recipients);
      }

      // After successfully sending out the information, clear the novelSubmodules list
      metadata.novelSubmodules = [];
      await writeMetadata(dreamVaultPath, repoName, metadata);

      return {
        message: "Coherence Beacon triggered successfully",
        friendsNotified: friendsToNotify
      };
    } catch (error) {
      console.error(`Error triggering Coherence Beacon for ${repoName}:`, error);
      throw error;
    }
  });

  function groupFriendsBySubmodules(friends) {
    const groups = {};
    for (const friend of friends) {
      const key = friend.commonSubmodules.sort().join(',');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(friend);
    }
    return groups;
  }

  async function createBundle(repoName) {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    const repoPath = path.join(dreamVaultPath, repoName);
    const tempDir = os.tmpdir();
    const bundlePath = path.join(tempDir, `${repoName}.bundle`);

    try {
      // Ensure all submodules are initialized and updated
      await execAsync('git submodule update --init --recursive', { cwd: repoPath });
    
      // Create the bundle with all branches and tags
      await execAsync(`git bundle create "${bundlePath}" --all`, { cwd: repoPath });

      console.log(`Created bundle for ${repoName} at ${bundlePath}`);
      return bundlePath;
    } catch (error) {
      console.error(`Error creating bundle for ${repoName}:`, error);
      throw error;
    }
  }

  async function createZipArchive(parentBundlePath, submoduleBundlePaths, commonSubmodules) {
    const archiver = require('archiver');
    const fs = require('fs');
    const os = require('os');

    const zipPath = path.join(os.tmpdir(), 'DreamNodes.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`Created zip archive at ${zipPath}`);
        resolve(zipPath);
      });
      archive.on('error', reject);

      archive.pipe(output);

      // Always add parent bundle to the root of the archive
      archive.file(parentBundlePath, { name: path.basename(parentBundlePath) });

      // Add submodule bundles to the 'submodules' folder if there are any non-common submodules
      const nonCommonSubmodules = submoduleBundlePaths.filter(bundlePath => 
        !commonSubmodules.includes(path.basename(bundlePath, '.bundle'))
      );

      if (nonCommonSubmodules.length > 0) {
        nonCommonSubmodules.forEach(bundlePath => {
          archive.file(bundlePath, { name: `submodules/${path.basename(bundlePath)}` });
        });
      }

      archive.finalize();
    });
  }

  ipcMain.handle('create-zip-archive', async (event, files) => {
    const archiver = require('archiver');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const zipPath = path.join(os.tmpdir(), `archive-${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve(zipPath));
      archive.on('error', reject);

      archive.pipe(output);

      files.forEach(file => {
        archive.file(file, { name: path.basename(file) });
      });

      archive.finalize();
    });
  });

  async function bundleRepository(repoName) {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    const repoPath = path.join(dreamVaultPath, repoName);
    const bundlePath = path.join(repoPath, `${repoName}.bundle`);

    try {
      // Ensure all submodules are initialized and updated
      await execAsync('git submodule update --init --recursive', { cwd: repoPath });
      
      // Create the bundle with all branches and tags, including submodules
      await execAsync(`git bundle create "${bundlePath}" --all --recurse-submodules=on-demand`, { cwd: repoPath });

      return bundlePath;
    } catch (error) {
      console.error(`Error creating bundle for ${repoName}:`, error);
      throw error;
    }
  }

  async function updateMetadataWithNovelSubmodules(repoName, newSubmodules) {
    const metadataPath = path.join(store.get('dreamVaultPath', ''), repoName, '.pl');
    let metadata;
    try {
      const data = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        metadata = {};
      } else {
        throw error;
      }
    }

    metadata.novelSubmodules = [...new Set([...(metadata.novelSubmodules || []), ...newSubmodules])];
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  }

  async function updateDreamSongCanvas(repoName, dependencies) {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    const canvasPath = path.join(dreamVaultPath, repoName, 'DreamSong.canvas');
  
    try {
      let canvasData = JSON.parse(await fs.readFile(canvasPath, 'utf8'));
    
      for (const node of canvasData.nodes) {
        if (node.type === 'file' && node.file) {
          const dependency = dependencies.find(dep => node.file.startsWith(dep + '/'));
          if (dependency) {
            // Prepend the repoName to the file path for submodules
            node.file = `${repoName}/${node.file}`;
          }
          // If the file is not from a submodule, leave it unchanged
        }
      }

      await fs.writeFile(canvasPath, JSON.stringify(canvasData, null, 2), 'utf8');
    
      // Stage and commit the changes
      await execAsync('git add .', { cwd: path.join(dreamVaultPath, repoName) });
      await execAsync('git commit -m "Update DreamSong.canvas with submodule changes"', { cwd: path.join(dreamVaultPath, repoName) });
    
      console.log(`Successfully updated and committed DreamSong.canvas for ${repoName}`);
    } catch (error) {
      console.error(`Error updating DreamSong.canvas for ${repoName}:`, error);
      throw error;
    }
  }

  ipcMain.handle('copy-repository-to-dreamvault', async (event, sourcePath, repoName) => {
    console.log(`Received request to copy repository ${repoName} from ${sourcePath} to DreamVault`);
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const destinationPath = path.join(dreamVaultPath, repoName);

    try {
      // Check if the source repository exists
      await fs.access(sourcePath);

      // Check if a repository with the same name already exists in DreamVault
      if (await fs.access(destinationPath).then(() => true).catch(() => false)) {
        return { success: false, error: 'A repository with the same name already exists in DreamVault' };
      }

      // Copy the repository
      await fs.cp(sourcePath, destinationPath, { recursive: true });

      console.log(`Successfully copied repository ${repoName} to DreamVault`);
      return { success: true };
    } catch (error) {
      console.error(`Error copying repository ${repoName} to DreamVault:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('unbundle-repository-to-dreamvault', async (event, bundlePath, repoName) => {
    console.log(`Received request to unbundle repository ${repoName} from ${bundlePath} to DreamVault`);
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const destinationPath = path.join(dreamVaultPath, repoName);

    try {
      // Check if the bundle file exists
      await fs.access(bundlePath);

      // Check if a repository with the same name already exists in DreamVault
      if (await fs.access(destinationPath).then(() => true).catch(() => false)) {
        return { success: false, error: 'A repository with the same name already exists in DreamVault' };
      }

      // Create the destination directory
      await fs.mkdir(destinationPath);

      // Clone the bundle
      const cloneCommand = `git clone "${bundlePath}" "${destinationPath}"`;
      console.log(`Executing command: ${cloneCommand}`);
      await execAsync(cloneCommand);

      // Initialize and update submodules
      console.log('Initializing and updating submodules...');
      await execAsync('git submodule update --init --recursive', { cwd: destinationPath });

      console.log(`Successfully unbundled repository ${repoName} to DreamVault`);
      return { success: true };
    } catch (error) {
      console.error(`Error unbundling repository ${repoName} to DreamVault:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('handle-zip-archive', async (event, zipPath) => {
    console.log(`Received request to handle zip archive ${zipPath}`);
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    try {
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();

      const submoduleBundles = [];
      let parentBundle = null;

      // Extract all bundles
      for (const entry of zipEntries) {
        if (entry.entryName.endsWith('.bundle')) {
          const bundlePath = path.join(dreamVaultPath, entry.entryName);
          zip.extractEntryTo(entry, dreamVaultPath, false, true);

          if (entry.entryName.startsWith('submodules/')) {
            submoduleBundles.push({ path: bundlePath, name: path.basename(entry.entryName, '.bundle') });
          } else {
            parentBundle = { path: bundlePath, name: path.basename(entry.entryName, '.bundle') };
          }
        }
      }

      // Clone submodules
      for (const submodule of submoduleBundles) {
        const correctedPath = submodule.path.replace(/\/submodules\//, '/');
        console.log(`Cloning submodule: path=${correctedPath}, name=${submodule.name}, dreamVaultPath=${dreamVaultPath}`);
        await cloneBundle(correctedPath, submodule.name, dreamVaultPath);
        await fs.unlink(correctedPath);
      }

      // Clone parent repository
      if (parentBundle) {
        await cloneBundle(parentBundle.path, parentBundle.name, dreamVaultPath);
        console.log(`Parent bundle path: ${parentBundle.path}`, `Parent bundle name: ${parentBundle.name}`);
        await fs.unlink(parentBundle.path);

        // Initialize submodules of the parent repository
        await initializeSubmodules(parentBundle.name, dreamVaultPath);
      }

      console.log(`Successfully processed zip archive ${zipPath}`);
      return { success: true };
    } catch (error) {
      console.error(`Error handling zip archive ${zipPath}:`, error);
      return { success: false, error: error.message };
    }
  });

async function cloneBundle(bundlePath, repoName, dreamVaultPath) {
  const destinationPath = path.join(dreamVaultPath, repoName);
  try {
    await fs.mkdir(destinationPath, { recursive: true });
    await execAsync(`git clone "${bundlePath}" "${destinationPath}"`);
    console.log(`Successfully cloned ${repoName} from bundle`);
  } catch (error) {
    console.error(`Error cloning bundle for ${repoName}:`, error);
    throw error;
  }
}

async function initializeSubmodules(repoName, dreamVaultPath) {
  const repoPath = path.join(dreamVaultPath, repoName);
  try {
    await execAsync('git submodule update --init --recursive', { cwd: repoPath });
    console.log(`Successfully initialized submodules for ${repoName}`);
  } catch (error) {
    console.error(`Error initializing submodules for ${repoName}:`, error);
    throw error;
  }
}

  async function unbundleRepository(bundlePath, repoName) {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    const destinationPath = path.join(dreamVaultPath, repoName);

    try {
      // Check if a repository with the same name already exists in DreamVault
      if (await fs.access(destinationPath).then(() => true).catch(() => false)) {
        // If it exists, we'll update it instead of creating a new one
        console.log(`Repository ${repoName} already exists. Updating...`);
      
        // Fetch the latest changes
        await execAsync('git fetch origin', { cwd: destinationPath });
      
        // Reset to the fetched state
        await execAsync('git reset --hard FETCH_HEAD', { cwd: destinationPath });
      } else {
        // Create the destination directory and clone the bundle
        await fs.mkdir(destinationPath);
        const cloneCommand = `git clone "${bundlePath}" "${destinationPath}"`;
        console.log(`Executing command: ${cloneCommand}`);
        await execAsync(cloneCommand);
      }

      // Initialize and update submodules
      console.log('Initializing and updating submodules...');
      await execAsync('git submodule update --init --recursive', { cwd: destinationPath });

      // Ensure all submodules are on the correct commit
      await execAsync('git submodule foreach git checkout $(git config -f $toplevel/.gitmodules submodule.$name.branch || echo HEAD)', { cwd: destinationPath });

      console.log(`Successfully unbundled/updated repository ${repoName} in DreamVault`);
      return { success: true };
    } catch (error) {
      console.error(`Error unbundling/updating repository ${repoName} in DreamVault:`, error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to promisify exec
  function execAsync(command, options) {
    return new Promise((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${command}`);
          console.error(`Error output: ${stderr}`);
          reject(new Error(`Command failed: ${command}\nError: ${error.message}\nStderr: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }

  ipcMain.handle('read-dreamsong-canvas', async (event, repoName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    const canvasPath = path.join(dreamVaultPath, repoName, 'DreamSong.canvas');
    try {
      const data = await fs.readFile(canvasPath, 'utf8');
      return data;
    } catch (error) {
      console.error(`Error reading DreamSong.canvas for ${repoName}:`, error);
      return null;
    }
  });

  ipcMain.handle('process-file', async (event, repoName, file, processorRepo) => {
    console.log(`Processing file: ${file} in repo: ${repoName} with processor: ${processorRepo}`);
    try {
      const dreamVaultPath = store.get('dreamVaultPath', '');
      if (!dreamVaultPath) {
        throw new Error('Dream Vault path not set');
      }
      const repoPath = path.join(dreamVaultPath, repoName);
      const inputPath = path.join(repoPath, file);
      const outputPath = path.join(repoPath, path.basename(file, path.extname(file)) + '.gif');

      console.log(`Full input file path: ${inputPath}`);
      console.log(`Output path: ${outputPath}`);

      // Path to the processor repository
      const processorRepoPath = path.join(dreamVaultPath, processorRepo);
      const scriptPath = path.join(processorRepoPath, 'process.py');

      // Execute the Python script
      const { execFile } = require('child_process');
      await new Promise((resolve, reject) => {
        execFile('python', [scriptPath, inputPath, outputPath], (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing Python script: ${error}`);
            reject(error);
          } else {
            console.log(`Python script output: ${stdout}`);
            resolve();
          }
        });
      });

      // Check if the output file was created
      const outputExists = await fs.access(outputPath).then(() => true).catch(() => false);
      console.log(`Output file exists: ${outputExists}`);

      if (outputExists) {
        return { success: true, message: `File ${file} processed successfully with ${processorRepo}. Output saved to ${outputPath}` };
      } else {
        throw new Error('Output file was not created');
      }
    } catch (error) {
      console.error(`Error processing file ${file} in repo ${repoName} with processor ${processorRepo}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('run-aider', async (event, repoName) => {
    console.log(`Running Aider for repo: ${repoName}`);
    try {
      const dreamVaultPath = store.get('dreamVaultPath', '');
      if (!dreamVaultPath) {
        throw new Error('Dream Vault path not set');
      }
      const repoPath = path.join(dreamVaultPath, repoName);
      const envFilePath = '/Users/davidrug/InterBrain/ProjectLiminalityReactThreeJS/.env';
      const repoEnvPath = path.join(repoPath, '.env');

      // Copy .env file if it doesn't exist in the repo
      if (!await fs.access(repoEnvPath).then(() => true).catch(() => false)) {
        await fs.copyFile(envFilePath, repoEnvPath);
      }

      // Run the Aider command
      const { spawn } = require('child_process');
      const aiderProcess = spawn('osascript', ['-e', `
        tell application "Terminal"
          do script "cd '${repoPath}' && codad && aider"
          activate
        end tell
      `]);

      aiderProcess.on('error', (error) => {
        console.error(`Error spawning Aider process: ${error}`);
        throw error;
      });

      return { success: true, message: 'Aider started successfully' };
    } catch (error) {
      console.error(`Error running Aider for repo ${repoName}:`, error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { setupHandlers };
function groupFriendsBySubmodules(friends) {
  const groups = {};
  for (const friend of friends) {
    const key = friend.commonSubmodules.sort().join(',');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(friend);
  }
  return groups;
}

async function createBundles(repoName, submodules) {
  const dreamVaultPath = store.get('dreamVaultPath', '');
  const bundlePaths = [];

  // Create bundle for the main repository
  const mainBundlePath = await bundleRepository(repoName);
  bundlePaths.push(mainBundlePath);

  // Create bundles for submodules
  for (const submodule of submodules) {
    const submodulePath = path.join(dreamVaultPath, submodule);
    const submoduleBundlePath = await bundleRepository(submodule, submodulePath);
    bundlePaths.push(submoduleBundlePath);
  }

  return bundlePaths;
}
