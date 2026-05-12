import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';

// Mock API
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Authentication Flow', () => {
  describe('Login Component', () => {
    it('should render login form', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Check for validation messages
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });
});
