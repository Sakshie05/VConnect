import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8000/api/users",
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const router = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      const req = await client.post("/register", { name, username, password });

      if (req.status === 201) {
        return req.data.message;
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      const normalized = new Error(message);
      normalized.status = err.response?.status;
      throw normalized;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const req = await client.post("/login", { username, password });

      if (req.status === 200) {
        localStorage.setItem("token", req.data.token);
        setUserData(req.data.user || { username });
        return req.data.message;
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      const normalized = new Error(message);
      normalized.status = err.response?.status;
      throw normalized;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("get_activities", {
        params: {
          token: localStorage.getItem("token"),
        },
      });
      return request.data;
    } catch (err) {
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post("add_activity", {
        token: localStorage.getItem("token"),
        meetingCode: meetingCode,
      });

      return request;
    } catch (err) {
      throw err;
    }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    getHistoryOfUser,
    addToUserHistory,
    handleLogin,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
