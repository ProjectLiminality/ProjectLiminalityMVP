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
});
