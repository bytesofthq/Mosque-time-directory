import React from "react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import logo from "../assets/logo.png";
import bsLogo from "../assets/bs-logo.png";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 mt-auto animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile: Stacked Layout, Desktop: Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          
          {/* Brand Section - Full width on mobile */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Salah Directory Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="text-xl font-bold text-teal-700">
                Salah<span className="text-emerald-600">Directory</span>
              </span>
            </div>
            
            <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
              Helping the Ummah with accurate prayer timings and mosque information.
            </p>
            
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>Lucknow, Uttar Pradesh, India</span>
            </div>
          </div>

          {/* Quick Links - Centered on mobile */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Links
            </h3>
            <ul className="space-y-1.5 text-sm text-center sm:text-left">
              <li>
                <a href="/" className="text-slate-600 hover:text-teal-700 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/nearby-mosques" className="text-slate-600 hover:text-teal-700 transition-colors">
                  Find Mosques
                </a>
              </li>
              <li>
                <a href="/register-mosque" className="text-slate-600 hover:text-teal-700 transition-colors">
                  Register Mosque
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section - Centered on mobile */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Contact Us
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:bytesoft@gmail.com"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-700 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors flex-shrink-0">
                  <Mail className="h-3.5 w-3.5 text-teal-700" />
                </div>
                <span className="text-xs sm:text-sm">bytesoft@gmail.com</span>
              </a>
              
              <a
                href="tel:+918810743304"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-700 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors flex-shrink-0">
                  <Phone className="h-3.5 w-3.5 text-teal-700" />
                </div>
                <span className="text-xs sm:text-sm">+91 88107 43304</span>
              </a>
              
              <a
                href="tel:+918009874351"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-700 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors flex-shrink-0">
                  <Phone className="h-3.5 w-3.5 text-teal-700" />
                </div>
                <span className="text-xs sm:text-sm">+91 80098 74351</span>
              </a>
            </div>
          </div>

          {/* Development Section - Full width on mobile */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col items-center sm:items-start">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Development
            </h3>
            
            <a
              href="https://bytesoft.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-teal-200 hover:shadow-md transition-all duration-300 p-3 sm:p-4"
            >
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <img
                  src={bsLogo}
                  alt="Bytesoft Logo"
                  className="h-8 w-auto object-contain flex-shrink-0"
                />
                <div className="text-center sm:text-left">
                  <p className="text-xs text-slate-500">
                    Developed & Managed by
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-slate-700 group-hover:text-teal-700 transition-colors">
                    Bytesoft
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Innovative Software Solutions
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Bar - Better mobile spacing */}
        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-3">
          <p className="text-xs sm:text-sm text-slate-500 text-center">
            &copy; {new Date().getFullYear()} Salah Directory. All rights reserved.
          </p>
          
          <p className="text-xs text-slate-400 text-center">
            Serving the Ummah with accurate prayer timings.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;