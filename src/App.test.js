import { render, screen } from '@testing-library/react';
import App from './App';

test('renders BioSync home', () => {
  render(<App />);
  expect(screen.getByText(/BioSync conecta descarte/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /ver mapa/i })).toBeInTheDocument();
});
