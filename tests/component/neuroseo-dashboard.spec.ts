import { test, expect } from '@playwright/test';
import { render, screen } from '@testing-library/react';
import NeuroSEODashboard from '../../src/components/NeuroSEODashboard';
import { useAuth } from '../../src/context/AuthContext';
import { useHydration } from '../../src/components/HydrationContext';

// Mocks
jest.mock('../../src/context/AuthContext');
jest.mock('../../src/components/HydrationContext');

const mockUseAuth = useAuth as jest.Mock;
const mockUseHydration = useHydration as jest.Mock;

describe('NeuroSEODashboard Component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { getIdToken: async () => 'fake-token' } });
    mockUseHydration.mockReturnValue(true);
  });

  test('renders the main dashboard structure', () => {
    render(<NeuroSEODashboard />);
    expect(screen.getByText('NeuroSEO™ Suite')).toBeInTheDocument();
    expect(screen.getByText('Start New Analysis')).toBeInTheDocument();
    expect(screen.getByLabelText('Target URLs *')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Keywords *')).toBeInTheDocument();
  });

  test('disables the analysis button when form is incomplete', () => {
    render(<NeuroSEODashboard />);
    const analysisButton = screen.getByText('Start Analysis').closest('button');
    expect(analysisButton).toBeDisabled();
  });

  test('enables the analysis button when required fields are filled', () => {
    render(<NeuroSEODashboard />);
    
    // Fill required fields
    screen.getByLabelText('Target URLs *').value = 'https://example.com';
    screen.getByLabelText('Target Keywords *').value = 'seo';

    const analysisButton = screen.getByText('Start Analysis').closest('button');
    expect(analysisButton).not.toBeDisabled();
  });

  test('shows a loading state when analysis is running', async () => {
    render(<NeuroSEODashboard />);
    
    // Fill form and start analysis
    screen.getByLabelText('Target URLs *').value = 'https://example.com';
    screen.getByLabelText('Target Keywords *').value = 'seo';
    const analysisButton = screen.getByText('Start Analysis').closest('button');
    analysisButton.click();

    // Check for loading state
    await screen.findByText(/Running NeuroSEO™ Analysis/);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays an error message if analysis fails', async () => {
    // Mock a failed API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Test error' }),
      })
    );

    render(<NeuroSEODashboard />);
    
    // Fill form and start analysis
    screen.getByLabelText('Target URLs *').value = 'https://example.com';
    screen.getByLabelText('Target Keywords *').value = 'seo';
    const analysisButton = screen.getByText('Start Analysis').closest('button');
    analysisButton.click();

    // Check for error message
    await screen.findByText(/Test error/);
  });

  test('displays the analysis report upon successful completion', async () => {
    // Mock a successful API response
    const mockReport = {
      overallScore: 85,
      timestamp: new Date().toISOString(),
      keyInsights: [],
      crawlResults: [],
      visibilityAnalysis: [],
      trustAnalysis: [],
      actionableTasks: [],
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReport),
      })
    );

    render(<NeuroSEODashboard />);
    
    // Fill form and start analysis
    screen.getByLabelText('Target URLs *').value = 'https://example.com';
    screen.getByLabelText('Target Keywords *').value = 'seo';
    const analysisButton = screen.getByText('Start Analysis').closest('button');
    analysisButton.click();

    // Check for report display
    await screen.findByText('NeuroSEO™ Analysis Results');
    expect(screen.getByText('85/100')).toBeInTheDocument();
  });
});
