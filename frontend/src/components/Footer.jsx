import React from 'react';
import logo from '../assets/logo.png';
import bsLogo from '../assets/bs-logo.png';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-8 mt-auto animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center">
        {/* Brand */}
        <div className="flex items-center justify-center space-x-2 text-teal-700 font-extrabold text-lg">
          <img
            src={logo}
            alt="Salah Directory Logo"
            className="w-auto object-contain"
            style={{ height: '32px' }}
          />
          <span>
            Salah<span className="text-secondary-600">Directory</span>
          </span>
        </div>

        {/* Copyright */}
        <div className="mt-4 sm:mt-0 text-slate-400 text-sm font-medium space-y-0.5">
          <p>&copy; {new Date().getFullYear()} Salah Directory. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">Serving the Ummah with accurate timings</p>
        </div>

        {/* Developed by Bytesoft */}
        <div className="mt-4 sm:mt-0 flex items-center justify-center space-x-1.5 text-slate-400 text-xs font-semibold bg-slate-50 py-1.5 px-3.5 rounded-xl border border-slate-100/80">
          <span>Developed & Managed by</span>
          <a
            href="https://bytesoft.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-teal-700 transition-colors"
          >
            <img
              src={bsLogo}
              alt="Bytesoft Logo"
              className="w-auto object-contain"
              style={{ height: '24px' }}
            />
            <span className="text-slate-700 font-bold">Bytesoft</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
