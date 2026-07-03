import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const PrayerTimings = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });

  // Timings form state matching DB schema structure
  const [timings, setTimings] = useState({
    Fajr: { azan: '', jamaat: '' },
    Zuhr: { azan: '', jamaat: '' },
    Asr: { azan: '', jamaat: '' },
    Maghrib: { azan: '', jamaat: '' },
    Isha: { azan: '', jamaat: '' },
    Jumma: { khutbah: '', jamaat: '' }
  });

  const fetchTimings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mosque/my-mosque/timings');
      if (response.data) {
        setTimings({
          Fajr: { azan: response.data.Fajr?.azan || '', jamaat: response.data.Fajr?.jamaat || '' },
          Zuhr: { azan: response.data.Zuhr?.azan || '', jamaat: response.data.Zuhr?.jamaat || '' },
          Asr: { azan: response.data.Asr?.azan || '', jamaat: response.data.Asr?.jamaat || '' },
          Maghrib: { azan: response.data.Maghrib?.azan || '', jamaat: response.data.Maghrib?.jamaat || '' },
          Isha: { azan: response.data.Isha?.azan || '', jamaat: response.data.Isha?.jamaat || '' },
          Jumma: { khutbah: response.data.Jumma?.khutbah || '', jamaat: response.data.Jumma?.jamaat || '' }
        });
      }
    } catch (error) {
      console.error('Error fetching timings:', error);
      showAlert('Failed to load prayer timings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimings();
  }, []);

  const showAlert = (message, type = 'error') => {
    setAlert({ show: true, message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'error' });
    }, 5000);
  };

  const handleTimeChange = (prayer, field, value) => {
    setTimings((prev) => ({
      ...prev,
      [prayer]: {
        ...prev[prayer],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await api.put('/mosque/my-mosque/timings', timings);
      showAlert('Prayer timings updated successfully!', 'success');
      fetchTimings();
    } catch (error) {
      console.error('Error updating timings:', error);
      showAlert(error.response?.data?.message || 'Failed to update prayer timings.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  const prayersList = [
    { label: 'Fajr', key: 'Fajr', hasAzan: true },
    { label: 'Zuhr', key: 'Zuhr', hasAzan: true },
    { label: 'Asr', key: 'Asr', hasAzan: true },
    { label: 'Maghrib', key: 'Maghrib', hasAzan: true },
    { label: 'Isha', key: 'Isha', hasAzan: true }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-600" />
          <span>Update Prayer Timings</span>
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1 flex-shrink-0">
          Modify the Azan and congregation (Jamaat) timings for your mosque.
        </p>
      </div>

      {/* Alert Banner */}
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

      {/* Table Form card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Prayer Name</th>
                  <th scope="col" className="px-6 py-4">Azan / Khutbah Time</th>
                  <th scope="col" className="px-6 py-4">Jamaat Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700 text-sm">
                
                {/* 5 Daily Prayers */}
                {prayersList.map((p) => (
                  <tr key={p.key} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                      {p.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        placeholder="e.g. 05:15 AM"
                        value={timings[p.key]?.azan}
                        onChange={(e) => handleTimeChange(p.key, 'azan', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white w-44"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        placeholder="e.g. 05:40 AM"
                        value={timings[p.key]?.jamaat}
                        onChange={(e) => handleTimeChange(p.key, 'jamaat', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white w-44"
                      />
                    </td>
                  </tr>
                ))}

                {/* Jumma Prayers */}
                <tr className="bg-teal-50/10 hover:bg-teal-50/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-extrabold text-teal-900">
                    Jumma (Friday)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Khutbah Time</span>
                      <input
                        type="text"
                        placeholder="e.g. 01:00 PM"
                        value={timings.Jumma?.khutbah}
                        onChange={(e) => handleTimeChange('Jumma', 'khutbah', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700 bg-white w-44"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Jamaat Time</span>
                      <input
                        type="text"
                        placeholder="e.g. 01:30 PM"
                        value={timings.Jumma?.jamaat}
                        onChange={(e) => handleTimeChange('Jumma', 'jamaat', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700 bg-white w-44"
                      />
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              type="submit"
              disabled={submitLoading}
              className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-teal-700/5 transition-all disabled:opacity-50"
            >
              {submitLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Save Timings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrayerTimings;
