import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar />
          <div className="flex-1 ml-16 md:ml-16 xl:ml-64 transition-all duration-300">
            <Navbar />
            <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}