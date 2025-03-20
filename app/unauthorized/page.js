'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Access Denied</h1>
        <p className="mb-6">You do not have permission to access this page.</p>
        <div className="flex flex-col space-y-4">
          <Link 
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
