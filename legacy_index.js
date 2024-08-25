const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

let electron;
if (process.env.NODE_ENV === 'test') {
  electron = require('./__mocks__/electron');
} else {
  electron = require('electron');
}

const { app, BrowserWindow, ipcMain, shell } = electron;

const VAULT_PATH = '/Users/davidrug/InterBrain';

/**
 * Creates the main application window.
 * @returns {BrowserWindow}
 */
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.join(__dirname, 'src', 'index.html'));
    
    // Open DevTools (optional, for debugging)
    win.webContents.openDevTools();

    return win;
}

if (app && app.whenReady) {
    app.whenReady().then(createWindow);
}

// Export createWindow and other functions for testing
module.exports = {
    createWindow,
    VAULT_PATH,
    handleCreateDreamnode,
    handleOpenInFinder,
    handleOpenInGitfox,
    handleOpenInKeynote,
    handleOpenInC4D,
    handleOpenInSublime
};

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('create-dreamnode', handleCreateDreamnode);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('open-in-finder', handleOpenInFinder);

/**
 * Handles the creation of a new dreamnode.
 * @param {Object} event - The IPC event object.
 * @param {Object} options - The options for creating the dreamnode.
 * @param {string} options.name - The name of the dreamnode.
 * @param {boolean} options.clone - Whether to clone an existing repository.
 * @param {string} options.repoUrl - The URL of the repository to clone (if cloning).
 * @param {string} options.type - The type of the dreamnode.
 * @returns {void}
 */
function handleCreateDreamnode(event, { name, clone, repoUrl, type }) {
    const dreamnodePath = path.join(VAULT_PATH, name);

    if (fs.existsSync(dreamnodePath)) {
        event.reply('dreamnode-created', false);
        return;
    }

    fs.mkdirSync(dreamnodePath);

    // Create .pl file
    const plContent = `type: ${type || 'idea'}`;
    fs.writeFileSync(path.join(dreamnodePath, '.pl'), plContent);

    if (clone) {
        exec(`git clone ${repoUrl} "${dreamnodePath}"`, (error) => {
            if (error) {
                console.error(`Error cloning repository: ${error}`);
                event.reply('dreamnode-created', false);
            } else {
                event.reply('dreamnode-created', true);
            }
        });
    } else {
        exec(`git init "${dreamnodePath}"`, (error) => {
            if (error) {
                console.error(`Error initializing repository: ${error}`);
                event.reply('dreamnode-created', false);
            } else {
                event.reply('dreamnode-created', true);
            }
        });
    }
}

ipcMain.on('open-in-gitfox', handleOpenInGitfox);

/**
 * Opens the specified repository in Finder.
 * @param {Object} event - The IPC event object.
 * @param {string} repoName - The name of the repository to open.
 * @returns {void}
 */
function handleOpenInFinder(event, repoName) {
    const repoPath = path.join(VAULT_PATH, repoName);
    shell.openPath(repoPath);
}

ipcMain.on('open-in-keynote', handleOpenInKeynote);

/**
 * Opens the specified repository in GitFox.
 * @param {Object} event - The IPC event object.
 * @param {string} repoName - The name of the repository to open.
 * @returns {void}
 */
function handleOpenInGitfox(event, repoName) {
    console.log(`Attempting to open GitFox for: ${repoName}`);
    exec(`cd "${VAULT_PATH}" && gitfox "${repoName}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error opening GitFox: ${error}`);
            event.reply('gitfox-opened', { success: false, error: error.message });
        } else if (stderr) {
            console.error(`GitFox stderr: ${stderr}`);
            event.reply('gitfox-opened', { success: false, error: stderr });
        } else {
            console.log(`Successfully opened GitFox for ${repoName}`);
            event.reply('gitfox-opened', { success: true });
        }
    });
}

ipcMain.on('open-in-c4d', handleOpenInC4D);


/**
 * Opens the Keynote file associated with the specified repository.
 * @param {Object} event - The IPC event object.
 * @param {string} repoName - The name of the repository containing the Keynote file.
 * @returns {void}
 */
