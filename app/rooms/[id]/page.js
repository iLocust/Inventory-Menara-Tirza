'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import ItemForm from '../../../components/ItemForm';
import TransferForm from '../../../components/TransferForm';
import History from '../../../components/History';

export default function RoomDetail() {
  const params = useParams();
  const roomId = params.id;
  
  const [room, setRoom] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userSchoolId, setUserSchoolId] = useState(null);
  const [userName, setUserName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Fetch user role and school
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserRole(data.user.role || '');
            setUserSchoolId(data.user.school_id || null);
            setUserName(data.user.name || '');
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    
    fetchUserInfo();
  }, []);
  
  // Function to check if user has permission to manage this room
  const canManageRoom = () => {
    if (!room) return false;
    return userRole === 'admin' || 
      (userRole === 'kepala_sekolah' && parseInt(userSchoolId) === room.school_id);
  };

  // Handle item deletion
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        // Get current user ID
        let userId = null;
        try {
          const userResponse = await fetch('/api/auth/me');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.user) {
              userId = userData.user.id;
            }
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
        
        await fetch(`/api/items/${id}?user_id=${userId}`, {
          method: 'DELETE',
        });
        
        // Refresh the item list
        await fetchRoomData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  // Handle editing an item
  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  // Handle transfer modal
  const handleTransferClick = (item) => {
    setSelectedItem(item);
    setShowTransferModal(true);
  };

  // Handle transfer submission
  const handleTransferSubmit = async (formData) => {
    try {
      // Ensure user_id is included if not already set
      if (!formData.user_id) {
        try {
          const userResponse = await fetch('/api/auth/me');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.user) {
              formData.user_id = userData.user.id;
            }
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        return;
      }
      
      // Close the modal
      setShowTransferModal(false);
      setSelectedItem(null);
      
      // Refresh the item list
      await fetchRoomData();
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Failed to transfer item. Please try again.');
    }
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (formData) => {
    try {
      // Get current user ID
      let userId = null;
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.user) {
            userId = userData.user.id;
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
      
      // Make sure the item is assigned to the current room
      const itemData = {
        ...formData,
        room_id: parseInt(roomId),
        user_id: userId
      };
      
      if (editItem) {
        // Update existing item
        await fetch(`/api/items/${editItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });
      } else {
        // Create new item
        await fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });
      }
      
      // Reset form state
      setEditItem(null);
      setShowForm(false);
      
      // Refresh the item list
      await fetchRoomData();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  // Function to fetch room data that can be called to refresh
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
  
  // Call fetchRoomData when roomId changes
  useEffect(() => {
    if (roomId) {
      fetchRoomData();
      // Fetch categories for the form
      const fetchCategories = async () => {
        try {
          const categoriesRes = await fetch('/api/reference/categories');
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };
      fetchCategories();
    }
  }, [roomId]);
  
  // Refresh data when returning to the page (via window focus event)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && roomId) {
        // Refresh the room data
        fetchRoomData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
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
      <Breadcrumb />
      <header className="bg-white shadow rounded-lg">
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

          {/* Add Item Form */}
          {showForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-4">
                {editItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <ItemForm
                initialData={{...editItem, room_id: parseInt(roomId)}}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditItem(null);
                  setShowForm(false);
                }}
                rooms={[room]} // Only show the current room
                categories={categories}
                selectedSchool={room.school_id.toString()}
              />
            </div>
          )}
          
          {/* Items in Room */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Items in Room</h3>
              {canManageRoom() && (
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    setEditItem(null);
                    setShowForm(!showForm);
                  }}
                >
                  {showForm ? 'Cancel' : 'Add New Item'}
                </button>
              )}
            </div>
            <div className="border-t border-gray-200">
              {items.length === 0 ? (
                <div className="px-4 py-5 text-center">
                  <p className="text-gray-500">No items found in this room.</p>
                  {canManageRoom() && (
                    <Link href={`/items?room_id=${roomId}`} className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                      Add an item →
                    </Link>
                  )}
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
                        {canManageRoom() && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
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
                          {canManageRoom() && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleTransferClick(item)}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                >
                                  Transfer
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
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

      {/* History Section */}
      {canManageRoom() && (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Item History</h3>
              </div>
              <div className="border-t border-gray-200">
                <History roomId={roomId} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Transfer Modal */}
      {showTransferModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
            <h3 className="text-lg font-semibold mb-4">Transfer Item</h3>
            <TransferForm
              item={selectedItem}
              onSubmit={handleTransferSubmit}
              onCancel={() => {
                setShowTransferModal(false);
                setSelectedItem(null);
              }}
              schoolId={room?.school_id}
            />
          </div>
        </div>
      )}
    </div>
  );
}