import React, { useContext, useState } from "react";
import WithAuth from "../utils/WithAuth.jsx";
import { useNavigate } from "react-router-dom";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contents/AuthContext.jsx";

function Home() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    if (meetingCode.trim()) {
      navigate(`/${meetingCode}`);
    } else {
      alert("Please enter a meeting code");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 to-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-600">VConnect</h1>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition"
            onClick={() => {
                navigate("/history");
            }}
          >
            <RestoreIcon fontSize="small" />
            <span className="text-sm font-medium">History</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-1 flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24 py-12">
        {/* Left Panel */}
        <div className="flex flex-col items-start max-w-lg space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Providing <span className="text-indigo-600">Quality</span> Video
            Calls
          </h1>

          <p className="text-gray-600 text-lg">
            Connect with your team seamlessly through high-quality, low-latency
            video calls.
          </p>

          <div className="flex w-full max-w-md gap-3 mt-4">
            <input
              type="text"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              placeholder="Enter meeting code"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleJoinVideoCall}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              Join
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="mt-12 md:mt-0 md:w-1/2 flex justify-center">
          <img
            src="/Call.svg"
            alt="Video call illustration"
            className="w-full max-w-md object-contain"
          />
        </div>
      </main>
    </div>
  );
}

export default WithAuth(Home);
