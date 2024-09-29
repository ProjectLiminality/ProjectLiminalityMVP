import React, { useState, useEffect, useRef } from 'react';
import { BLACK, BLUE, WHITE, RED } from '../constants/colors';
import { getAllRepoNamesAndTypes, addSubmodule, updateSubmodules, createEmailDraft, getPersonNodes } from '../services/electronService';

const ContextMenu = ({ repoName, position, onClose, onEditMetadata, onRename, onOpenInGitFox }) => {
  const [showSubmoduleMenu, setShowSubmoduleMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [availableRepos, setAvailableRepos] = useState([]);
  const [personNodes, setPersonNodes] = useState([]);
  const submenuRef = useRef(null);
  const shareMenuRef = useRef(null);

  useEffect(() => {
    const fetchRepos = async () => {
      const repos = await getAllRepoNamesAndTypes();
      const filteredRepos = repos.filter(repo => repo.name !== repoName);
      console.log('Available repos for submodules:', filteredRepos);
      setAvailableRepos(filteredRepos);
    };
    const fetchPersonNodes = async () => {
      const persons = await getPersonNodes();
      console.log('Available person nodes for sharing:', persons);
      setPersonNodes(persons);
    };
    fetchRepos();
    fetchPersonNodes();
  }, [repoName]);

  useEffect(() => {
    const positionSubmenu = (menuRef, showMenu, parentElement) => {
      if (showMenu && menuRef.current && parentElement) {
        const menu = menuRef.current;
        const parentRect = parentElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const menuHeight = menu.offsetHeight;

        let topPosition = parentRect.top;
        if (topPosition + menuHeight > viewportHeight) {
          topPosition = Math.max(0, viewportHeight - menuHeight);
        }

        menu.style.top = `${topPosition}px`;
        menu.style.left = `${parentRect.right}px`;
        menu.style.maxHeight = `${viewportHeight * 0.8}px`; // Limit to 80% of viewport height
      }
    };

    positionSubmenu(submenuRef, showSubmoduleMenu, submenuRef.current?.parentElement);
    positionSubmenu(shareMenuRef, showShareMenu, shareMenuRef.current?.parentElement);
  }, [showSubmoduleMenu, showShareMenu]);
  const handleEditMetadata = () => {
    onEditMetadata(repoName);
    onClose();
  };

  const handleRename = () => {
    onRename(repoName);
    onClose();
  };

  const handleOpenInFinder = () => {
    if (window.electron && window.electron.openInFinder) {
      window.electron.openInFinder(repoName);
    } else {
      console.error('openInFinder is not available');
    }
    onClose();
  };

  const handleOpenInGitFox = () => {
    if (window.electron && window.electron.openInGitFox) {
      window.electron.openInGitFox(repoName);
    } else {
      console.error('openInGitFox is not available');
    }
    onClose();
  };

  const handleAddSubmodule = (e) => {
    e.stopPropagation();
    setShowSubmoduleMenu(!showSubmoduleMenu);
  };

  const [error, setError] = useState(null);

  const handleSelectSubmodule = async (submoduleName) => {
    console.log(`Adding Submodule ${submoduleName} to ${repoName}`);
    try {
      await addSubmodule(repoName, submoduleName);
      console.log(`Successfully added submodule ${submoduleName} to ${repoName}`);
      onClose();
    } catch (err) {
      console.error(`Error adding submodule:`, err);
      setError(`Failed to add submodule: ${err.message}`);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        backgroundColor: BLACK,
        color: WHITE,
        borderRadius: '4px',
        overflow: 'visible',
        zIndex: 1000,
        border: `1px solid ${BLUE}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {error && (
        <div style={{ color: RED, padding: '10px', borderBottom: `1px solid ${BLUE}` }}>
          {error}
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
        <li 
          onClick={handleEditMetadata}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Edit Metadata
        </li>
        <li 
          onClick={handleRename}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Rename
        </li>
        <li 
          onClick={handleOpenInFinder}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Open in Finder
        </li>
        <li 
          onClick={handleOpenInGitFox}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Open in GitFox
        </li>
        <li 
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = BLUE;
            setShowSubmoduleMenu(true);
          }}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            position: 'relative',
          }}
        >
          Add Submodule ▶
          {showSubmoduleMenu && (
            <ul 
              ref={submenuRef}
              onMouseEnter={() => setShowSubmoduleMenu(true)}
              onMouseLeave={() => setShowSubmoduleMenu(false)}
              style={{
                position: 'fixed',
                backgroundColor: BLACK,
                border: `1px solid ${BLUE}`,
                borderRadius: '4px',
                padding: 0,
                margin: 0,
                listStyle: 'none',
                zIndex: 1001,
                minWidth: '150px',
                maxHeight: '80vh',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: `${BLUE} ${BLACK}`,
              }}
            >
              {console.log('Rendering submodule menu with repos:', availableRepos)}
              {availableRepos.map((repo) => (
                <li
                  key={repo.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectSubmodule(repo.name);
                  }}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {repo.name}
                </li>
              ))}
            </ul>
          )}
        </li>
        <li 
          onClick={() => handleUpdateSubmodules(repoName)}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Update Submodules
        </li>
        <li 
          onClick={() => handleTriggerCoherenceBeacon(repoName)}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Trigger Coherence Beacon
        </li>
        <li 
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = BLUE;
            setShowShareMenu(true);
          }}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            position: 'relative',
          }}
        >
          Share via Email ▶
          {showShareMenu && (
            <ul 
              ref={shareMenuRef}
              onMouseEnter={() => setShowShareMenu(true)}
              onMouseLeave={() => setShowShareMenu(false)}
              style={{
                position: 'fixed',
                backgroundColor: BLACK,
                border: `1px solid ${BLUE}`,
                borderRadius: '4px',
                padding: 0,
                margin: 0,
                listStyle: 'none',
                zIndex: 1001,
                minWidth: '150px',
                maxHeight: '80vh',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: `${BLUE} ${BLACK}`,
              }}
            >
              {personNodes.map((person) => (
                <li
                  key={person.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareViaEmail(repoName, person.name);
                  }}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {person.name}
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

const handleShareViaEmail = async (repoName, personName) => {
  try {
    const result = await createEmailDraft(repoName, personName);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message || 'Failed to create email draft');
    }
  } catch (error) {
    console.error('Error sharing via email:', error);
    alert(`Error sharing via email: ${error.message}`);
  }
};

const handleUpdateSubmodules = async (repoName) => {
  try {
    const result = await updateSubmodules(repoName);
    console.log('Submodules update result:', result);
    if (result.newSubmodules && result.newSubmodules.length > 0) {
      alert(`Submodules updated successfully. New submodules: ${result.newSubmodules.join(', ')}`);
    } else {
      alert("Everything is up to date. No new submodules to add.");
    }
  } catch (error) {
    console.error('Error updating submodules:', error);
    alert(`Error updating submodules: ${error.message}`);
  }
};

const handleTriggerCoherenceBeacon = async (repoName) => {
  try {
    const result = await triggerCoherenceBeacon(repoName);
    console.log('Coherence Beacon result:', result);
    if (result.friendsToNotify && result.friendsToNotify.length > 0) {
      const friendsInfo = result.friendsToNotify.map(friend => `${friend.name} (${friend.email})`).join(', ');
      alert(`Coherence Beacon triggered successfully. Friends to notify: ${friendsInfo}`);
    } else {
      alert("No friends to notify at this time.");
    }
  } catch (error) {
    console.error('Error triggering Coherence Beacon:', error);
    alert(`Error triggering Coherence Beacon: ${error.message}`);
  }
};

export default ContextMenu;
