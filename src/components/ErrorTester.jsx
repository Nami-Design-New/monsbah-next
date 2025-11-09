'use client';

import { useState } from 'react';

export default function ErrorTester() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Testing error boundary!');
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Error Page Tester</h2>
      <p>Click the button below to trigger an error and see the error page:</p>
      <button
        onClick={() => setShouldError(true)}
        style={{
          padding: '1rem 2rem',
          fontSize: '1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        🔥 Trigger Error
      </button>
    </div>
  );
}
