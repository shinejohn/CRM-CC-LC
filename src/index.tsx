import React from 'react';
import './index.css';
import { render } from 'react-dom';
import { AppProvider } from './providers/AppProvider';
import { AppRouter } from './AppRouter';

render(
  <AppProvider>
    <AppRouter />
  </AppProvider>,
  document.getElementById('root')
);