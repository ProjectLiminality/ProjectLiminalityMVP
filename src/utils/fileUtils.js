import * as electronService from '../services/electronService';

const preferredExtensions = ['.gif', '.mp4', '.png', '.jpg', '.jpeg'];

export async function getRepoData(repoName) {
  try {
    const metadata = await electronService.readMetadata(repoName);
    const dreamTalkMedia = await getPreferredMediaFile(repoName);
    const dreamSongMedia = await getDreamSongMedia(repoName);
    return { metadata, dreamTalkMedia, dreamSongMedia };
  } catch (error) {
    return { metadata: {}, dreamTalkMedia: null, dreamSongMedia: null };
  }
}

async function getDreamSongMedia(repoName) {
  try {
    const files = await electronService.listFiles(repoName);
    const mediaFiles = files.filter(file => 
      preferredExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );

    const mediaPromises = mediaFiles.map(async file => {
      const mediaPath = await electronService.getMediaFilePath(repoName, file);
      if (!mediaPath) {
        return null;
      }

      const mediaData = await electronService.readFile(mediaPath);
      if (!mediaData) {
        return null;
      }

      const fileExtension = file.split('.').pop().toLowerCase();
      const mimeType = getMimeType(fileExtension);

      return {
        type: mimeType,
        path: mediaPath,
        data: `data:${mimeType};base64,${mediaData}`
      };
    });

    const mediaContents = await Promise.all(mediaPromises);
    return mediaContents.filter(media => media !== null);
  } catch (error) {
    console.error('Error getting DreamSong media:', error);
    return null;
  }
}

function getMimeType(fileExtension) {
  const mimeTypes = {
    'mp4': 'video/mp4',
    'gif': 'image/gif',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };
  return mimeTypes[fileExtension] || 'application/octet-stream';
}

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
      if (!mediaPath) {
        return null;
      }

      const mediaData = await electronService.readFile(mediaPath);
      if (!mediaData) {
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
    return null;
  } catch (error) {
    return null;
  }
}

export async function readDreamSongCanvas(repoName) {
  try {
    const canvasContent = await electronService.readDreamSongCanvas(repoName);
    if (!canvasContent || canvasContent.trim() === '') {
      console.log('DreamSong.canvas is empty or not found');
      return null;
    }
    console.log('DreamSong.canvas content:', canvasContent);
    const parsedContent = JSON.parse(canvasContent);
    console.log('Parsed DreamSong.canvas content:', parsedContent);
    return parsedContent;  // Return parsed JSON
  } catch (error) {
    console.error('Error parsing DreamSong.canvas:', error);
    return null;
  }
}

export async function listMediaFiles(repoName) {
  try {
    const files = await electronService.listFiles(repoName);
    const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.webm', '.ogg'];
    return files.filter(file => 
      mediaExtensions.some(ext => file.toLowerCase().endsWith(ext))
    ).map(file => `${repoName}/${file}`);
  } catch (error) {
    return [];
  }
}

export async function addFileToNode(nodeName, file) {
  try {
    if (!nodeName || !file) {
      throw new Error('Both nodeName and file are required');
    }

    const result = await electronService.addFileToNode(nodeName, file);
    
    if (result) {
      const stageResult = await electronService.stageFile(nodeName, file.name);
      if (stageResult) {
        const commitMessage = `Added ${file.name}`;
        const commitResult = await electronService.commitChanges(nodeName, commitMessage);
        if (commitResult) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}
