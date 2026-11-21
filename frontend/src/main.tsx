import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { UiProvider } from './context/UiContext';
import { CartProvider } from './context/CartContext';
import './styles/tokens.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><UiProvider><CartProvider><App /></CartProvider></UiProvider></BrowserRouter></StrictMode>
);
