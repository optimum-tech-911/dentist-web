import React from 'react';

export function DebugInfo() {
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <p>React: {React.version}</p>
        <p>Mode: {import.meta.env.MODE}</p>
        <p>Dev: {import.meta.env.DEV ? 'Yes' : 'No'}</p>
        <p>Base: {import.meta.env.BASE_URL}</p>
        <p>URL: {window.location.href}</p>
        <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
      </div>
    </div>
  );
} 