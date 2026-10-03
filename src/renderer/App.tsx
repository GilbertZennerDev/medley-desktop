import React, { useEffect, useState } from 'react';
import { Medley } from './features/library/Medley';

export function App() {
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).medleyApi) {
      setApiReady(true);
    }
  }, []);

  if (!apiReady) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return <Medley />;
}
