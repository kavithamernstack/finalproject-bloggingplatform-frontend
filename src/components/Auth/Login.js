import React, { useState, useContext } from "react";
import api from "../../api/api"
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user); 
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-stone-50 to-slate-300 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-6">Login to your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-blue-600 text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-500 mt-4 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );

}
