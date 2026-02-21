import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sticker album header', () => {
  render(<App />);
  const heading = screen.getByText(/Wild World Sticker Album/i);
  expect(heading).toBeInTheDocument();
});

test('renders sticker tray', () => {
  render(<App />);
  const tray = screen.getByText(/Sticker Tray/i);
  expect(tray).toBeInTheDocument();
});

test('renders daily sticker pack', () => {
  render(<App />);
  // Either "Daily Sticker Pack" or "Come back tomorrow" should appear
  const packElement = screen.queryByText(/Daily Sticker Pack|Come back tomorrow/i);
  expect(packElement).toBeInTheDocument();
});
