import React from 'react';
import { render } from '@testing-library/react';
import DreamTalk from '../DreamTalk';

describe('DreamTalk', () => {
  it('renders without crashing', () => {
    render(<DreamTalk />);
    // No assertions for now, just checking if it renders
  });
});
