import { test, expect } from '@playwright/test';
import { useAuth } from '../../src/context/AuthContext';
import { useSubscription } from '../../src/hooks/useSubscription';
import { render, screen } from '@testing-library/react';
import MobileNav from '../../src/components/mobile-nav';

// Mocks
jest.mock('../../src/context/AuthContext');
jest.mock('../../src/hooks/useSubscription');

const mockUseAuth = useAuth as jest.Mock;
const mockUseSubscription = useSubscription as jest.Mock;

describe('MobileNav Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseAuth.mockReturnValue({ user: null, role: null });
    mockUseSubscription.mockReturnValue({ subscription: null });
  });

  test('renders a loading state initially', () => {
    render(<MobileNav />);
    expect(screen.getByLabelText('Loading menu')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading menu')).toBeDisabled();
  });

  test('renders the menu button for an unauthenticated user after hydration', () => {
    // Simulate hydrated state
    jest.spyOn(require('react'), 'useState').mockImplementationOnce(() => [true, jest.fn()]);
    
    render(<MobileNav />);
    expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument();
  });

  test('opens and closes the mobile navigation menu', () => {
    render(<MobileNav />);
    const menuButton = screen.getByLabelText('Toggle mobile menu');
    
    // Open menu
    menuButton.click();
    expect(screen.getByTestId('enhanced-mobile-nav')).toBeVisible();
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // Close menu by clicking overlay
    screen.getByTestId('overlay').click();
    expect(screen.queryByTestId('enhanced-mobile-nav')).not.toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('displays user information when authenticated', () => {
    mockUseAuth.mockReturnValue({ 
      user: { email: 'test@example.com' }, 
      role: 'starter' 
    });
    mockUseSubscription.mockReturnValue({ 
      subscription: { tier: 'starter' } 
    });

    render(<MobileNav />);
    const menuButton = screen.getByLabelText('Toggle mobile menu');
    menuButton.click();

    expect(screen.getByText('test@example.com')).toBeVisible();
    expect(screen.getByText(/starter/i)).toBeVisible();
  });

  test('passes correct props to EnhancedMobileNav', () => {
    mockUseAuth.mockReturnValue({ user: {}, role: 'admin' });
    mockUseSubscription.mockReturnValue({ subscription: { tier: 'enterprise' } });

    const EnhancedMobileNav = require('../../src/components/enhanced-app-nav').EnhancedMobileNav;
    const mockEnhancedNav = jest.fn();
    EnhancedMobileNav.mockImplementation(mockEnhancedNav);

    render(<MobileNav />);
    screen.getByLabelText('Toggle mobile menu').click();

    expect(mockEnhancedNav).toHaveBeenCalledWith(
      expect.objectContaining({
        userTier: 'enterprise',
        isAdmin: true,
      }),
      expect.anything()
    );
  });
});
