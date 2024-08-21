import React from 'react';
import { render, screen } from '@testing-library/react';
import DreamTalk from '../DreamTalk';

describe('DreamTalk', () => {
  test('renders DreamTalk component', () => {
    render(<DreamTalk />);
    
    const headingElement = screen.getByText('DreamTalk');
    expect(headingElement).toBeInTheDocument();
    
    const paragraphElement = screen.getByText('Front side of the DreamNode');
    expect(paragraphElement).toBeInTheDocument();
  });

  test('has correct styles', () => {
    render(<DreamTalk />);
    
    const dreamTalkDiv = screen.getByText('DreamTalk').closest('div');
    expect(dreamTalkDiv).toHaveStyle({
      width: '100%',
      height: '100%',
      background: 'rgb(0, 100, 200)',
      color: 'white',
      borderRadius: '50%',
    });
  });

  test('has correct layout styles', () => {
    render(<DreamTalk />);
    
    const dreamTalkDiv = screen.getByText('DreamTalk').closest('div');
    expect(dreamTalkDiv).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    });
  });

  test('heading has correct font size', () => {
    render(<DreamTalk />);
    
    const headingElement = screen.getByText('DreamTalk');
    expect(headingElement).toHaveStyle({
      fontSize: '24px',
      marginBottom: '10px',
    });
  });

  test('paragraph has correct font size and padding', () => {
    render(<DreamTalk />);
    
    const paragraphElement = screen.getByText('Front side of the DreamNode');
    expect(paragraphElement).toHaveStyle({
      fontSize: '16px',
      padding: '0 20px',
    });
  });
});
