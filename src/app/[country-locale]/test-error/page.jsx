'use client';

export const dynamic = 'force-dynamic';

export default function TestErrorPage() {
  // This will throw an error intentionally
  throw new Error('This is a test error to see the error page!');
   return <div>You should not see this</div>;
}
