import React from 'react';
import { Compass } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center">
        {/* Brand */}
        <div className="flex items-center justify-center space-x-2 text-teal-700 font-extrabold text-lg">
          <Compass className="h-6 w-6 text-teal-600" />
          <span>
            Mosque<span className="text-secondary-600">Directory</span>
          </span>
        </div>

        {/* Copyright */}
        <p className="mt-4 sm:mt-0 text-slate-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Mosque Directory. All rights reserved.
        </p>

        {/* Quick info */}
        <div className="mt-4 sm:mt-0 text-slate-400 text-sm">
          <span>Serving the Ummah with accurate timings</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
