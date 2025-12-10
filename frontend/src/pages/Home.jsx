import React, { useContext, useState } from "react";
import WithAuth from "../utils/WithAuth.jsx";
import { useNavigate } from "react-router-dom";
import RestoreIcon from "@mui/icons-material/Restore";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import LogoutIcon from "@mui/icons-material/Logout";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { AuthContext } from "../contents/AuthContext.jsx";

function Home() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { addToUserHistory } = useContext(AuthContext);

  const generateMeetingCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleJoinVideoCall = async () => {
    if (meetingCode.trim()) {
      await addToUserHistory(meetingCode);
      navigate(`/${meetingCode}`);
    } else {
      alert("Please enter a meeting code");
    }
  };

  const handleCreateMeeting = async () => {
    const newCode = generateMeetingCode();
    await addToUserHistory(newCode);
    navigate(`/${newCode}`);
  };

  const handleCopyCode = () => {
    if (meetingCode.trim()) {
      navigator.clipboard.writeText(meetingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl top-1/3 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -bottom-48 left-1/3 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <VideoCallIcon className="text-white" sx={{ fontSize: 24 }} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            VConnect
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 font-medium"
          >
            <RestoreIcon fontSize="small" />
            <span className="hidden sm:inline text-sm">History</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
          >
            <LogoutIcon fontSize="small" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-1 flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-24 py-12 gap-12">
        
        <div className="flex flex-col items-start max-w-2xl space-y-8 w-full md:w-1/2">
          <div className="space-y-4">
            <div className="inline-block">
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                ✨ Premium Video Experience
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Providing{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quality
              </span>{" "}
              Video Calls
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed">
              Connect with your team seamlessly through high-quality, low-latency
              video calls. Start or join a meeting instantly.
            </p>
          </div>

          <div className="w-full space-y-4">
            
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Join a Meeting
              </h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && meetingCode.trim()) {
                        handleJoinVideoCall();
                      }
                    }}
                    placeholder="Enter meeting code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                  {meetingCode && (
                    <button
                      onClick={handleCopyCode}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <span className="text-green-600 text-xs font-medium">✓ Copied</span>
                      ) : (
                        <ContentCopyIcon fontSize="small" />
                      )}
                    </button>
                  )}
                </div>
                <button
                  onClick={handleJoinVideoCall}
                  disabled={!meetingCode.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Join
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-gray-400 text-sm font-medium">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            <button
              onClick={handleCreateMeeting}
              className="group w-full px-6 py-4 bg-white/80 backdrop-blur-lg border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <VideoCallIcon className="text-white" sx={{ fontSize: 28 }} />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-gray-900">Start Instant Meeting</div>
                <div className="text-sm text-gray-600">Create a new meeting room</div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full pt-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <div className="text-2xl font-bold text-indigo-600">HD</div>
              <div className="text-xs text-gray-600 mt-1">Quality</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <div className="text-2xl font-bold text-indigo-600">Fast</div>
              <div className="text-xs text-gray-600 mt-1">Connection</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <div className="text-2xl font-bold text-indigo-600">Secure</div>
              <div className="text-xs text-gray-600 mt-1">Encrypted</div>
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-1/2 flex justify-center items-center">
          <div className="relative">
            
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl"></div>
            
            <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
              <img
                src="/Call.svg"
                alt="Video call illustration"
                className="w-full max-w-md object-contain drop-shadow-2xl"
              />
            </div>

            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-xl animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-20 blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 md:px-12 py-8 bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl">🎥</div>
            <h4 className="font-semibold text-gray-900">Crystal Clear Video</h4>
            <p className="text-sm text-gray-600">HD quality with adaptive streaming</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🔒</div>
            <h4 className="font-semibold text-gray-900">Secure & Private</h4>
            <p className="text-sm text-gray-600">End-to-end encrypted calls</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">⚡</div>
            <h4 className="font-semibold text-gray-900">Lightning Fast</h4>
            <p className="text-sm text-gray-600">Instant connection, no delays</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default WithAuth(Home);