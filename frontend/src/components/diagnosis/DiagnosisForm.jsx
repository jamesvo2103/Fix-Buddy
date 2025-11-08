import { useState } from 'react';
import { validateImageFile, fileToBase64 } from '../../utils/imageUpload';

export default function DiagnosisForm({ onSubmit, error }) {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [location, setLocation] = useState('');
  const [imageError, setImageError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    const base64 = await fileToBase64(file);
    setImage(base64);
    setImagePreview(URL.createObjectURL(file));
    setImageError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!itemName && !image) {
      setImageError('Please provide item name or upload an image');
      return;
    }

    const formData = {
      itemName,
      description,
      image,
      experienceLevel,
      location
    };

    await onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Diagnose Your Item</h1>
      <p className="text-gray-600 mb-6">Upload a photo or describe the item you need help repairing</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Upload Photo</label>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-input"
            />
            <label htmlFor="image-input" className="cursor-pointer block">
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" className="h-32 w-32 mx-auto object-cover rounded" />
                  <p className="mt-2 text-sm text-blue-600">Click to change image</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                </div>
              )}
            </label>
          </div>
          {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g., Washing Machine, Toaster, Door Lock"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">What's wrong with it?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem... (e.g., doesn't turn on, making noise, leaking water)"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Experience Level</label>
          <div className="grid grid-cols-3 gap-4">
            {['beginner', 'intermediate', 'expert'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setExperienceLevel(level)}
                className={`py-2 px-4 rounded-lg font-semibold transition ${
                  experienceLevel === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Location (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Location (Optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or ZIP code (for nearby repair shops)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
        >
          Get Diagnosis 🔧
        </button>
      </form>
    </div>
  );
}
