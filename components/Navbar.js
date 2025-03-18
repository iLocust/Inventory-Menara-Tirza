'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-xl font-bold">
              School Inventory System
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User profile or other controls can go here */}
            <div className="relative">
              <button className="flex items-center focus:outline-none">
                <span className="hidden md:block mr-2">Admin User</span>
                <svg className="h-8 w-8 rounded-full bg-blue-500 p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}