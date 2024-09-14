import * as electronService from '../services/electronService';

/**
 * Array of preferred file extensions for media files, in order of preference.
 * @type {string[]}
 */
const preferredExtensions = ['.gif', '.mp4', '.png', '.jpg', '.jpeg'];

/**
 * Retrieves repository data including metadata and preferred media content.
 * @param {string} repoName - The name of the repository.
 * @returns {Promise<{metadata: Object, mediaContent: Object|null}>} The repository data.
 */
export async function getRepoData(repoName) {
  try {
    const metadata = await electronService.readMetadata(repoName);
    const mediaContent = await getPreferredMediaFile(repoName);
    return { metadata, mediaContent };
  } catch (error) {
    console.error(`Error getting repo data for ${repoName}:`, error);
    return { metadata: {}, mediaContent: null };
  }
}

/**
 * Retrieves the preferred media file for a given repository.
 * @param {string} repoName - The name of the repository.
 * @returns {Promise<Object|null>} The media file data or null if no media file is found.
 */
async function getPreferredMediaFile(repoName) {
  try {
    console.log(`Getting preferred media file for ${repoName}`);
    const files = await electronService.listFiles(repoName);
    console.log(`Files in ${repoName}:`, files);
    const mediaFiles = files.filter(file => 
      file.startsWith(repoName) && preferredExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
    console.log(`Media files found:`, mediaFiles);

    if (mediaFiles.length > 0) {
      const selectedFile = mediaFiles.sort((a, b) => {
        const extA = preferredExtensions.findIndex(ext => a.toLowerCase().endsWith(ext));
        const extB = preferredExtensions.findIndex(ext => b.toLowerCase().endsWith(ext));
        return extA - extB;
      })[0];
      console.log(`Selected file:`, selectedFile);

      const mediaPath = await electronService.getMediaFilePath(repoName, selectedFile);
      console.log(`Media path:`, mediaPath);
      if (!mediaPath) {
        console.error(`No media path found for ${selectedFile} in ${repoName}`);
        return null;
      }

      const mediaData = await electronService.readFile(mediaPath);
      if (!mediaData) {
        console.error(`Failed to read file data for ${mediaPath}`);
        return null;
      }

      const fileExtension = selectedFile.split('.').pop().toLowerCase();
      const mimeTypes = {
        'mp4': 'video/mp4',
        'gif': 'image/gif',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg'
      };
      const mimeType = mimeTypes[fileExtension] || 'application/octet-stream';

      return {
        type: mimeType,
        path: mediaPath,
        data: `data:${mimeType};base64,${mediaData}`
      };
    }
    console.log(`No media files found for ${repoName}`);
    return null;
  } catch (error) {
    console.error(`Error getting preferred media file for ${repoName}:`, error);
    return null;
  }
}

export async function readDreamSongCanvas(repoName) {
  try {
    const canvasPath = `${repoName}/DreamSong.canvas`;
    const canvasContent = await electronService.readFile(canvasPath);

    if (!canvasContent || canvasContent.trim() === '') {
      return null;
    }

    const parsedContent = JSON.parse(canvasContent);
    return parsedContent;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return silently
      return null;
    }
    // For other errors, log them but don't throw
    console.error(`Error reading DreamSong.canvas for ${repoName}:`, error);
    return null;
  }
}

export async function listMediaFiles(repoName) {
  try {
    console.log(`Listing media files for ${repoName}`);
    const files = await electronService.listFiles(repoName);
    console.log(`Files found in ${repoName}:`, files);
    const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.webm', '.ogg'];
    const mediaFiles = files.filter(file => 
      mediaExtensions.some(ext => file.toLowerCase().endsWith(ext))
    ).map(file => `${repoName}/${file}`);
    console.log(`Media files found:`, mediaFiles);
    return mediaFiles;
  } catch (error) {
    console.error(`Error listing media files for ${repoName}:`, error);
    throw error;
  }
}

export async function addFileToNode(nodeName, file) {
  try {
    if (!nodeName || !file) {
      throw new Error('Both nodeName and file are required');
    }

    const result = await electronService.addFileToNode(nodeName, file);
    
    if (result) {
      console.log(`File ${file.name} successfully added to node ${nodeName}`);
      
      // Stage and commit the added file
      const stageResult = await electronService.stageFile(nodeName, file.name);
      if (stageResult) {
        const commitMessage = `Added ${file.name}`;
        const commitResult = await electronService.commitChanges(nodeName, commitMessage);
        if (commitResult) {
          console.log(`Changes committed for ${file.name} in node ${nodeName}`);
          return true;
        } else {
          console.error(`Failed to commit changes for ${file.name} in node ${nodeName}`);
        }
      } else {
        console.error(`Failed to stage ${file.name} in node ${nodeName}`);
      }
    } else {
      console.error(`Failed to add file ${file.name} to node ${nodeName}`);
    }
    return false;
  } catch (error) {
    console.error('Error in addFileToNode:', error);
    return false;
  }
}
