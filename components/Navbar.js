'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Handle clicks outside the dropdown
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    // Add event listener when dropdown is shown
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  // Create a function to fetch user info that can be reused
  const fetchUserInfo = async () => {
    try {
      // Add cache busting parameter to prevent caching
      const response = await fetch('/api/auth/me?_=' + new Date().getTime());
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserName(data.user.name || 'User');
          setUserRole(data.user.role || '');
        } else {
          // If no user data, reset to defaults
          setUserName('User');
          setUserRole('');
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch user info when component mounts
  useEffect(() => {
    fetchUserInfo();
  }, []);
  
  // Add an effect to update user info when the URL path changes
  // This ensures we refresh the user data after login/logout
  useEffect(() => {
    // Fetch user info when pathname changes (after navigation)
    fetchUserInfo();
    
    const handleRouteChange = () => {
      fetchUserInfo();
    };

    // Listen for when the component becomes visible
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleRouteChange);
      return () => window.removeEventListener('focus', handleRouteChange);
    }
  }, [pathname]); // Re-run when pathname changes

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Reset user state
        setUserName('User');
        setUserRole('');
        
        // Redirect to login page and force a refresh
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-xl font-bold">
              School Inventory System
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                className="flex items-center focus:outline-none"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="hidden md:inline-block mr-2">
                  <span className="font-medium">{userName}</span>
                  {userRole && (
                    <span className="ml-1 text-xs bg-blue-700 px-2 py-0.5 rounded-full">
                      {userRole.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  )}
                </span>
                <div className="h-8 w-8 rounded-full bg-white text-blue-600 p-1 flex items-center justify-center">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}