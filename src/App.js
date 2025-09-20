import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Home from "./pages/Home";
import Navbar from "./components/Layout/Navbar";
import ForgotPassword from "./components/Auth/ForgetPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import { AuthContext } from "./context/AuthContext";
import CreatePost from "./components/Blog/CreatePost";
import ViewBlog from "./components/Blog/ViewBlog";
import Dashboard from "./components/Layout/DashBoard";
import UserProfile from "./pages/UserProfile";
import { ToastContainer } from "react-toastify";
import MyBlogs from "./components/profile/MyBlogs";
import MyAccount from "./components/profile/MyAccount";
import CommentsTags from "./components/profile/CommentList";
import Subscriptions from "./components/profile/Subscription";
import EditBlog from "./components/Blog/EditBlog";

export default function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/post/:id" element={<ViewBlog />} />
        <Route path="/edit/:id" element={<EditBlog />} /> 

        {/* Protected Pages */}
        <Route
          path="/create-post"
          element={user ? <CreatePost /> : <Navigate to="/login" />}
        />

        {/* Dashboard Pages */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={user ? <UserProfile /> : <Navigate to="/login" />}
        />
        <Route
          path="/myblogs"
          element={user ? <Dashboard><MyBlogs /></Dashboard> : <Navigate to="/login" />}
        />

        <Route
          path="/myaccount"
          element={user ? <MyAccount /> : <Navigate to="/login" />}
        />

        <Route
          path="/comments"
          element={<CommentsTags />}
        />
        <Route
          path="/subscription"
          element={<Subscriptions />}
        />

      </Routes>

      {/* Toast container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}
