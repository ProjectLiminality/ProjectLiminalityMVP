import React, { useState, useEffect, useRef } from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';
import { getAllRepoNamesAndTypes } from '../services/electronService';

const ContextMenu = ({ repoName, position, onClose, onEditMetadata, onRename, onOpenInGitFox }) => {
  const [showSubmoduleMenu, setShowSubmoduleMenu] = useState(false);
  const [availableRepos, setAvailableRepos] = useState([]);
  const submenuRef = useRef(null);

  useEffect(() => {
    const fetchRepos = async () => {
      const repos = await getAllRepoNamesAndTypes();
      const filteredRepos = repos.filter(repo => repo.name !== repoName);
      console.log('Available repos for submodules:', filteredRepos);
      setAvailableRepos(filteredRepos);
    };
    fetchRepos();
  }, [repoName]);

  useEffect(() => {
    if (showSubmoduleMenu && submenuRef.current) {
      const submenu = submenuRef.current;
      const viewportHeight = window.innerHeight;
      const submenuHeight = submenu.offsetHeight;
      
      // Calculate the vertical center position
      const topPosition = Math.max(0, (viewportHeight - submenuHeight) / 2);
      
      submenu.style.top = `${topPosition}px`;
      submenu.style.maxHeight = `${viewportHeight * 0.8}px`; // Limit to 80% of viewport height
    }
  }, [showSubmoduleMenu]);
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

  const handleSelectSubmodule = (submoduleName) => {
    console.log(`Add Submodule ${submoduleName} to ${repoName}`);
    // TODO: Implement the logic for adding a submodule
    onClose();
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
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            setShowSubmoduleMenu(false);
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
              style={{
                position: 'fixed',
                left: `${position.x + 150}px`, // Adjust this value as needed
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
      </ul>
    </div>
  );
};

export default ContextMenu;
