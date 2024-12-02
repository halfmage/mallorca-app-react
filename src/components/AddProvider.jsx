import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AddProvider = () => {
  const [formData, setFormData] = useState({
    name: '',
    maincategory_id: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch main categories
    const fetchMainCategories = async () => {
      const { data, error } = await supabase.from('maincategories').select('*');
      if (error) {
        console.error('Error fetching main categories:', error.message);
      } else {
        setMainCategories(data);
      }
    };

    fetchMainCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
  
    try {
      let imagePath = '';
  
      // Upload image if a file is selected
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('provider-images')
          .upload(fileName, imageFile);
  
        if (uploadError) {
          console.error('Error uploading image:', uploadError.message);
          setLoading(false);
          return;
        }
  
        // Save only the relative path (e.g., 1733066513790-portcalanova-01.jpg)
        imagePath = data.path;
      }
  
      // Insert provider into the database
      const { error } = await supabase.from('providers').insert([
        {
          name: formData.name,
          maincategory_id: formData.maincategory_id,
          image_url: imagePath, // Save relative path only
        },
      ]);
  
      if (error) {
        console.error('Error adding provider:', error.message);
      } else {
        setSuccessMessage('Provider added successfully!');
        setFormData({
          name: '',
          maincategory_id: '',
        });
        setImageFile(null);
      }
    } catch (err) {
      console.error('Error adding provider:', err.message);
    } finally {
      setLoading(false);
    }
  };  
  

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Add Provider</h2>
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Provider Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <select
          name="maincategory_id"
          value={formData.maincategory_id}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        >
          <option value="">Select Main Category</option>
          {mainCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Provider'}
        </button>
      </form>
    </div>
  );
};

export default AddProvider;
