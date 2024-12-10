import React, { useState, useEffect, useCallback } from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';
import SearchComponent from './SemanticSearch/src/SearchComponent';
import { scanDreamVault } from '../services/electronService';

const SearchPanel = ({ isOpen, onSearch, onClose, style }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [repoNames, setRepoNames] = useState([]);
  const [latestResults, setLatestResults] = useState([]);

  useEffect(() => {
    const fetchRepoNames = async () => {
      try {
        const names = await scanDreamVault();
        setRepoNames(names);
        console.log('Fetched repo names:', names);
      } catch (error) {
        console.error('Error fetching repo names:', error);
      }
    };

    if (isOpen) {
      fetchRepoNames();
      // Focus the search input when the panel opens
      setTimeout(() => {
        const inputElement = document.querySelector('input[type="text"]');
        if (inputElement) {
          inputElement.focus();
        }
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('SearchPanel mounted or updated. isOpen:', isOpen);
    console.log('repoNames:', repoNames);
  }, [isOpen, repoNames]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
      onSearch([]); // Reset search results
    } else if (event.key === 'Enter') {
      console.log('Enter key pressed, submitting search results');
      onSearch(latestResults);
    }
  }, [onClose, onSearch, latestResults]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!isOpen) {
    console.log('SearchPanel is not open, returning null');
    return null;
  }

  const handleSearchStart = () => {
    console.log('Search started');
    setSearchResults([]);
  };

  const handleSearchComplete = (results) => {
    console.log('Raw search results:', results);
    const formattedResults = results.map(([name, similarity]) => ({
      repoName: name,
      similarity: similarity
    }));
    console.log('Formatted search results:', formattedResults);
    setLatestResults(formattedResults);
  };

  console.log('Rendering SearchPanel');

  return (
    <div
      style={{
        ...style,
        backgroundColor: BLACK,
        opacity: 1,
        borderRadius: '10px',
        height: '5%',
        width: '50%',
      }}
    >
      <SearchComponent
        maxResults={19} // Set a default max results
        threshold={0.5} // Set a default threshold value
        targets={repoNames} // Use the fetched repo names here
        onSearchStart={handleSearchStart}
        onSearchComplete={handleSearchComplete}
      />
    </div>
  );
};

export default SearchPanel;
