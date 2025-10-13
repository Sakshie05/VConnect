import { useContext, useState } from "react";
import { motion } from "framer-motion";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
} from "@mui/material";
import { AuthContext } from "../contents/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  const { handleRegister, handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // 0 = Sign Up, 1 = Sign In
  const [formState, setFormState] = useState(0);
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (formState === 0) {
        const res = await handleRegister(
          formData.name,
          formData.username,
          formData.password
        );
        setMessage(res || "User registered successfully");
        setOpen(true);
        setError("");
        setFormState(1);
        setFormData((prev) => ({ ...prev, password: "" }));
      } else {
        const res = await handleLogin(formData.username, formData.password);
        setMessage(res || "Login successful!");
        setOpen(true);
        setError("");
        navigate("/home");
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "Something went wrong!";
      setError(msg);
    }
  };

  const switchTo = (state) => {
    setFormState(state);
    setError("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl rounded-3xl bg-white/95 backdrop-blur-sm border border-gray-200">
          <CardContent className="p-8">
            <Typography
              variant="h5"
              className="text-center font-extrabold text-indigo-700 mb-10"
            >
              {formState === 0
                ? "Create your account"
                : "Sign into your account"}
            </Typography>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-6">
              <Button
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => switchTo(0)}
                className={`!rounded-xl !px-8 !py-3 !font-semibold ${
                  formState === 0
                    ? "!bg-indigo-600 !text-white hover:!bg-indigo-700"
                    : "!border-indigo-600 !text-indigo-600 hover:!bg-indigo-50"
                }`}
              >
                Sign Up
              </Button>

              <Button
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => switchTo(1)}
                className={`!rounded-xl !px-8 !py-3 !font-semibold ${
                  formState === 1
                    ? "!bg-indigo-600 !text-white hover:!bg-indigo-700"
                    : "!border-indigo-600 !text-indigo-600 hover:!bg-indigo-50"
                }`}
              >
                Sign In
              </Button>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleAuth}>
              {formState === 0 && (
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  InputLabelProps={{ style: { color: "#374151" } }}
                  required
                />
              )}

              <TextField
                fullWidth
                label="Username"
                type="text"
                variant="outlined"
                name="username"
                value={formData.username}
                onChange={handleChange}
                InputLabelProps={{ style: { color: "#374151" } }}
                required
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                name="password"
                value={formData.password}
                onChange={handleChange}
                InputLabelProps={{ style: { color: "#374151" } }}
                required
              />

              {error && (
                <p className="text-red-500 text-sm font-medium text-center">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="!bg-indigo-600 !hover:bg-indigo-700 !rounded-xl !py-3 !text-white !font-semibold !mt-2"
              >
                {formState === 0 ? "Sign Up" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} VConnect. All rights reserved.
        </p>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          message={message}
          onClose={() => setOpen(false)}
        />
      </motion.div>
    </div>
  );
}
