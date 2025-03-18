'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ItemForm from '../../components/ItemForm';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [schools, setSchools] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Filters
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch items with filters
  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = '/api/items';
      const params = new URLSearchParams();
      
      if (selectedRoom) {
        params.append('room_id', selectedRoom);
      } else if (selectedSchool) {
        params.append('school_id', selectedSchool);
      }
      
      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reference data
  const fetchReferenceData = async () => {
    try {
      // Fetch schools
      const schoolsRes = await fetch('/api/schools');
      const schoolsData = await schoolsRes.json();
      setSchools(schoolsData);
      
      // Fetch rooms based on selected school
      let roomsUrl = '/api/rooms';
      if (selectedSchool) {
        roomsUrl += `?school_id=${selectedSchool}`;
      }
      const roomsRes = await fetch(roomsUrl);
      const roomsData = await roomsRes.json();
      setRooms(roomsData);
      
      // Fetch categories
      const categoriesRes = await fetch('/api/reference/categories');
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchReferenceData();
    fetchItems();
  }, []);

  // Fetch items when filters change
  useEffect(() => {
    fetchItems();
  }, [selectedSchool, selectedRoom, selectedCategory]);

  // Fetch rooms when selected school changes
  useEffect(() => {
    if (selectedSchool) {
      fetch(`/api/rooms?school_id=${selectedSchool}`)
        .then(res => res.json())
        .then(data => {
          setRooms(data);
          // Clear room selection if the selected room is not in this school
          if (selectedRoom) {
            const roomExists = data.some(room => room.id === parseInt(selectedRoom));
            if (!roomExists) {
              setSelectedRoom('');
            }
          }
        })
        .catch(err => console.error('Error fetching rooms:', err));
    } else {
      // If no school is selected, fetch all rooms
      fetch('/api/rooms')
        .then(res => res.json())
        .then(data => setRooms(data))
        .catch(err => console.error('Error fetching rooms:', err));
    }
  }, [selectedSchool]);

  // Handle item deletion
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`/api/items/${id}`, {
          method: 'DELETE',
        });
        fetchItems(); // Refresh the list
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

  // Handle form submission (create/update)
  const handleFormSubmit = async (formData) => {
    try {
      if (editItem) {
        // Update existing item
        await fetch(`/api/items/${editItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new item
        await fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      // Reset form state and refresh data
      setEditItem(null);
      setShowForm(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Items</h1>
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
              
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Category
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full md:w-48 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
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
                initialData={editItem}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditItem(null);
                  setShowForm(false);
                }}
                rooms={rooms}
                categories={categories}
                selectedSchool={selectedSchool}
              />
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <p className="text-gray-500">No items found with the current filters. Add your first item!</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
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
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.category_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.room_name}</div>
                        <div className="text-xs text-gray-500">{item.school_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.condition}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/transfers?item_id=${item.id}`}>
                            <button className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                              Transfer
                            </button>
                          </Link>
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          >
                            Edit
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
        </div>
      </div>
    </div>
  );
}