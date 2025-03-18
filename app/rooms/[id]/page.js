'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TransferHistory from '../../../components/TransferHistory';

export default function RoomDetail() {
  const params = useParams();
  const roomId = params.id;
  
  const [room, setRoom] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransferHistory, setShowTransferHistory] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
      try {
        // Fetch room details
        const roomRes = await fetch(`/api/rooms/${roomId}`);
        if (!roomRes.ok) {
          throw new Error('Room not found');
        }
        const roomData = await roomRes.json();
        setRoom(roomData);
        
        // Fetch items in this room
        const itemsRes = await fetch(`/api/items?room_id=${roomId}`);
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      } catch (error) {
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

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
            <p className="text-gray-500">Loading room information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Room Not Found</h2>
            <p className="text-gray-500 mb-4">The room you're looking for does not exist or has been deleted.</p>
            <Link href="/rooms">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Back to Rooms
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
              <p className="mt-1 text-sm text-gray-500">School: {room.school_name}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Link href={`/schools/${room.school_id}`}>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                  Back to School
                </button>
              </Link>
              <Link href="/rooms">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                  All Rooms
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Room details card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Room Information</h3>
              <span className={`px-3 py-1 ${getStatusBadgeColor(room.status_id)} rounded-full text-sm font-semibold`}>
                {room.status_name}
              </span>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Room Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {room.type_name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Building</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {room.building || 'Not specified'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Floor</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {room.floor || 'Not specified'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Responsible Person</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {room.responsible_user_name || 'Not assigned'}
                  </dd>
                </div>
                {room.notes && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {room.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Items in Room */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Items in Room</h3>
              <Link href={`/rooms/${roomId}/items`}>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Manage Items
                </button>
              </Link>
            </div>
            <div className="border-t border-gray-200">
              {items.length === 0 ? (
                <div className="px-4 py-5 text-center">
                  <p className="text-gray-500">No items found in this room.</p>
                  <Link href={`/items?room_id=${roomId}`} className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                    Add an item →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.category_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.condition}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link href={`/transfers?item_id=${item.id}`}>
                              <button className="text-green-600 hover:text-green-900 mr-4">
                                Transfer
                              </button>
                            </Link>
                            <Link href={`/items?editItem=${item.id}`}>
                              <button className="text-blue-600 hover:text-blue-900 mr-4">
                                Edit
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Transfer History Toggle */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Transfer History</h3>
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={() => setShowTransferHistory(!showTransferHistory)}
              >
                {showTransferHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>
            {showTransferHistory && (
              <div className="border-t border-gray-200 p-4">
                <TransferHistory roomId={roomId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}