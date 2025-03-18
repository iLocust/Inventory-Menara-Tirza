'use client';

import { useState, useEffect } from 'react';

const initialFormState = {
  name: '',
  school_id: '',
  status_id: 1, // Default to "Available"
  type_id: '',
  responsible_user_id: '',
  floor: '',
  building: '',
  notes: ''
};

export default function RoomForm({ initialData, onSubmit, onCancel, schools, users, roomTypes, roomStatuses }) {
  const [formData, setFormData] = useState(initialFormState);

  // If initialData (for editing) is provided, update the form state
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        school_id: initialData.school_id || '',
        status_id: initialData.status_id || 1,
        type_id: initialData.type_id || '',
        responsible_user_id: initialData.responsible_user_id || '',
        floor: initialData.floor || '',
        building: initialData.building || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert number inputs to numbers
    if (type === 'number' || name === 'school_id' || name === 'status_id' || name === 'type_id') {
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
            Room Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
            placeholder="e.g., Room 101, Science Lab"
          />
        </div>

        <div>
          <label htmlFor="school_id" className="block text-sm font-medium text-gray-700">
            School*
          </label>
          <select
            id="school_id"
            name="school_id"
            required
            value={formData.school_id}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          >
            <option value="">Select School</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type_id" className="block text-sm font-medium text-gray-700">
            Room Type*
          </label>
          <select
            id="type_id"
            name="type_id"
            required
            value={formData.type_id}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          >
            <option value="">Select Type</option>
            {roomTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status_id" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status_id"
            name="status_id"
            value={formData.status_id}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          >
            {roomStatuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="responsible_user_id" className="block text-sm font-medium text-gray-700">
            Responsible Teacher/Staff
          </label>
          <select
            id="responsible_user_id"
            name="responsible_user_id"
            value={formData.responsible_user_id}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          >
            <option value="">Select Responsible Person</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="building" className="block text-sm font-medium text-gray-700">
            Building
          </label>
          <input
            type="text"
            id="building"
            name="building"
            value={formData.building}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
            placeholder="e.g., Main Building, East Wing"
          />
        </div>

        <div>
          <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
            Floor
          </label>
          <input
            type="text"
            id="floor"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
            placeholder="e.g., 1, Ground, Basement"
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
            placeholder="Any additional information about this room"
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
          {initialData ? 'Update Room' : 'Add Room'}
        </button>
      </div>
    </form>
  );
}