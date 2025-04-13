'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import SchoolForm from '../../../components/SchoolForm';
import RoomForm from '../../../components/RoomForm';

export default function SchoolDetail() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.id;
  
  const [school, setSchool] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalItems: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userSchoolId, setUserSchoolId] = useState(null);
  
  // For room management
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomStatuses, setRoomStatuses] = useState([]);

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
  
  // Check if user has permission to delete schools (admin only)
  const canDeleteSchool = userRole === 'admin';
  
  // Check if user has permission to manage schools
  const canManageSchools = userRole === 'kepala_sekolah' || userRole === 'admin';
  
  // Check if user can edit a specific school
  const canEditSchool = (schoolId) => {
    // Admin can edit any school
    if (userRole === 'admin') return true;
    
    // Kepala sekolah can only edit their own school
    if (userRole === 'kepala_sekolah') {
      if (!userSchoolId) return false; // If not assigned to a school, can't edit any
      return parseInt(userSchoolId) === parseInt(schoolId);
    }
    
    // Other roles cannot edit schools
    return false;
  };

  // Check if user has permission to manage rooms in this school
  const canManageRooms = () => {
    if (!school) return false;
    return userRole === 'admin' || 
      (userRole === 'kepala_sekolah' && parseInt(userSchoolId) === parseInt(schoolId));
  };

  // Function to fetch all data
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
      
      // Fetch users for assignment
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData);
      
      // Fetch room types
      const typesRes = await fetch('/api/reference/room-types');
      const typesData = await typesRes.json();
      setRoomTypes(typesData);
      
      // Fetch room statuses
      const statusesRes = await fetch('/api/reference/room-statuses');
      const statusesData = await statusesRes.json();
      setRoomStatuses(statusesData);
    } catch (error) {
      console.error('Error fetching school data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle school form submission (update)
  const handleFormSubmit = async (formData) => {
    try {
      await fetch(`/api/schools/${schoolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      // Reset form state and refresh data
      setShowForm(false);
      fetchSchoolData();
    } catch (error) {
      console.error('Error saving school:', error);
    }
  };

  // Handle school deletion
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this school? This will also delete all rooms and items in this school.')) {
      try {
        await fetch(`/api/schools/${id}`, {
          method: 'DELETE',
        });
        router.push('/schools');
      } catch (error) {
        console.error('Error deleting school:', error);
      }
    }
  };

  // Handle room deletion
  const handleDeleteRoom = async (id) => {
    if (confirm('Are you sure you want to delete this room? This will also delete all items in this room.')) {
      try {
        await fetch(`/api/rooms/${id}`, {
          method: 'DELETE',
        });
        
        // Refresh the data
        fetchSchoolData();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  // Handle editing a room
  const handleEditRoom = (room) => {
    setEditRoom(room);
    setShowRoomForm(true);
  };

  // Handle room form submission (create/update)
  const handleRoomFormSubmit = async (formData) => {
    try {
      // Make sure the room is assigned to the current school
      const roomData = {
        ...formData,
        school_id: parseInt(schoolId)
      };
      
      if (editRoom) {
        // Update existing room
        await fetch(`/api/rooms/${editRoom.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(roomData),
        });
      } else {
        // Create new room
        await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(roomData),
        });
      }
      
      // Reset form state
      setEditRoom(null);
      setShowRoomForm(false);
      
      // Refresh data
      fetchSchoolData();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  // Load data on initial page load
  useEffect(() => {
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
            <div className="flex space-x-3">
              {canEditSchool(schoolId) && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                >
                  {showForm ? 'Cancel' : 'Edit School'}
                </button>
              )}
              {canDeleteSchool && (
                <button
                  onClick={() => handleDelete(schoolId)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Delete School
                </button>
              )}
              <Link href="/schools">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                  Back to Schools
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Edit School form */}
          {showForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-4">Edit School</h3>
              <SchoolForm
                initialData={school}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                userRole={userRole}
              />
            </div>
          )}
          
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

          {/* Add Room Form */}
          {showRoomForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-4">
                {editRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <RoomForm
                initialData={{...editRoom, school_id: parseInt(schoolId)}}
                onSubmit={handleRoomFormSubmit}
                onCancel={() => {
                  setEditRoom(null);
                  setShowRoomForm(false);
                }}
                schools={[school]} // Only show the current school
                users={users}
                roomTypes={roomTypes}
                roomStatuses={roomStatuses}
              />
            </div>
          )}
          
          {/* Rooms List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Rooms</h3>
              {canManageRooms() && (
                <button 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    setEditRoom(null);
                    setShowRoomForm(!showRoomForm);
                  }}
                >
                  {showRoomForm ? 'Cancel' : 'Add New Room'}
                </button>
              )}
            </div>
            <div className="border-t border-gray-200">
              {rooms.length === 0 ? (
                <div className="px-4 py-5 text-center">
                  <p className="text-gray-500">No rooms found for this school.</p>
                  {canManageRooms() && (
                    <p className="text-blue-600 hover:text-blue-800 mt-2 inline-block cursor-pointer"
                       onClick={() => {
                         setEditRoom(null);
                         setShowRoomForm(true);
                       }}>
                      Add a room →
                    </p>
                  )}
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
                        {canManageRooms() && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-gray-50">
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
                          {canManageRooms() && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {/* <Link href={`/rooms/${room.id}`}>
                                  <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                                    View
                                  </button>
                                </Link> */}
                                <button
                                  onClick={() => handleEditRoom(room)}
                                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteRoom(room.id)}
                                  className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}