'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '../../components/Breadcrumb';

export default function SchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userSchoolId, setUserSchoolId] = useState(null);
  
  // Fetch the current user's role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserRole(data.user.role || '');
            setUserSchoolId(data.user.school_id || null);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    
    fetchUserRole();
  }, []);
  
  // Check if user can edit a specific school
  const canEditSchool = (schoolId) => {
    // Admin can edit any school
    if (userRole === 'admin') return true;
    
    // Kepala sekolah can only edit their own school
    if (userRole === 'kepala_sekolah') {
      if (!userSchoolId) return false; // If not assigned to a school, can't edit any
      return parseInt(userSchoolId) === schoolId;
    }
    
    // Other roles cannot edit schools
    return false;
  };

  // Fetch schools from the API
  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schools');
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSchools();
  }, []);

  // Note: Edit and Delete functionality moved to individual school pages

  return (
    <div>
      <Breadcrumb />
      <header className="bg-white shadow rounded-lg">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">All Schools</h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading schools...</p>
            </div>
          ) : schools.length === 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <p className="text-gray-500">No schools found.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {schools.map((school) => (
                  <li key={school.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-blue-600">
                          <Link href={`/schools/${school.id}`}>
                            {school.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{school.address}</p>
                        <div className="mt-2 flex space-x-4 text-sm">
                          {school.email && (
                            <p className="text-gray-500">
                              <span className="font-medium">Email:</span> {school.email}
                            </p>
                          )}
                          {school.phone && (
                            <p className="text-gray-500">
                              <span className="font-medium">Phone:</span> {school.phone}
                            </p>
                          )}
                        </div>
                        {school.kepala_sekolah_name && (
                          <p className="mt-2 text-sm text-gray-500">
                            <span className="font-medium">Kepala Sekolah:</span> {school.kepala_sekolah_name}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {/* <Link href={`/schools/${school.id}/rooms`}>
                          <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                            Rooms
                          </button>
                        </Link> */}
                        {/* <Link href={`/schools/${school.id}`}>
                          <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                            Details
                          </button>
                        </Link> */}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}