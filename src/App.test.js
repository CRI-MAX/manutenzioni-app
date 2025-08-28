import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main dashboard title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Gestione Interventi/i);
  expect(titleElement).toBeInTheDocument();
});