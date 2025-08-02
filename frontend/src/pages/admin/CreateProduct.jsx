import React, { useRef } from 'react';
import { Upload, X, Plus, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useProduct, useProductForm, useImageUpload } from '../../hooks/userProduct';

const CreateProductPage = () => {
  const { categories, creating, error, uploadProgress, createProduct, clearError } = useProduct();
  const { 
    formData, 
    formErrors, 
    isDirty, 
    updateField, 
    updateImages, 
    validateForm, 
    resetForm 
  } = useProductForm();
  const { 
    previewImages, 
    uploadErrors, 
    handleImageSelect, 
    removeImage, 
    clearImages 
  } = useImageUpload();
  
  const fileInputRef = useRef(null);

  const metalTypes = [
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'diamond', label: 'Diamond' },
    { value: 'other', label: 'Other' }
  ];

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const validFiles = handleImageSelect(files);
      updateImages([...formData.images, ...validFiles]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (imageId) => {
    removeImage(imageId);
    const updatedImages = formData.images.filter((_, index) => index !== imageId);
    updateImages(updatedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createProduct(formData);
      // Success - reset form
      resetForm();
      clearImages();
    } catch (error) {
      // Error is handled by context
      console.error('Product creation failed:', error);
    }
  };

  const handleReset = () => {
    resetForm();
    clearImages();
    clearError();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#523A28' }}>
            Create New Product
          </h1>
          
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#D0B49F', borderColor: '#A47551' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" style={{ borderColor: '#523A28' }}></div>
              <span style={{ color: '#523A28' }}>Uploading product...</span>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: '#A47551',
                  width: `${uploadProgress}%` 
                }}
              ></div>
            </div>
            <p className="text-sm mt-1" style={{ color: '#523A28' }}>{uploadProgress}% complete</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#D0B49F' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#523A28' }}>
                  Basic Information
                </h2>

                {/* Product Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      borderColor: formErrors.name ? '#ef4444' : '#A47551',
                      focusRingColor: '#A47551'
                    }}
                    placeholder="Enter product name"
                    maxLength={200}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Short Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Short Description *
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => updateField('shortDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors resize-none"
                    style={{ 
                      borderColor: formErrors.shortDescription ? '#ef4444' : '#A47551',
                      focusRingColor: '#A47551'
                    }}
                    placeholder="Brief product description"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {formErrors.shortDescription && (
                      <p className="text-red-500 text-sm">{formErrors.shortDescription}</p>
                    )}
                    <span className="text-sm" style={{ color: '#A47551' }}>
                      {formData.shortDescription.length}/500
                    </span>
                  </div>
                </div>

                {/* Full Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Full Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors resize-none"
                    style={{ 
                      borderColor: formErrors.description ? '#ef4444' : '#A47551',
                      focusRingColor: '#A47551'
                    }}
                    placeholder="Detailed product description"
                    maxLength={2000}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {formErrors.description && (
                      <p className="text-red-500 text-sm">{formErrors.description}</p>
                    )}
                    <span className="text-sm" style={{ color: '#A47551' }}>
                      {formData.description.length}/2000
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      borderColor: formErrors.price ? '#ef4444' : '#A47551',
                      focusRingColor: '#A47551'
                    }}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => updateField('stock', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      borderColor: formErrors.stock ? '#ef4444' : '#A47551',
                      focusRingColor: '#A47551'
                    }}
                    placeholder="0"
                    min="0"
                  />
                  {formErrors.stock && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>
                  )}
                </div>
              </div>
            </div>

            {/*  Category & Metal Info */}
            <div className="space-y-6">
              <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#D0B49F' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#523A28' }}>
                  Category & Material
                </h2>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      borderColor: formErrors.category ? '#ef4444' : '#A47551',
                      focusRingColor: '#A47551'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                  )}
                </div>

                {/* Metal Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Metal Type *
                  </label>
                  <select
                    value={formData.metalType}
                    onChange={(e) => updateField('metalType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      borderColor: formErrors.metalType ? '#ef4444' : '#A47551',
                      focusRingColor: '#A47551'
                    }}
                  >
                    <option value="">Select Metal Type</option>
                    {metalTypes.map((metal) => (
                      <option key={metal.value} value={metal.value}>
                        {metal.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.metalType && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.metalType}</p>
                  )}
                </div>

                {/* Metal Purity */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Metal Purity *
                  </label>
                  <input
                    type="text"
                    value={formData.metalPurity}
                    onChange={(e) => updateField('metalPurity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      borderColor: formErrors.metalPurity ? '#ef4444' : '#A47551',
                      focusRingColor: '#A47551'
                    }}
                    placeholder="e.g., 18K, 925, PT950"
                  />
                  {formErrors.metalPurity && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.metalPurity}</p>
                  )}
                </div>
              </div>

              {/* Product Images */}
              <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#D0B49F' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#523A28' }}>
                  Product Images *
                </h2>

                {/* Upload Area */}
                <div className="mb-4">
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: '#A47551' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="mx-auto mb-3" style={{ color: '#A47551' }} size={48} />
                    <p className="text-lg font-medium mb-2" style={{ color: '#523A28' }}>
                      Click to upload images
                    </p>
                    <p className="text-sm" style={{ color: '#A47551' }}>
                      Maximum 5 images, up to 5MB each
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#A47551' }}>
                      Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Upload Errors */}
                {uploadErrors.length > 0 && (
                  <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                    {uploadErrors.map((error, index) => (
                      <p key={index} className="text-red-600 text-sm">{error}</p>
                    ))}
                  </div>
                )}

                {/* Form Errors */}
                {formErrors.images && (
                  <p className="text-red-500 text-sm mb-4">{formErrors.images}</p>
                )}

                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {previewImages.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image.id)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded" style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}>
                            Main Image
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add more images button */}
                    {previewImages.length < 5 && (
                      <div
                        className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ borderColor: '#A47551' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus style={{ color: '#A47551' }} size={32} />
                      </div>
                    )}
                  </div>
                )}

               
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={handleReset}
              disabled={creating || !isDirty}
              className="px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'white',
                color: '#A47551',
                border: `2px solid #A47551`
              }}
            >
              Reset Form
            </button>
            
            <button
              type="submit"
              disabled={creating || Object.keys(formErrors).length > 0}
              className="px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ 
                backgroundColor: '#523A28',
                color: '#E4D4C8'
              }}
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                  Creating Product...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Create Product
                </>
              )}
            </button>
          </div>

          {/* Form Status */}
          <div className="mt-4 text-center">
            {isDirty && (
              <p className="text-sm" style={{ color: '#A47551' }}>
                You have unsaved changes
              </p>
            )}
          </div>
        </form>

        {/* Success Message */}
        {uploadProgress === 100 && (
          <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3" style={{ backgroundColor: '#523A28' }}>
            <CheckCircle className="text-green-400" size={20} />
            <p style={{ color: '#E4D4C8' }}>Product created successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProductPage;