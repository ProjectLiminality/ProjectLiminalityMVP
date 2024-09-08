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
    console.log(`Getting repo data for ${repoName}`);
    const metadata = await electronService.readMetadata(repoName);
    const mediaContent = await getPreferredMediaFile(repoName);
    console.log(`Repo data for ${repoName}:`, { metadata, mediaContent });
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
    console.log(`Media files in ${repoName}:`, mediaFiles);

    if (mediaFiles.length > 0) {
      const selectedFile = mediaFiles.sort((a, b) => {
        const extA = preferredExtensions.findIndex(ext => a.toLowerCase().endsWith(ext));
        const extB = preferredExtensions.findIndex(ext => b.toLowerCase().endsWith(ext));
        return extA - extB;
      })[0];
      console.log(`Selected file for ${repoName}:`, selectedFile);

      const mediaPath = await electronService.getMediaFilePath(repoName, selectedFile);
      console.log(`Media path for ${repoName}:`, mediaPath);
      
      const mediaData = await electronService.readFile(mediaPath);
      const fileExtension = selectedFile.split('.').pop().toLowerCase();

      const mimeTypes = {
        'mp4': 'video/mp4',
        'gif': 'image/gif',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg'
      };

      const mimeType = mimeTypes[fileExtension] || 'application/octet-stream';
      console.log(`MIME type for ${selectedFile}:`, mimeType);

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
    console.log(`Attempting to read DreamSong.canvas for ${repoName}`);
    const canvasPath = `${repoName}/DreamSong.canvas`;
    const canvasContent = await electronService.readFile(canvasPath);
    console.log('DreamSong.canvas content:', canvasContent);
    return JSON.parse(canvasContent);
  } catch (error) {
    console.error('Error reading DreamSong.canvas:', error);
    if (error.message.includes('ENOENT')) {
      throw new Error(`DreamSong.canvas not found for ${repoName}`);
    }
    throw error;
  }
}

export async function listMediaFiles(repoName) {
  try {
    console.log(`Listing media files for ${repoName}`);
    const files = await electronService.listFiles(repoName);
    console.log('All files:', files);
    const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.webm', '.ogg'];
    const mediaFiles = files.filter(file => 
      mediaExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
    console.log('Filtered media files:', mediaFiles);
    return mediaFiles;
  } catch (error) {
    console.error('Error listing media files:', error);
    throw error;
  }
}
