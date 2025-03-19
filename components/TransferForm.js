'use client';

import { useState, useEffect } from 'react';

export default function TransferForm({ item, onSubmit, onCancel, schoolId }) {
  const [formData, setFormData] = useState({
    item_id: item?.id || '',
    source_room_id: item?.room_id || '',
    destination_room_id: '',
    quantity: 1,
    notes: ''
  });
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxQuantity, setMaxQuantity] = useState(item?.quantity || 0);

  // Fetch rooms in the same school
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/rooms?school_id=${schoolId}`);
        if (!res.ok) throw new Error('Failed to fetch rooms');
        const data = await res.json();
        
        // Filter out the current room
        const availableRooms = data.filter(room => room.id !== item.room_id);
        setRooms(availableRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (schoolId) {
      fetchRooms();
    }
  }, [schoolId, item]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers
    if (type === 'number' || name === 'destination_room_id') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'quantity' ? Math.min(Number(value) || 1, maxQuantity) : Number(value) || '' 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) {
    return <p className="text-center py-4">Loading rooms...</p>;
  }

  if (rooms.length === 0) {
    return (
      <div className="p-4">
        <p className="text-yellow-600 font-medium">No other rooms available in this school for transfer.</p>
        <div className="mt-4 flex justify-end">
          <button 
            type="button" 
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Item
          </label>
          <div className="mt-1 py-2 px-3 bg-gray-100 rounded-md">
            {item.name} (Current quantity: {item.quantity})
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Room
          </label>
          <div className="mt-1 py-2 px-3 bg-gray-100 rounded-md">
            {item.room_name}
          </div>
        </div>

        <div>
          <label htmlFor="destination_room_id" className="block text-sm font-medium text-gray-700">
            To Room *
          </label>
          <select
            id="destination_room_id"
            name="destination_room_id"
            required
            value={formData.destination_room_id}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          >
            <option value="">Select destination room</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name} ({room.type_name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity to Transfer *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            max={maxQuantity}
            required
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          />
          <p className="mt-1 text-sm text-gray-500">Maximum: {maxQuantity}</p>
        </div>

        <div>
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
            placeholder="Reason for transfer"
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
          Transfer Item
        </button>
      </div>
    </form>
  );
}