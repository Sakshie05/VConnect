import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Video, Users, Shield, Zap, Menu, X } from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const generateMeetingCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "Crystal Clear Video",
      description: "HD quality video calls with adaptive bitrate for smooth streaming"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Group Meetings",
      description: "Connect with multiple people simultaneously with ease"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "End-to-end encryption to keep your conversations safe"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Instant connection with minimal latency for real-time conversations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 text-gray-900 flex flex-col relative overflow-hidden">
     
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl top-1/3 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -bottom-48 left-1/3 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <nav className="relative z-20 flex justify-between items-center py-6 px-6 md:px-16 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            VConnect
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to={`/${generateMeetingCode()}`}
            className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
          >
            Join as Guest
          </Link>
          <Link
            to="/auth"
            className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
          >
            Register
          </Link>
          <Link to="/auth">
            <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
              Login
            </button>
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden relative z-10 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg">
          <div className="flex flex-col gap-4 px-6 py-6">
            <Link
              to={`/${generateMeetingCode()}`}
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Join as Guest
            </Link>
            <Link
              to="/auth"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300">
                Login
              </button>
            </Link>
          </div>
        </div>
      )}

      <main className="relative z-10 flex flex-1 flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24 py-12 md:py-20 gap-12">
        
        <div className="max-w-2xl text-center md:text-left space-y-8">
          <div className="inline-block">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              ✨ Now with HD Quality
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-gray-900">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Connect
            </span>{" "}
            with your
            <br />
            loved ones
          </h2>

          <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
            Close the distance with VConnect — enjoy high-quality video calls,
            crystal clear audio, and seamless connections, anytime, anywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link to="/auth">
              <button className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center">
                Get Started
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
            <Link to={`/${generateMeetingCode()}`}>
              <button className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl text-lg font-semibold hover:bg-indigo-50 hover:shadow-lg transition-all duration-300">
                Quick Join
              </button>
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-6 mt-8 md:mt-0">
          
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl"></div>

          <div className="relative w-56 h-[420px] md:w-64 md:h-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 rotate-[-8deg] hover:rotate-[-4deg] border-4 border-white">
            <img
              src="/Man.png"
              alt="Video Call Participant"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="relative w-56 h-[420px] md:w-64 md:h-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 rotate-[8deg] hover:rotate-[4deg] border-4 border-white">
            <img
              src="/Woman.png"
              alt="Video Call Participant"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="relative z-10 px-6 md:px-16 lg:px-24 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose VConnect?
            </h3>
            <p className="text-gray-600 text-lg">
              Everything you need for seamless video communication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 md:px-16 lg:px-24 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Connect?
          </h3>
          <p className="text-indigo-100 text-lg mb-8">
            Join thousands of users already enjoying seamless video calls
          </p>
          <Link to="/auth">
            <button className="px-10 py-4 bg-white text-indigo-600 rounded-xl text-lg font-semibold hover:bg-gray-50 hover:shadow-xl hover:scale-105 transition-all duration-300">
              Start Free Today
            </button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 py-8 text-center border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">VConnect</span>
          </div>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} VConnect. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}