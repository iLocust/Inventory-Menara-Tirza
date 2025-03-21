'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ItemForm from '../../../../components/ItemForm';
import TransferForm from '../../../../components/TransferForm';
import TransferHistory from '../../../../components/TransferHistory';
import Breadcrumb from '../../../../components/Breadcrumb';

export default function RoomItemsPage() {
  const params = useParams();
  const roomId = params.id;
  
  const [room, setRoom] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userSchoolId, setUserSchoolId] = useState(null);
  
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

  useEffect(() => {
    const fetchData = async () => {
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
        
        // Fetch categories for the form
        const categoriesRes = await fetch('/api/reference/categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchData();
    }
  }, [roomId]);

  // Handle item deletion
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`/api/items/${id}`, {
          method: 'DELETE',
        });
        
        // Refresh the item list
        const updatedItemsRes = await fetch(`/api/items?room_id=${roomId}`);
        const updatedItemsData = await updatedItemsRes.json();
        setItems(updatedItemsData);
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
      const updatedItemsRes = await fetch(`/api/items?room_id=${roomId}`);
      const updatedItemsData = await updatedItemsRes.json();
      setItems(updatedItemsData);
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Failed to transfer item. Please try again.');
    }
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (formData) => {
    try {
      // Make sure the item is assigned to the current room
      const itemData = {
        ...formData,
        room_id: parseInt(roomId)
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
      const updatedItemsRes = await fetch(`/api/items?room_id=${roomId}`);
      const updatedItemsData = await updatedItemsRes.json();
      setItems(updatedItemsData);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading items...</p>
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

  // If user doesn't have permission, show access denied
  if (!canManageRoom()) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-4">You don't have permission to manage items in this room.</p>
            <Link href={`/rooms/${roomId}`}>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Back to Room
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
              <h1 className="text-3xl font-bold text-gray-900">Items in {room.name}</h1>
              <p className="mt-1 text-sm text-gray-500">School: {room.school_name}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Link href={`/rooms/${roomId}`}>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                  Back to Room
                </button>
              </Link>
              <Link href={`/schools/${room.school_id}`}>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                  Back to School
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">All Items in Room</h2>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setEditItem(null);
                setShowForm(!showForm);
              }}
            >
              {showForm ? 'Cancel' : 'Add New Item'}
            </button>
          </div>

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

          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <p className="text-gray-500">No items found in this room. Add your first item!</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                    <tr key={item.id} className="hover:bg-gray-50">
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
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  schoolId={room.school_id}
                />
              </div>
            </div>
          )}
          
          {/* Transfer History Section */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Transfer History</h2>
            <TransferHistory roomId={roomId} />
          </div>
        </div>
      </div>
    </div>
  );
}