function handleOpenInKeynote(event, repoName) {
    const repoPath = path.join(VAULT_PATH, repoName);
    const keynoteFiles = fs.readdirSync(repoPath).filter(file => file.endsWith('.key'));
    
    let keynoteFile;
    if (keynoteFiles.length > 0) {
        // Prefer the file with the same name as the repository
        keynoteFile = keynoteFiles.find(file => file === `${repoName}.key`) || keynoteFiles[0];
    }

    if (keynoteFile) {
        const keynoteFilePath = path.join(repoPath, keynoteFile);
        exec(`open "${keynoteFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error opening Keynote: ${error}`);
                event.reply('keynote-opened', { success: false, error: error.message });
            } else if (stderr) {
                console.error(`Keynote stderr: ${stderr}`);
                event.reply('keynote-opened', { success: false, error: stderr });
            } else {
                console.log(`Successfully opened Keynote for ${repoName}`);
                event.reply('keynote-opened', { success: true });
            }
        });
    } else {
        console.error(`No Keynote file found in: ${repoPath}`);
        event.reply('keynote-opened', { success: false, error: 'No Keynote file found' });
    }
}

ipcMain.on('open-in-sublime', handleOpenInSublime);

/**
 * Opens the Cinema 4D file associated with the specified repository.
 * @param {Object} event - The IPC event object.
 * @param {string} repoName - The name of the repository containing the Cinema 4D file.
 * @returns {void}
 */
function handleOpenInC4D(event, repoName) {
    const repoPath = path.join(VAULT_PATH, repoName);
    const c4dFiles = fs.readdirSync(repoPath).filter(file => file.endsWith('.c4d'));
    
    let c4dFile;
    if (c4dFiles.length > 0) {
        // Prefer the file with the same name as the repository
        c4dFile = c4dFiles.find(file => file === `${repoName}.c4d`) || c4dFiles[0];
    }

    if (c4dFile) {
        const c4dFilePath = path.join(repoPath, c4dFile);
        exec(`open "${c4dFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error opening Cinema 4D: ${error}`);
                event.reply('c4d-opened', { success: false, error: error.message });
            } else if (stderr) {
                console.error(`Cinema 4D stderr: ${stderr}`);
                event.reply('c4d-opened', { success: false, error: stderr });
            } else {
                console.log(`Successfully opened Cinema 4D for ${repoName}`);
                event.reply('c4d-opened', { success: true });
            }
        });
    } else {
        console.error(`No Cinema 4D file found in: ${repoPath}`);
        event.reply('c4d-opened', { success: false, error: 'No Cinema 4D file found' });
    }
}

ipcMain.on('open-in-c4d', handleOpenInC4D);

/**
 * Opens the Sublime Text project file associated with the specified repository.
 * @param {Object} event - The IPC event object.
 * @param {string} repoName - The name of the repository containing the Sublime Text project file.
 * @returns {void}
 */
function handleOpenInSublime(event, repoName) {
    const repoPath = path.join(VAULT_PATH, repoName);
    const sublimeFiles = fs.readdirSync(repoPath).filter(file => file.endsWith('.sublime-project'));
    
    let sublimeFile;
    if (sublimeFiles.length > 0) {
        // Prefer the file with the same name as the repository
        sublimeFile = sublimeFiles.find(file => file === `${repoName}.sublime-project`) || sublimeFiles[0];
    }

    if (sublimeFile) {
        const sublimeFilePath = path.join(repoPath, sublimeFile);
        exec(`open -a "Sublime Text" "${sublimeFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error opening Sublime Text: ${error}`);
                event.reply('sublime-opened', { success: false, error: error.message });
            } else if (stderr) {
                console.error(`Sublime Text stderr: ${stderr}`);
                event.reply('sublime-opened', { success: false, error: stderr });
            } else {
                console.log(`Successfully opened Sublime Text for ${repoName}`);
                event.reply('sublime-opened', { success: true });
            }
        });
    } else {
        console.error(`No Sublime Text project file found in: ${repoPath}`);
        event.reply('sublime-opened', { success: false, error: 'No Sublime Text project file found' });
    }
}

ipcMain.on('open-in-sublime', handleOpenInSublime);
