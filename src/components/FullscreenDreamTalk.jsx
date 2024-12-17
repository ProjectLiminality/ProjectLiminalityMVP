import React from 'react';                                                              
import { BLACK, BLUE, RED, WHITE } from '../constants/colors';                          
import DreamTalk from './DreamTalk';                                                    
                                                                                        
const FullscreenDreamTalk = ({ isOpen, onClose, repoName, dreamTalkMedia, metadata }) = 
{                                                                                       
  if (!isOpen) return null;                                                             
                                                                                        
  return (                                                                              
    <div style={{                                                                       
      position: 'fixed',                                                                
      top: 0,                                                                           
      left: 0,                                                                          
      width: '100%',                                                                    
      height: '100%',                                                                   
      backgroundColor: BLACK,                                                           
      color: WHITE,                                                                     
      zIndex: 1000,                                                                     
      display: 'flex',                                                                  
      justifyContent: 'center',                                                         
      alignItems: 'center',                                                             
    }}>                                                                                 
      <div style={{                                                                     
        width: '90%',                                                                   
        height: '90%',                                                                  
        position: 'relative',                                                           
      }}>                                                                               
        <DreamTalk                                                                      
          repoName={repoName}                                                           
          dreamTalkMedia={dreamTalkMedia}                                               
          metadata={metadata}                                                           
          onClick={() => {}}                                                            
          onRightClick={() => {}}                                                       
          onMouseEnter={() => {}}                                                       
          onMouseLeave={() => {}}                                                       
          isHovered={false}                                                             
          borderColor="transparent"                                                     
          onFlip={() => {}}                                                             
          onToggleFullscreen={() => {}}                                                 
        />                                                                              
        <button onClick={onClose} style={{                                              
          position: 'absolute',                                                         
          top: '10px',                                                                  
          right: '10px',                                                                
          padding: '5px 10px',                                                          
          backgroundColor: RED,                                                         
          color: WHITE,                                                                 
          border: 'none',                                                               
          borderRadius: '4px',                                                          
          cursor: 'pointer'                                                             
        }}>                                                                             
          Close                                                                         
        </button>                                                                       
      </div>                                                                            
    </div>                                                                              
  );                                                                                    
};                                                                                      
                                                                                        
export default FullscreenDreamTalk;