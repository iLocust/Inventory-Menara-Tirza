import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';

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
        <div className="min-h-screen bg-gray-100">
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">School Inventory System</h1>
            </div>
          </header>
          <main className="container mx-auto py-8 px-4">{children}</main>
        </div>
      </body>
    </html>
  );
}