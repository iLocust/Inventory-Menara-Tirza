'use client';

import { useState, useEffect } from 'react';

const initialFormState = {
  name: '',
  address: '',
  phone: '',
  email: '',
  kepala_sekolah_id: ''
};

export default function SchoolForm({ initialData, onSubmit, onCancel, userRole }) {
  const [formData, setFormData] = useState(initialFormState);
  const [kepalaSekolahOptions, setKepalaSekolahOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Kepala Sekolah users
  useEffect(() => {
    const fetchKepalaSekolah = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users?role=kepala_sekolah');
        if (response.ok) {
          const data = await response.json();
          setKepalaSekolahOptions(data);
        }
      } catch (error) {
        console.error('Error fetching kepala sekolah:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKepalaSekolah();
  }, []);

  // If initialData (for editing) is provided, update the form state
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        kepala_sekolah_id: initialData.kepala_sekolah_id || ''
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            School Name*
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
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          />
        </div>

        {userRole !== 'kepala_sekolah' ? (
          <div>
            <label htmlFor="kepala_sekolah_id" className="block text-sm font-medium text-gray-700">
              Kepala Sekolah
            </label>
            <select
              id="kepala_sekolah_id"
              name="kepala_sekolah_id"
              value={formData.kepala_sekolah_id}
              onChange={handleChange}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
            >
              <option value="">-- Pilih Kepala Sekolah --</option>
              {kepalaSekolahOptions.map(ks => (
                <option key={ks.id} value={ks.id}>{ks.name}</option>
              ))}
            </select>
            {loading && <p className="text-xs text-gray-500 mt-1">Loading kepala sekolah options...</p>}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kepala Sekolah
            </label>
            <p className="mt-1 text-sm text-gray-500">
              {initialData?.kepala_sekolah_name || "Tidak dapat mengubah Kepala Sekolah"}
            </p>
            <input type="hidden" name="kepala_sekolah_id" value={formData.kepala_sekolah_id} />
          </div>
        )}
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
          {initialData ? 'Update School' : 'Add School'}
        </button>
      </div>
    </form>
  );
}