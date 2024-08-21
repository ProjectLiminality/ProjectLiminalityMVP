import React from 'react';
import { render, screen } from '@testing-library/react';
import DreamSong from '../DreamSong';

describe('DreamSong', () => {
  test('renders DreamSong component', () => {
    render(<DreamSong />);
    
    const headingElement = screen.getByText('DreamSong');
    expect(headingElement).toBeInTheDocument();
    
    const paragraphElement = screen.getByText('Back side of the DreamNode');
    expect(paragraphElement).toBeInTheDocument();
  });

  test('has correct styles', () => {
    render(<DreamSong />);
    
    const dreamSongDiv = screen.getByText('DreamSong').closest('div');
    expect(dreamSongDiv).toHaveStyle({
      width: '100%',
      height: '100%',
      background: 'rgb(200, 100, 0)',
      color: 'white',
      borderRadius: '50%',
    });
  });

  test('has correct layout styles', () => {
    render(<DreamSong />);
    
    const dreamSongDiv = screen.getByText('DreamSong').closest('div');
    expect(dreamSongDiv).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    });
  });

  test('heading has correct font size', () => {
    render(<DreamSong />);
    
    const headingElement = screen.getByText('DreamSong');
    expect(headingElement).toHaveStyle({
      fontSize: '24px',
      marginBottom: '10px',
    });
  });

  test('paragraph has correct font size and padding', () => {
    render(<DreamSong />);
    
    const paragraphElement = screen.getByText('Back side of the DreamNode');
    expect(paragraphElement).toHaveStyle({
      fontSize: '16px',
      padding: '0 20px',
    });
  });
});
