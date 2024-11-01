import React, { useState, useEffect } from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';
import SearchComponent from './SemanticSearch/src/SearchComponent';

const SearchPanel = ({ isOpen, onSearch, onClose, repoNames }) => {
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
        onSearch([]); // Reset search results
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, onSearch]);

  if (!isOpen) return null;

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
    setSearchResults(formattedResults);
    onSearch(formattedResults);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: BLACK,
      color: WHITE,
      padding: '10px',
      borderRadius: '8px',
      zIndex: 1000,
      boxShadow: `0 0 0 2px ${BLUE}`,
    }}>
      <SearchComponent
        maxResults={5}
        targets={repoNames}
        onSearchStart={handleSearchStart}
        onSearchComplete={handleSearchComplete}
      />
      {/* Display search results */}
      <div style={{ marginTop: '10px', maxHeight: '300px', overflowY: 'auto' }}>
        {searchResults.map(({ repoName, similarity }) => (
          <div key={repoName} style={{ marginBottom: '5px' }}>
            {repoName}: {similarity.toFixed(4)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPanel;
