'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RoomForm from '../../components/RoomForm';
import Breadcrumb from '../../components/Breadcrumb';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [users, setUsers] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomStatuses, setRoomStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState('');

  // Fetch rooms and reference data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch rooms, filtering by school if selected
      let roomsUrl = '/api/rooms';
      if (selectedSchool) {
        roomsUrl += `?school_id=${selectedSchool}`;
      }
      const roomsRes = await fetch(roomsUrl);
      const roomsData = await roomsRes.json();
      setRooms(roomsData);
      
      // Fetch schools for filtering
      const schoolsRes = await fetch('/api/schools');
      const schoolsData = await schoolsRes.json();
      setSchools(schoolsData);
      
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

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [selectedSchool]);

  // Handle room deletion
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this room? This will also delete all items in this room.')) {
      try {
        await fetch(`/api/rooms/${id}`, {
          method: 'DELETE',
        });
        fetchData(); // Refresh the list
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
      if (editRoom) {
        // Update existing room
        await fetch(`/api/rooms/${editRoom.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new room
        await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      // Reset form state and refresh data
      setEditRoom(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  // Get status badge color based on status_id
  const getStatusBadgeColor = (statusId) => {
    switch (statusId) {
      case 1: return 'bg-green-100 text-green-800'; // Available
      case 2: return 'bg-yellow-100 text-yellow-800'; // Maintenance
      case 3: return 'bg-red-100 text-red-800'; // Unavailable
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <Breadcrumb />
      <header className="bg-white shadow rounded-lg">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="w-full md:w-64">
              <label htmlFor="school-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by School
              </label>
              <select
                id="school-filter"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Schools</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
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
                initialData={editRoom}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditRoom(null);
                  setShowForm(false);
                }}
                schools={schools}
                users={users}
                roomTypes={roomTypes}
                roomStatuses={roomStatuses}
              />
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <p className="text-gray-500">
                  {selectedSchool 
                    ? "No rooms found for the selected school. Add a new room!" 
                    : "No rooms found. Add your first room!"}
                </p>
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
                      School
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
                        <div className="text-sm text-gray-900">{room.school_name}</div>
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