import React from 'react';
import { render } from '@testing-library/react';
import DreamSong from '../DreamSong';

describe('DreamSong', () => {
  it('renders without crashing', () => {
    render(<DreamSong />);
    // No assertions for now, just checking if it renders
  });
});
