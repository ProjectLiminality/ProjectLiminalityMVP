import React, { useState, useEffect, useRef } from 'react';
import { BLACK, WHITE, BLUE } from '../constants/colors';
import { getAllRepoNamesAndTypes } from '../services/electronService';

const FileContextMenu = ({ x, y, file, repoName, onClose, onProcessFile }) => {
  const [showProcessMenu, setShowProcessMenu] = useState(false);
  const [ideaRepos, setIdeaRepos] = useState([]);
  const menuRef = useRef(null);
  const processMenuRef = useRef(null);

  useEffect(() => {
    const fetchIdeaRepos = async () => {
      const repos = await getAllRepoNamesAndTypes();
      const filteredRepos = repos.filter(repo => repo.type === 'IDEA');
      setIdeaRepos(filteredRepos);
    };
    fetchIdeaRepos();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const positionProcessMenu = () => {
      if (showProcessMenu && processMenuRef.current && menuRef.current) {
        const menu = processMenuRef.current;
        const parentRect = menuRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const menuHeight = menu.offsetHeight;

        let topPosition = parentRect.top;
        if (topPosition + menuHeight > viewportHeight) {
          topPosition = Math.max(0, viewportHeight - menuHeight);
        }

        menu.style.top = `${topPosition}px`;
        menu.style.left = `${parentRect.right}px`;
        menu.style.maxHeight = `${viewportHeight * 0.8}px`;
      }
    };

    positionProcessMenu();
  }, [showProcessMenu]);

  const handleProcess = async (processorRepo) => {
    console.log(`Processing file: ${file} in repo: ${repoName} with processor: ${processorRepo}`);
    try {
      const result = await window.electron.fileSystem.processFile(repoName, file, processorRepo);
      if (result && result.success) {
        console.log('File processed successfully');
        alert(`File processed successfully! ${result.message}`);
        if (onProcessFile) {
          onProcessFile();
        }
      } else {
        const errorMessage = result && result.error ? result.error : 'Unknown error occurred';
        console.error('Error processing file:', errorMessage);
        alert(`Error processing file: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error in handleProcess:', error);
      alert(`Error processing file: ${error.message || 'Unknown error occurred'}`);
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: y,
        left: x,
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
        <li style={{ padding: '6px 10px', borderBottom: `1px solid ${BLUE}` }}>
          File: {file}
        </li>
        <li 
          onMouseEnter={() => setShowProcessMenu(true)}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            position: 'relative',
          }}
        >
          Process with ▶
          {showProcessMenu && (
            <ul 
              ref={processMenuRef}
              onMouseEnter={() => setShowProcessMenu(true)}
              onMouseLeave={() => setShowProcessMenu(false)}
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
              {ideaRepos.map((repo) => (
                <li
                  key={repo.name}
                  onClick={() => handleProcess(repo.name)}
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

export default FileContextMenu;
