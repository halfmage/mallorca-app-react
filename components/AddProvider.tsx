import React, { useState } from 'react'

const AddProvider = ({ onSuccess, mainCategories }) => {
  const [formData, setFormData] = useState({
    name: '',
    maincategory_id: '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
  
    try {
      const preparedFormData = new FormData()
      preparedFormData.append('name', formData.name)
      preparedFormData.append('mainCategoryId', formData.maincategory_id)
      for (let i = 0; i < imageFiles.length; i++) {
        preparedFormData.append('images', imageFiles[i])
      }

      await fetch(
          '/api/provider',
          {
            method: 'POST',
            body: preparedFormData
          }
      )
  
      setSuccessMessage('Provider added successfully!');
      setFormData({
        name: '',
        maincategory_id: '',
      });
      setImageFiles([]);
      setUploadProgress(0);

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
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
        <div className="mb-4">
          <input
            name="name"
            placeholder="Provider Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <select
            name="maincategory_id"
            value={formData.maincategory_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select Category</option>
            {mainCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full"
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Adding Provider...' : 'Add Provider'}
        </button>
      </form>
    </div>
  );
};

export default AddProvider;
