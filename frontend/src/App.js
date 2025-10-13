import { Route, BrowserRouter as Router, Routes } from "react-router";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/Authentication";
import { AuthProvider } from "./contents/AuthContext";
import VideoMeet from "./pages/VideoMeet";
import Home from "./pages/Home";
import History from "./pages/History";

function App() {
  return (
    <div>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />}></Route>
            <Route path="/auth" element={<Authentication />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/history" element={<History />}></Route>
            <Route path="/:url" element={<VideoMeet />}></Route>
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
