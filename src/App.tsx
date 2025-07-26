import React from 'react';

// Ultra-simple component that will definitely work
const App = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '600' }}>
          🦷 UFSBD Hérault
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '1rem', opacity: 0.9 }}>
          Application is working!
        </p>
        <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '2rem' }}>
          If you can see this, React is loading correctly.
        </p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '2rem'
        }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Union Française pour la Santé Bucco-Dentaire
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>
            Section Hérault
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
