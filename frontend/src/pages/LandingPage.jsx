import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {

  const generateMeetingCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-gray-900 flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-6 px-8 md:px-16 bg-white shadow-sm">
        <h1 className="text-3xl font-bold text-indigo-600">VConnect</h1>
        <div className="flex items-center gap-6">
          <Link to = {`/${generateMeetingCode()}`} className="text-gray-700 hover:text-indigo-600 transition font-medium">
            Join as Guest
          </Link>
          <Link to="/auth" className="text-gray-700 hover:text-indigo-600 transition font-medium">
            Register
          </Link>
          <Link to="/auth">
            <button className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition">
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* Main Section */}
      <main className="flex flex-1 flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24 py-12">
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg text-center md:text-left"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-800">
            <span className="text-indigo-600">Connect</span> with your <br /> loved ones
          </h2>
          <p className="mt-6 text-gray-600 text-lg">
            Close the distance with VConnect — enjoy high-quality video calls,
            anytime, anywhere.
          </p>

          <Link to="/auth">
            <button className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl text-lg font-medium hover:bg-indigo-700 transition shadow-md">
              Get Started
            </button>
          </Link>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative flex space-x-6 mt-12 md:mt-0"
        >
          <div className="w-56 h-[420px] md:w-64 md:h-[480px] bg-gray-200 rounded-3xl border border-gray-300 shadow-lg overflow-hidden rotate-[-6deg]">
            <img
              src="/Man.png"
              alt="Video Call Screen"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-56 h-[420px] md:w-64 md:h-[480px] bg-gray-200 rounded-3xl border border-gray-300 shadow-lg overflow-hidden rotate-[6deg]">
            <img
              src="/Woman.png"
              alt="Video Call Screen"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} VConnect. All rights reserved.
      </footer>
    </div>
  );
}
