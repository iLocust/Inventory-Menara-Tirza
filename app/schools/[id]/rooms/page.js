'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import RoomForm from '../../../../components/RoomForm';
import Breadcrumb from '../../../../components/Breadcrumb';

export default function SchoolRoomsPage() {
  const params = useParams();
  const schoolId = params.id;
  
  const [school, setSchool] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomStatuses, setRoomStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);

  // Fetch school and rooms data
  useEffect(() => {
    const fetchData = async () => {
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
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (schoolId) {
      fetchData();
    }
  }, [schoolId]);

  // Handle room deletion
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this room? This will also delete all items in this room.')) {
      try {
        await fetch(`/api/rooms/${id}`, {
          method: 'DELETE',
        });
        
        // Refresh the room list
        const updatedRoomsRes = await fetch(`/api/rooms?school_id=${schoolId}`);
        const updatedRoomsData = await updatedRoomsRes.json();
        setRooms(updatedRoomsData);
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  // Handle editing a room
  const handleEdit = (room) => {
    setEditRoom(room);
    setShowForm(true);
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (formData) => {
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
      setShowForm(false);
      
      // Refresh the room list
      const updatedRoomsRes = await fetch(`/api/rooms?school_id=${schoolId}`);
      const updatedRoomsData = await updatedRoomsRes.json();
      setRooms(updatedRoomsData);
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

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
            <p className="text-gray-500">Loading rooms...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
              <p className="mt-1 text-sm text-gray-500">School: {school.name}</p>
            </div>
            <div className="flex space-x-2">
              <Link href={`/schools/${schoolId}`}>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                  Back to School
                </button>
              </Link>
              <Link href="/schools">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                  All Schools
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">All Rooms in {school.name}</h2>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setEditRoom(null);
                setShowForm(!showForm);
              }}
            >
              {showForm ? 'Cancel' : 'Add New Room'}
            </button>
          </div>

          {showForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-4">
                {editRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <RoomForm
                initialData={{...editRoom, school_id: parseInt(schoolId)}}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditRoom(null);
                  setShowForm(false);
                }}
                schools={[school]}
                users={users}
                roomTypes={roomTypes}
                roomStatuses={roomStatuses}
              />
            </div>
          )}

          {rooms.length === 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <p className="text-gray-500">No rooms found for this school. Add your first room!</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.type_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(room.status_id)}`}>
                          {room.status_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.responsible_user_name || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/rooms/${room.id}/items`}>
                            <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                              Items
                            </button>
                          </Link>
                          <button
                            onClick={() => handleEdit(room)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}