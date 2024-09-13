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
    const files = await electronService.listFiles(repoName);
    const mediaFiles = files.filter(file => 
      file.startsWith(repoName) && preferredExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );

    if (mediaFiles.length > 0) {
      const selectedFile = mediaFiles.sort((a, b) => {
        const extA = preferredExtensions.findIndex(ext => a.toLowerCase().endsWith(ext));
        const extB = preferredExtensions.findIndex(ext => b.toLowerCase().endsWith(ext));
        return extA - extB;
      })[0];

      const mediaPath = await electronService.getMediaFilePath(repoName, selectedFile);
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

      return {
        type: mimeType,
        path: mediaPath,
        data: `data:${mimeType};base64,${mediaData}`
      };
    }
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
