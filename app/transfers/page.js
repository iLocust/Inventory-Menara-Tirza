'use client';

import { useState, useEffect } from 'react';
import TransferForm from '../../components/TransferForm';
import TransferHistory from '../../components/TransferHistory';
import Breadcrumb from '../../components/Breadcrumb';

export default function TransfersPage() {
  const [showForm, setShowForm] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch schools for filtering
        const schoolsRes = await fetch('/api/schools');
        const schoolsData = await schoolsRes.json();
        setSchools(schoolsData);

        // Fetch rooms, filtering by school if selected
        let roomsUrl = '/api/rooms';
        if (selectedSchool) {
          roomsUrl += `?school_id=${selectedSchool}`;
        }
        const roomsRes = await fetch(roomsUrl);
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching reference data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSchool]);

  // Handle form submission for transfer
  const handleTransferSubmit = async (formData) => {
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error transferring items');
      }

      alert('Transfer completed successfully!');
      setShowForm(false);
    } catch (error) {
      console.error('Error transferring items:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <Breadcrumb />
      <header className="bg-white shadow rounded-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Transfers</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
              <div>
                <label htmlFor="school-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by School
                </label>
                <select
                  id="school-filter"
                  value={selectedSchool}
                  onChange={(e) => {
                    setSelectedSchool(e.target.value);
                    setSelectedRoom(''); // Reset room selection when school changes
                  }}
                  className="block w-full md:w-48 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Schools</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="room-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Room
                </label>
                <select
                  id="room-filter"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="block w-full md:w-48 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Rooms</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.school_name} - {room.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'New Transfer'}
            </button>
          </div>

          {showForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Transfer Items</h2>
              <TransferForm
                onSubmit={handleTransferSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Transfer History</h2>
            <TransferHistory
              roomId={selectedRoom || null}
              itemId={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}