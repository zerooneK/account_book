import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

// Test consumer component
function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage
    window.localStorage.clear();
    // Reset document element classes
    document.documentElement.className = '';
  });

  it('renders children and starts with dark theme by default', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    const themeVal = screen.getByTestId('theme-val');
    expect(themeVal.textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme when toggle is clicked', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    const toggleBtn = screen.getByTestId('toggle-btn');
    const themeVal = screen.getByTestId('theme-val');

    expect(themeVal.textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click to toggle (from dark to light)
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(themeVal.textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem('theme')).toBe('light');

    // Click to toggle back (from light to dark)
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(themeVal.textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });

  it('initializes from localStorage if a preference exists', () => {
    window.localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    const themeVal = screen.getByTestId('theme-val');
    expect(themeVal.textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
