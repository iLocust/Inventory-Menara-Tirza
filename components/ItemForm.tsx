import React, { useState, useEffect } from 'react';

interface ItemFormProps {
  initialData?: Item;
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
}

export interface Item {
  id: number;
  name: string;
  category: string;
  quantity: number;
  location?: string;
  condition?: string;
  acquisition_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemFormData {
  name: string;
  category: string;
  quantity: number;
  location?: string;
  condition?: string;
  acquisition_date?: string;
}

const ItemForm: React.FC<ItemFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    category: '',
    quantity: 0,
    location: '',
    condition: '',
    acquisition_date: '',
  });

  // If editing an existing item, populate the form with its data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        quantity: initialData.quantity,
        location: initialData.location || '',
        condition: initialData.condition || '',
        acquisition_date: initialData.acquisition_date || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Item' : 'Add New Item'}
      </h2>
      
      <div className="mb-4">
        <label htmlFor="name" className="form-label">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="category" className="form-label">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="form-input"
          required
        >
          <option value="">Select a category</option>
          <option value="Furniture">Furniture</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Stationery">Stationery</option>
          <option value="Sports Equipment">Sports Equipment</option>
          <option value="Laboratory">Laboratory</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="quantity" className="form-label">
          Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="form-input"
          min="0"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="location" className="form-label">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="condition" className="form-label">
          Condition
        </label>
        <select
          id="condition"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          className="form-input"
        >
          <option value="">Select condition</option>
          <option value="New">New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="acquisition_date" className="form-label">
          Acquisition Date
        </label>
        <input
          type="date"
          id="acquisition_date"
          name="acquisition_date"
          value={formData.acquisition_date}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update' : 'Add'} Item
        </button>
      </div>
    </form>
  );
};

export default ItemForm;