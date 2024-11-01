import React, { useState, useEffect } from 'react';                                                                                  
import { BLACK, BLUE, WHITE } from '../constants/colors';                                                                            
import SearchComponent from './SemanticSearch/src/SearchComponent';                                                                  
                                                                                                                                     
const SearchPanel = ({ isOpen, onSearch, onClose, repoNames }) => {                                                                  
  const [searchResults, setSearchResults] = useState([]);                                                                            
                                                                                                                                     
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
        position: 'fixed',
        backgroundColor: BLACK,
      }}
    >
      <SearchComponent
        maxResults={5}
        targets={repoNames}
        onSearchStart={handleSearchStart}
        onSearchComplete={handleSearchComplete}
      />
    </div>
  );
};

export default SearchPanel;
