'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userRole, setUserRole] = useState('');
  const sidebarRef = useRef(null);
  
  // Fetch current user's role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserRole(data.user.role || '');
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    
    fetchUserRole();
  }, [pathname]);
  
  // Add click outside detection
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && 
          !sidebarRef.current.contains(event.target) && 
          !event.target.closest('button[data-sidebar-toggle]')) {
        // If click is outside sidebar and not on the toggle button, collapse the sidebar
        setIsCollapsed(true);
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set sidebar to collapsed by default on all devices
  useEffect(() => {
    setIsCollapsed(true);
  }, []);

  // Define all menu items, both common and role-specific
  const allMenuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      roles: ['admin', 'kepala_sekolah', 'guru', 'staff', 'murid'] // Everyone can access dashboard
    },
    {
      title: 'Items',
      path: '/items',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      roles: ['admin', 'kepala_sekolah', 'guru', 'staff', 'murid'] // Everyone can view items
    },
    {
      title: 'Rooms',
      path: '/rooms',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      roles: ['admin', 'kepala_sekolah', 'guru', 'staff', 'murid'] // Everyone can view rooms
    },
    {
      title: 'Schools',
      path: '/schools',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      roles: ['admin', 'kepala_sekolah', 'guru', 'staff', 'murid'] // Everyone can view schools
    },
    {
      title: 'Users',
      path: '/users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      roles: ['admin'] // Only admin can manage users
    },
  ];
  
  // Filter menu items based on user's role
  const menuItems = allMenuItems.filter(item => {
    // If we don't know the user role yet, only show items that everyone can access
    if (!userRole) {
      return item.roles.includes('murid'); // Most restrictive role as default
    }
    return item.roles.includes(userRole);
  });

  // Toggle sidebar collapse on mobile
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        data-sidebar-toggle
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white focus:outline-none"
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? '-translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0 w-64'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && <h1 className="font-bold text-xl">Inventory</h1>}
          <button
            className="rounded-md p-1 hover:bg-gray-800 focus:outline-none ml-auto"
            onClick={toggleSidebar}
          >
            {isCollapsed ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        <nav className="mt-5">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.path}
                  className={`flex items-center py-3 px-4 ${
                    pathname === item.path ? 'bg-blue-700' : 'hover:bg-gray-800'
                  } transition-colors duration-200`}
                >
                  <span className="text-white">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3">{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
