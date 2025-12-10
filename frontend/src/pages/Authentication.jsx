import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { AuthContext } from "../contents/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Lock, UserPlus, LogIn, Sparkles } from "lucide-react";

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
  const [formState, setFormState] = useState(0);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const switchTo = (state) => {
    setFormState(state);
    setError("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 opacity-30">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl rounded-3xl bg-white/95 backdrop-blur-xl border-0 overflow-hidden">
          
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <CardContent className="p-10">
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Typography
                variant="h4"
                className="text-center font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2"
              >
                Welcome to VConnect
              </Typography>
              <Typography
                variant="body2"
                className="text-center text-gray-500 mb-8"
              >
                {formState === 0
                  ? "Create an account to get started"
                  : "Sign in to continue your journey"}
              </Typography>
            </motion.div>

            <div className="relative flex gap-2 mb-8 p-1 bg-gray-100 rounded-2xl">
              <motion.div
                animate={{
                  x: formState === 0 ? 0 : "100%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-1 left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md"
              />
              
              <button
                type="button"
                onClick={() => switchTo(0)}
                className={`relative z-10 flex-1 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                  formState === 0 ? "text-white" : "text-gray-600"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchTo(1)}
                className={`relative z-10 flex-1 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                  formState === 1 ? "text-white" : "text-gray-600"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleAuth}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={formState}
                  initial={{ opacity: 0, x: formState === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: formState === 0 ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {formState === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <TextField
                        fullWidth
                        label="Full Name"
                        variant="outlined"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            "&:hover fieldset": {
                              borderColor: "#6366f1",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#6366f1",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: formState === 0 ? 0.15 : 0.1 }}
                  >
                    <TextField
                      fullWidth
                      label="Username"
                      type="text"
                      variant="outlined"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "&:hover fieldset": {
                            borderColor: "#6366f1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#6366f1",
                          },
                        },
                      }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: formState === 0 ? 0.2 : 0.15 }}
                  >
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      variant="outlined"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "&:hover fieldset": {
                            borderColor: "#6366f1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#6366f1",
                          },
                        },
                      }}
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert severity="error" className="!rounded-xl">
                    {error}
                  </Alert>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  className="!bg-gradient-to-r !from-indigo-500 !to-purple-600 hover:!from-indigo-600 hover:!to-purple-700 !rounded-xl !py-3.5 !text-white !font-semibold !mt-2 !shadow-lg !shadow-indigo-500/30 !transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {formState === 0 ? (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Create Account
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5" />
                          Sign In
                        </>
                      )}
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/80 text-sm mt-6 backdrop-blur-sm"
        >
          © {new Date().getFullYear()} VConnect. All rights reserved.
        </motion.p>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setOpen(false)}
            severity="success"
            className="!rounded-xl !shadow-lg"
          >
            {message}
          </Alert>
        </Snackbar>
      </motion.div>
    </div>
  );
}