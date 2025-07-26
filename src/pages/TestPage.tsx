import React from 'react';
import { EmailTest } from '@/components/EmailTest';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Test Page Working! ✅
        </h1>
        <p className="text-muted-foreground mb-6">
          If you can see this page, the basic React app is working correctly.
        </p>
        
        {/* Email Test Component */}
        <EmailTest />
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Environment Info:</h2>
            <p>Node Environment: {import.meta.env.MODE}</p>
            <p>Base URL: {import.meta.env.BASE_URL}</p>
            <p>Dev Mode: {import.meta.env.DEV ? 'Yes' : 'No'}</p>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Browser Info:</h2>
            <p>User Agent: {navigator.userAgent}</p>
            <p>Language: {navigator.language}</p>
            <p>Online: {navigator.onLine ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 