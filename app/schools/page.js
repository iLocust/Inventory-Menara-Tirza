'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SchoolForm from '../../components/SchoolForm';
import Breadcrumb from '../../components/Breadcrumb';

export default function SchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSchool, setEditSchool] = useState(null);

  // Fetch schools from the API
  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schools');
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSchools();
  }, []);

  // Handle school deletion
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this school? This will also delete all rooms and items in this school.')) {
      try {
        await fetch(`/api/schools/${id}`, {
          method: 'DELETE',
        });
        fetchSchools(); // Refresh the list
      } catch (error) {
        console.error('Error deleting school:', error);
      }
    }
  };

  // Handle editing a school
  const handleEdit = (school) => {
    setEditSchool(school);
    setShowForm(true);
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (formData) => {
    try {
      if (editSchool) {
        // Update existing school
        await fetch(`/api/schools/${editSchool.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new school
        await fetch('/api/schools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      // Reset form state and refresh data
      setEditSchool(null);
      setShowForm(false);
      fetchSchools();
    } catch (error) {
      console.error('Error saving school:', error);
    }
  };

  return (
    <div>
      <Breadcrumb />
      <header className="bg-white shadow rounded-lg">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">All Schools</h2>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setEditSchool(null);
                setShowForm(!showForm);
              }}
            >
              {showForm ? 'Cancel' : 'Add New School'}
            </button>
          </div>

          {showForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-4">
                {editSchool ? 'Edit School' : 'Add New School'}
              </h3>
              <SchoolForm
                initialData={editSchool}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditSchool(null);
                  setShowForm(false);
                }}
              />
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading schools...</p>
            </div>
          ) : schools.length === 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <p className="text-gray-500">No schools found. Add your first school!</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {schools.map((school) => (
                  <li key={school.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-blue-600">
                          <Link href={`/schools/${school.id}`}>
                            {school.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{school.address}</p>
                        <div className="mt-2 flex space-x-4 text-sm">
                          {school.email && (
                            <p className="text-gray-500">
                              <span className="font-medium">Email:</span> {school.email}
                            </p>
                          )}
                          {school.phone && (
                            <p className="text-gray-500">
                              <span className="font-medium">Phone:</span> {school.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/schools/${school.id}/rooms`}>
                          <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                            Rooms
                          </button>
                        </Link>
                        <button
                          onClick={() => handleEdit(school)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(school.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}