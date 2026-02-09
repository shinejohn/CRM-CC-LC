import React from 'react';
import { AppProviders } from './AppProviders';
import { AppRouter } from './AppRouter';

export function CommandCenterApp() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default CommandCenterApp;

