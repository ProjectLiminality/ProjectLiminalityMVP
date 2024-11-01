import React, { useState, useEffect } from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';
import SearchComponent from './SemanticSearch/src/SearchComponent';
import { scanDreamVault } from '../services/electronService';

const SearchPanel = ({ isOpen, onSearch, onClose, style }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [repoNames, setRepoNames] = useState([]);

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
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('SearchPanel mounted or updated. isOpen:', isOpen);
    console.log('repoNames:', repoNames);
  }, [isOpen, repoNames]);
                                                                                                                                     
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
    setSearchResults(formattedResults);                                                                                              
    onSearch(formattedResults);                                                                                                      
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
        maxResults={5}
        targets={repoNames} // Use the fetched repo names here
        onSearchStart={handleSearchStart}
        onSearchComplete={handleSearchComplete}
      />
    </div>
  );
};

export default SearchPanel;
