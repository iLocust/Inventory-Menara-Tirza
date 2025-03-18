'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    schools: 0,
    rooms: 0,
    items: 0,
    users: 0,
    transfers: 0
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Get count of schools
        const schoolsRes = await fetch('/api/schools');
        const schoolsData = await schoolsRes.json();
        
        // Get count of rooms
        const roomsRes = await fetch('/api/rooms');
        const roomsData = await roomsRes.json();
        
        // Get count of items
        const itemsRes = await fetch('/api/items');
        const itemsData = await itemsRes.json();
        
        // Get count of users
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        
        // Get count of transfers
        const transfersRes = await fetch('/api/transfers');
        const transfersData = await transfersRes.json();
        
        setStats({
          schools: schoolsData.length,
          rooms: roomsData.length,
          items: itemsData.length,
          users: usersData.length,
          transfers: transfersData.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, href, color }) => (
    <Link href={href}>
      <div className={`bg-white overflow-hidden shadow rounded-lg ${color ? `border-t-4 border-${color}-500` : ''}`}>
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{value}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <StatCard 
              title="Schools" 
              value={stats.schools} 
              href="/schools" 
              color="blue"
              icon={
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            
            <StatCard 
              title="Rooms" 
              value={stats.rooms} 
              href="/rooms" 
              color="green"
              icon={
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              }
            />
            
            <StatCard 
              title="Inventory Items" 
              value={stats.items} 
              href="/items" 
              color="purple"
              icon={
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            />
            
            <StatCard 
              title="Users" 
              value={stats.users} 
              href="/users" 
              color="yellow"
              icon={
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            
            <StatCard 
              title="Transfers" 
              value={stats.transfers} 
              href="/transfers" 
              color="red"
              icon={
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              }
            />
          </div>
        </div>

        <div className="mt-8 px-4 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transfers</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {stats.transfers > 0 ? (
                <li className="px-6 py-4">
                  <Link href="/transfers" className="text-blue-600 hover:text-blue-800">
                    View all {stats.transfers} transfers →
                  </Link>
                </li>
              ) : (
                <li className="px-6 py-4 text-gray-500">
                  No transfers recorded yet
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}