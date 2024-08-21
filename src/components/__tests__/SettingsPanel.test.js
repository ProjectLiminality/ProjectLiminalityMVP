import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPanel from '../SettingsPanel';

describe('SettingsPanel', () => {
  it('renders when isOpen is true', () => {
    render(<SettingsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<SettingsPanel isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<SettingsPanel isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays manual input when "Enter Manually" is clicked', () => {
    render(<SettingsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Enter Manually'));
    expect(screen.getByPlaceholderText('Enter path manually')).toBeInTheDocument();
  });
});
