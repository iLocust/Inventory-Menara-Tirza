'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';

export default function SchoolDetail() {
  const params = useParams();
  const schoolId = params.id;
  
  const [school, setSchool] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalItems: 0
  });

  useEffect(() => {
    const fetchSchoolData = async () => {
      setLoading(true);
      try {
        // Fetch school details
        const schoolRes = await fetch(`/api/schools/${schoolId}`);
        if (!schoolRes.ok) {
          throw new Error('School not found');
        }
        const schoolData = await schoolRes.json();
        setSchool(schoolData);
        
        // Fetch rooms in this school
        const roomsRes = await fetch(`/api/rooms?school_id=${schoolId}`);
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
        
        // Calculate stats
        setStats({
          totalRooms: roomsData.length,
          totalItems: 0 // We'll need to sum up items later
        });
        
        // Fetch items count
        const itemsRes = await fetch(`/api/items?school_id=${schoolId}`);
        const itemsData = await itemsRes.json();
        setStats(prev => ({
          ...prev,
          totalItems: itemsData.length
        }));
      } catch (error) {
        console.error('Error fetching school data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (schoolId) {
      fetchSchoolData();
    }
  }, [schoolId]);

  // Get status badge color
  const getStatusBadgeColor = (statusId) => {
    switch (statusId) {
      case 1: return 'bg-green-100 text-green-800'; // Available
      case 2: return 'bg-yellow-100 text-yellow-800'; // Maintenance
      case 3: return 'bg-red-100 text-red-800'; // Unavailable
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading school information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600 mb-2">School Not Found</h2>
            <p className="text-gray-500 mb-4">The school you're looking for does not exist or has been deleted.</p>
            <Link href="/schools">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Back to Schools
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb />
      <header className="bg-white shadow rounded-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
            <Link href="/schools">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                Back to Schools
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* School details card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">School Information</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {school.address || 'Not provided'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Kepala Sekolah</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {school.kepala_sekolah_name || 'Not assigned'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {school.email || 'Not provided'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {school.phone || 'Not provided'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Rooms</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {stats.totalRooms}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Inventory Items</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {stats.totalItems}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Rooms List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Rooms</h3>
              <Link href={`/schools/${schoolId}/rooms`}>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  View All Rooms
                </button>
              </Link>
            </div>
            <div className="border-t border-gray-200">
              {rooms.length === 0 ? (
                <div className="px-4 py-5 text-center">
                  <p className="text-gray-500">No rooms found for this school.</p>
                  <Link href={`/rooms?school_id=${schoolId}`} className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                    Add a room →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Responsible
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rooms.slice(0, 5).map((room) => (
                        <tr key={room.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              <Link href={`/rooms/${room.id}`}>
                                {room.name}
                              </Link>
                            </div>
                            <div className="text-xs text-gray-500">
                              {room.building ? `${room.building}, ` : ''}
                              {room.floor ? `Floor ${room.floor}` : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {room.type_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(room.status_id)}`}>
                              {room.status_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {room.responsible_user_name || 'Not assigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link href={`/rooms/${room.id}/items`}>
                              <button className="text-blue-600 hover:text-blue-900 mr-4">
                                View Items
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {rooms.length > 5 && (
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <Link href={`/schools/${schoolId}/rooms`} className="text-blue-600 hover:text-blue-800">
                    View all {rooms.length} rooms →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}