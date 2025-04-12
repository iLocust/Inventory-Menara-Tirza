import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'School Inventory System',
  description: 'A simple CRUD app for managing school inventory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is logged in by looking for session cookie
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session_id');
  const isLoggedIn = !!sessionCookie;
  
  // No need to check for specific paths - we only need to know if user is logged in
  // If not logged in, don't show navbar/sidebar (makes login page clean)
  
  return (
    <html lang="en">
      <body className={inter.className}>
        {!isLoggedIn ? (
          // Login page layout (no navbar/sidebar)
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        ) : (
          // Authenticated page layout (with navbar/sidebar)
          <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 md:ml-16 transition-all duration-300">
              <Navbar />
              <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}