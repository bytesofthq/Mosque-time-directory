import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ImageIcon, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

const Gallery = () => {
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const fetchMosqueImage = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mosque/my-mosque');
      const { mosque } = response.data;
      if (mosque) {
        setCurrentImage(mosque.mosqueImage || '');
      }
    } catch (error) {
      console.error('Error fetching mosque image:', error);
      showAlert('Failed to retrieve current mosque image.');
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

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
      console.error('Error uploading image:', error);
      showAlert(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1200';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-teal-600" />
          <span>Mosque Gallery & Images</span>
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          Upload a high-quality picture representing your mosque to exhibit on the public website.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CURRENT ACTIVE IMAGE CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Current Profile Photo</h3>
          <div className="h-64 w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
            <img
              src={getImageUrl(currentImage)}
              alt="Mosque Main Profile"
              className="w-full h-full object-cover"
            />
            {!currentImage && (
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
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Upload New Photo</h3>
            
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
                <span className="text-[10px] text-slate-400 mt-1">Suppors JPEG, JPG, PNG, WEBP max 5MB</span>
              </div>

              {filePreview && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Upload Preview:</span>
                  <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
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
                  className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-1"
                >
                  {uploadLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Upload & Apply'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Gallery;
