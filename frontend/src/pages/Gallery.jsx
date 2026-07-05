import React, { useState, useEffect } from 'react';
import api, { BACKEND_URL } from '../utils/api';
import { ImageIcon, Upload, X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

const Gallery = () => {
  const [currentImage, setCurrentImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });

  // Main Profile Image State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  // Gallery Images State
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const fetchMosqueImage = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mosque/my-mosque');
      const { mosque } = response.data;
      if (mosque) {
        setCurrentImage(mosque.mosqueImage || '');
        setGalleryImages(mosque.images || []);
      }
    } catch (error) {
      console.error('Error fetching mosque images:', error);
      showAlert('Failed to retrieve mosque images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMosqueImage();
  }, []);

  const showAlert = (message, type = 'error') => {
    setAlert({ show: true, message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'error' });
    }, 5000);
  };

  // Main profile photo file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // Gallery multi-files change
  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedGalleryFiles(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...previews]);
    }
  };

  const removeSelectedGalleryFile = (index) => {
    setSelectedGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Main photo upload submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return showAlert('Please select an image file to upload.');
    }

    setUploadLoading(true);
    const dataToSend = new FormData();
    dataToSend.append('image', selectedFile);

    try {
      const response = await api.post('/mosque/my-mosque/upload-image', dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showAlert('Mosque profile image updated successfully!', 'success');
      setCurrentImage(response.data.imageUrl);
      setSelectedFile(null);
      setFilePreview('');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      showAlert(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Gallery photos upload submission
  const handleGalleryUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedGalleryFiles.length === 0) {
      return showAlert('Please select at least one gallery image file to upload.');
    }

    setGalleryLoading(true);
    const dataToSend = new FormData();
    selectedGalleryFiles.forEach(file => {
      dataToSend.append('images', file);
    });

    try {
      const response = await api.post('/mosque/my-mosque/upload-gallery', dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showAlert('Gallery images uploaded successfully!', 'success');
      setGalleryImages(response.data.images);
      setSelectedGalleryFiles([]);
      setGalleryPreviews([]);
    } catch (error) {
      console.error('Error uploading gallery:', error);
      showAlert(error.response?.data?.message || 'Failed to upload gallery images. Please try again.');
    } finally {
      setGalleryLoading(false);
    }
  };

  // Delete gallery image
  const handleDeleteGalleryImage = async (imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this image from your gallery?')) return;

    try {
      const response = await api.delete('/mosque/my-mosque/gallery', {
        data: { imageUrl }
      });
      showAlert('Gallery image deleted successfully!', 'success');
      setGalleryImages(response.data.images);
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      showAlert(error.response?.data?.message || 'Failed to delete image. Please try again.');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return `${BACKEND_URL}/uploads/default_mosque.png`;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${BACKEND_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-teal-600" />
          <span>Mosque Gallery & Images</span>
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          Upload and manage photos representing your mosque to exhibit on the public website.
        </p>
      </div>

      {/* Alert Block */}
      {alert.show && (
        <div className={`p-4 rounded-xl flex items-start space-x-2.5 text-sm font-semibold transition-all shadow-sm ${
          alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        }`}>
          {alert.type === 'error' ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* SECTION 1: PROFILE IMAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-200/80 pb-8 animate-fadeIn">
        
        {/* CURRENT ACTIVE IMAGE CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Current Profile Photo</h3>
          <div className="h-60 w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
            <img
              src={getImageUrl(currentImage)}
              alt="Mosque Main Profile"
              className="w-full h-full object-cover"
            />
            {currentImage === '' && (
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white text-xs font-bold uppercase">
                Using System Placeholder
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            This image acts as the primary thumbnail and background header displayed on public search maps and detail views.
          </p>
        </div>

        {/* UPLOAD FORM CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Upload Profile Photo</h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer relative bg-slate-50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="h-10 w-10 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-600">Drag file or click to browse</span>
                <span className="text-[10px] text-slate-400 mt-1">Supports JPEG, JPG, PNG, WEBP max 5MB</span>
              </div>

              {filePreview && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Upload Preview:</span>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview('');
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full shadow"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={uploadLoading || !selectedFile}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-1 font-bold shadow-teal-700/10 active:scale-95"
                >
                  {uploadLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Upload Profile Pic'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* SECTION 2: PHOTO GALLERY */}
      <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Additional Gallery Photos</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Add multiple images showing interior, exterior, wudu area, and library spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* UPLOAD MULTIPLE GALLERY CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Add Gallery Photos</h3>
              
              <form onSubmit={handleGalleryUploadSubmit} className="space-y-5">
                <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer relative bg-slate-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFilesChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="h-10 w-10 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-600">Select Multiple Files</span>
                  <span className="text-[10px] text-slate-400 mt-1">Upload multiple photos at once (Max 5MB each)</span>
                </div>

                {galleryPreviews.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block font-bold">Previews to Upload ({galleryPreviews.length}):</span>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-150">
                      {galleryPreviews.map((url, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                          <img src={url} alt={`Upload Preview ${index}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeSelectedGalleryFile(index)}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-0.5 rounded-full shadow"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={galleryLoading || selectedGalleryFiles.length === 0}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-1 font-bold shadow-teal-700/10 active:scale-95"
                  >
                    {galleryLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Upload Gallery Photos'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* GALLERY IMAGES GRID */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider block mb-4">Active Gallery ({galleryImages.length})</h3>
            
            {galleryImages.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-150">
                <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Gallery Images Uploaded</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto p-1">
                {galleryImages.map((imgUrl, index) => (
                  <div key={index} className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                    <img
                      src={getImageUrl(imgUrl)}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleDeleteGalleryImage(imgUrl)}
                      className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-all duration-200 rounded-xl"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                      <span className="text-[10px] font-bold uppercase">Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default Gallery;
