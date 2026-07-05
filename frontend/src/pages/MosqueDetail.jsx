import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { BACKEND_URL } from '../utils/api';
import { 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  Check, 
  X, 
  ExternalLink, 
  ArrowLeft, 
  Clock,
  Compass,
  Megaphone,
  Info,
  ImageIcon
} from 'lucide-react';

const MosqueDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMosqueDetails = async () => {
      try {
        const response = await api.get(`/public/mosques/${id}`);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching mosque details:', err);
        setError(err.response?.data?.message || 'Failed to load mosque details');
      } finally {
        setLoading(false);
      }
    };

    fetchMosqueDetails();
  }, [id]);

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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="text-slate-500 font-semibold animate-pulse">Loading mosque details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-red-600 mb-2">Error Occurred</h3>
        <p className="text-slate-500 mb-6">{error || 'Mosque not found'}</p>
        <Link to="/" className="inline-flex items-center space-x-2 bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const { mosque, timings, announcements } = data;

  // Facilities config helper
  const facilitiesList = [
    { key: 'parking', label: 'Parking Area' },
    { key: 'wuduArea', label: 'Wudu Facilities' },
    { key: 'ladiesPrayer', label: 'Ladies Prayer Hall' },
    { key: 'wheelchairAccess', label: 'Wheelchair Access' },
    { key: 'madrasa', label: 'Madrasa Classes' },
    { key: 'library', label: 'Islamic Library' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Hero Banner Image */}
      <div className="relative h-96 w-full bg-slate-900 shadow-inner">
        <img
          src={getImageUrl(mosque.mosqueImage)}
          alt={mosque.mosqueName}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-slate-200 hover:text-white bg-black/45 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all mb-4 border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to directory</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            {mosque.mosqueName}
          </h1>
          <p className="text-teal-300 text-sm font-semibold tracking-wider uppercase mt-1">
            {mosque.area}, {mosque.city}
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns (Details & Timings & Announcements) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mosque About Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-teal-600" />
              <span>About the Masjid</span>
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
              {mosque.aboutMasjid || 'No description available for this mosque.'}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-sm">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs block">Address</span>
                <span className="text-slate-700 font-medium">{mosque.address}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs block">Area & City</span>
                <span className="text-slate-700 font-medium">
                  {mosque.area}, {mosque.city}, {mosque.state} - {mosque.pincode}
                </span>
              </div>
            </div>

            {/* Mosque Gallery Section */}
            {mosque.images && mosque.images.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 mt-8 animate-fadeIn">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-teal-600" />
                  <span>Photo Gallery</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mosque.images.map((imgUrl, index) => (
                    <div key={index} className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm cursor-zoom-in">
                      <img
                        src={getImageUrl(imgUrl)}
                        alt={`${mosque.mosqueName} gallery ${index + 1}`}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        onClick={() => window.open(getImageUrl(imgUrl), '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex">
              <a
                href={mosque.googleMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-teal-700/10 transition-all hover:translate-y-[-1px]"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Get Directions on Google Maps</span>
              </a>
            </div>
          </div>

          {/* Prayer Timings Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-teal-600" />
              <span>Prayer Timings</span>
            </h2>
            
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Prayer
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Azan Time
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Jamaat Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-sm">
                  {[
                    { name: 'Fajr', key: 'Fajr' },
                    { name: 'Zuhr', key: 'Zuhr' },
                    { name: 'Asr', key: 'Asr' },
                    { name: 'Maghrib', key: 'Maghrib' },
                    { name: 'Isha', key: 'Isha' },
                  ].map((prayer) => (
                    <tr key={prayer.key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                        {prayer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-teal-700">
                        {timings[prayer.key]?.azan || '--:--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                        {timings[prayer.key]?.jamaat || '--:--'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-emerald-800">
                      Jumma Khutbah
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-teal-700" colSpan={2}>
                      {timings.Jumma?.khutbah || '--:--'}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/60 hover:bg-emerald-50/80 transition-colors font-bold">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-emerald-900">
                      Jumma Jamaat
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-teal-800" colSpan={2}>
                      {timings.Jumma?.jamaat || '--:--'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {timings.updatedAt && (
              <p className="text-xs text-slate-400 font-medium mt-4 text-right">
                Timings last updated: {new Date(timings.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Announcements Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Megaphone className="h-5 w-5 text-teal-600" />
              <span>Announcements & Updates</span>
            </h2>

            {announcements.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-400 font-medium">No announcements published at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {announcements.map((ann) => (
                  <div key={ann._id} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row gap-5 hover:bg-slate-50/20 transition-all">
                    {ann.image && (
                      <div className="h-32 md:w-44 w-full flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden">
                        <img
                          src={ann.image.startsWith('http') ? ann.image : `${BACKEND_URL}${ann.image}`}
                          alt={ann.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(ann.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{ann.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {ann.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column (Facilities & Contact Info) */}
        <div className="space-y-8">
          
          {/* Facilities Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Masjid Facilities</h2>
            <ul className="space-y-3.5">
              {facilitiesList.map((item) => {
                const isAvailable = mosque.facilities?.[item.key];
                return (
                  <li key={item.key} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    {isAvailable ? (
                      <span className="flex items-center space-x-1 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>Available</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full text-xs">
                        <X className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>N/A</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Imam Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Contact Details</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="bg-teal-50 text-teal-600 p-3 rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Imam / Administration</span>
                  <span className="text-slate-800 font-bold text-base block mt-0.5">
                    {mosque.contact?.imamName || 'Not Disclosed'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 pt-3 border-t border-slate-50">
                <div className="bg-teal-50 text-teal-600 p-3 rounded-xl">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Contact Mobile</span>
                  {mosque.contact?.imamMobile ? (
                    <a
                      href={`tel:${mosque.contact.imamMobile}`}
                      className="text-teal-700 hover:text-teal-800 font-bold text-base block mt-0.5"
                    >
                      {mosque.contact.imamMobile}
                    </a>
                  ) : (
                    <span className="text-slate-800 font-bold text-base block mt-0.5">Not Disclosed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MosqueDetail;
