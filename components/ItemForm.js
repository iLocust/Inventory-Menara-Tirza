'use client';

import { useState, useEffect } from 'react';

const initialFormState = {
  name: '',
  category_id: '',
  room_id: '',
  quantity: 1,
  condition: 'Good',
  acquisition_date: '',
  notes: ''
};

export default function ItemForm({ initialData, onSubmit, onCancel, rooms, categories, selectedSchool }) {
  const [formData, setFormData] = useState(initialFormState);
  const [filteredRooms, setFilteredRooms] = useState([]);

  // If initialData (for editing) is provided, update the form state
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category_id: initialData.category_id || '',
        room_id: initialData.room_id || '',
        quantity: initialData.quantity || 1,
        condition: initialData.condition || 'Good',
        acquisition_date: initialData.acquisition_date || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData]);

  // Filter rooms based on selected school
  useEffect(() => {
    if (rooms) {
      if (selectedSchool) {
        setFilteredRooms(rooms.filter(room => room.school_id === parseInt(selectedSchool)));
      } else {
        setFilteredRooms(rooms);
      }
    }
  }, [rooms, selectedSchool]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert number inputs to numbers
    if (type === 'number' || name === 'category_id' || name === 'room_id') {
      setFormData(prev => ({ ...prev, [name]: Number(value) || '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Item Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          />
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
            Category*
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            value={formData.category_id}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="room_id" className="block text-sm font-medium text-gray-700">
            Room*
          </label>
          <select
            id="room_id"
            name="room_id"
            required
            value={formData.room_id}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          >
            <option value="">Select a room</option>
            {filteredRooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.school_name} - {room.name} ({room.type_name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity*
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="0"
            required
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          />
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          >
            <option value="New">New</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>

        <div>
          <label htmlFor="acquisition_date" className="block text-sm font-medium text-gray-700">
            Acquisition Date
          </label>
          <input
            type="date"
            id="acquisition_date"
            name="acquisition_date"
            value={formData.acquisition_date || ''}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          ></textarea>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          {initialData ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </form>
  );
}