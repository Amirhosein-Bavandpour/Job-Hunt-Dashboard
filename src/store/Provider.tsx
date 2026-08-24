'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';

// Client provider that mounts the single Redux store (incl. RTK Query).
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
