'use client';

import { useState, useEffect } from 'react';

export default function TransferForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: 1,
    from_room_id: '',
    to_room_id: '',
    transferred_by_user_id: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedFromRoom, setSelectedFromRoom] = useState(null);
  const [itemsInRoom, setItemsInRoom] = useState([]);
  const [maxQuantity, setMaxQuantity] = useState(0);
  
  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all rooms
        const roomsRes = await fetch('/api/rooms');
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
        
        // Fetch all users
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        setUsers(usersData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reference data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch items in the selected source room
  useEffect(() => {
    const fetchItemsInRoom = async () => {
      if (!formData.from_room_id) {
        setItemsInRoom([]);
        return;
      }
      
      try {
        const res = await fetch(`/api/items?room_id=${formData.from_room_id}`);
        const data = await res.json();
        setItemsInRoom(data.filter(item => item.quantity > 0));
      } catch (error) {
        console.error('Error fetching items in room:', error);
      }
    };
    
    fetchItemsInRoom();
  }, [formData.from_room_id]);
  
  // Update max quantity when item is selected
  useEffect(() => {
    if (formData.item_id) {
      const selectedItem = itemsInRoom.find(item => item.id === parseInt(formData.item_id));
      setMaxQuantity(selectedItem ? selectedItem.quantity : 0);
    } else {
      setMaxQuantity(0);
    }
  }, [formData.item_id, itemsInRoom]);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert number inputs to numbers
    if (type === 'number') {
      const numValue = Number(value);
      
      // Ensure quantity doesn't exceed available items
      if (name === 'quantity' && numValue > maxQuantity) {
        setFormData(prev => ({ ...prev, [name]: maxQuantity }));
      } else {
        setFormData(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="from_room_id" className="block text-sm font-medium text-gray-700">
            Source Room*
          </label>
          <select
            id="from_room_id"
            name="from_room_id"
            value={formData.from_room_id}
            onChange={handleChange}
            required
            className="input mt-1 w-full"
          >
            <option value="">Select source room</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.school_name} - {room.name} ({room.type_name})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="to_room_id" className="block text-sm font-medium text-gray-700">
            Destination Room*
          </label>
          <select
            id="to_room_id"
            name="to_room_id"
            value={formData.to_room_id}
            onChange={handleChange}
            required
            className="input mt-1 w-full"
          >
            <option value="">Select destination room</option>
            {rooms
              .filter(room => room.id !== parseInt(formData.from_room_id))
              .map(room => (
                <option key={room.id} value={room.id}>
                  {room.school_name} - {room.name} ({room.type_name})
                </option>
              ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="item_id" className="block text-sm font-medium text-gray-700">
            Item to Transfer*
          </label>
          <select
            id="item_id"
            name="item_id"
            value={formData.item_id}
            onChange={handleChange}
            required
            disabled={!formData.from_room_id}
            className="input mt-1 w-full"
          >
            <option value="">Select item</option>
            {itemsInRoom.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.quantity} available ({item.category_name})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity to Transfer* (Max: {maxQuantity})
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            max={maxQuantity}
            value={formData.quantity}
            onChange={handleChange}
            required
            disabled={!formData.item_id}
            className="input mt-1 w-full"
          />
        </div>
        
        <div>
          <label htmlFor="transferred_by_user_id" className="block text-sm font-medium text-gray-700">
            Transferred By
          </label>
          <select
            id="transferred_by_user_id"
            name="transferred_by_user_id"
            value={formData.transferred_by_user_id}
            onChange={handleChange}
            className="input mt-1 w-full"
          >
            <option value="">Select user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
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
            className="input mt-1 w-full"
            placeholder="Reason for transfer or additional details"
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.item_id || !formData.from_room_id || !formData.to_room_id || formData.quantity < 1}
          className="btn btn-primary"
        >
          Transfer Items
        </button>
      </div>
    </form>
  );
}