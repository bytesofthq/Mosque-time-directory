import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import bsLogo from "../assets/bs-logo.png";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-8 mt-auto animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8 text-center lg:text-left">

          {/* Brand */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex items-center space-x-2 text-teal-700 font-extrabold text-lg">
              <img
                src={logo}
                alt="Salah Directory Logo"
                className="w-auto object-contain"
                style={{ height: "32px" }}
              />
              <span>
                Salah<span className="text-secondary-600">Directory</span>
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Helping the Ummah with accurate prayer timings and mosque
              information.
            </p>
          </div>

          {/* Copyright */}
          <div className="text-slate-400 text-sm font-medium space-y-1">
            <p>
              &copy; {new Date().getFullYear()} Salah Directory. All rights
              reserved.
            </p>
            <p className="text-xs">
              Serving the Ummah with accurate timings.
            </p>
            <p className="pt-1">
              <Link to="/download" className="text-xs text-teal-700 hover:underline font-semibold flex items-center justify-center lg:justify-start gap-1">
                📲 Download Mobile App
              </Link>
            </p>
          </div>

          {/* Contact + Developed By */}
          <div className="flex flex-col items-center lg:items-end gap-3">

            {/* Contact Info */}
            <div className="text-sm text-slate-600 space-y-1">
              <h3 className="font-semibold text-slate-800">Contact</h3>

              <p>
                📧{" "}
                <a
                  href="mailto:bytesoft@gmail.com"
                  className="hover:text-teal-700 transition-colors"
                >
                  bytesoft@gmail.com
                </a>
              </p>

              <p>
                📞{" "}
                <a
                  href="tel:+918810743304"
                  className="hover:text-teal-700 transition-colors"
                >
                  +91 88107 43304
                </a>
              </p>

              <p>
                📞{" "}
                <a
                  href="tel:+918009874351"
                  className="hover:text-teal-700 transition-colors"
                >
                  +91 80098 74351
                </a>
              </p>
            </div>

            {/* Developed by */}
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold bg-slate-50 py-2 px-4 rounded-xl border border-slate-100 hover:shadow-sm transition">
              <span>Developed & Managed by</span>

              <a
                href="https://bytesoft.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-teal-700 transition-colors"
              >
                <img
                  src={bsLogo}
                  alt="Bytesoft Logo"
                  className="w-auto object-contain"
                  style={{ height: "24px" }}
                />
                <span className="font-bold">Bytesoft</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;