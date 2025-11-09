'use client';

import Link from 'next/link';

export default function GlobalError({ reset }) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#dc3545',
              marginBottom: '1rem'
            }}>
              Server Error (500)
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#6c757d',
              marginBottom: '1rem',
              lineHeight: '1.6'
            }}>
              Something went wrong on our server. We're working to fix the issue.
            </p>
            <p style={{ 
              fontSize: '1rem', 
              color: '#6c757d',
              marginBottom: '2rem',
              fontStyle: 'italic'
            }}>
              We apologize for the inconvenience. This is temporary and we're working to resolve it as soon as possible.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: '#0d6efd',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Try Again
              </button>
              <Link
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'inline-block'
                }}
              >
                Go to Homepage
              </Link>
            </div>
            <div style={{ 
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid #dee2e6',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/categories" style={{ color: '#0d6efd', textDecoration: 'none' }}>
                Browse Categories
              </Link>
              <span style={{ color: '#dee2e6' }}>•</span>
              <Link href="/companies" style={{ color: '#0d6efd', textDecoration: 'none' }}>
                Browse Companies
              </Link>
              <span style={{ color: '#dee2e6' }}>•</span>
              <Link href="/contact" style={{ color: '#0d6efd', textDecoration: 'none' }}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
