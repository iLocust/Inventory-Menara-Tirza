'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-xl font-bold">
              School Inventory System
            </Link>
            
            {/* Desktop menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Dashboard
                </Link>
                <Link href="/schools" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Schools
                </Link>
                <Link href="/rooms" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Rooms
                </Link>
                <Link href="/items" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Inventory
                </Link>
                <Link href="/transfers" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Transfers
                </Link>
                <Link href="/users" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Users
                </Link>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link href="/schools" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Schools
            </Link>
            <Link href="/rooms" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rooms
            </Link>
            <Link href="/items" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Inventory
            </Link>
            <Link href="/transfers" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Transfers
            </Link>
            <Link href="/users" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Users
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}