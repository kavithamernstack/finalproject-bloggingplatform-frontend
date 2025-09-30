import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from '../../api/api'
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  BellIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { API_BASE } from "../../utils/constants"

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notifications function
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data); // your notifications state
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Poll notifications every 10 seconds
  useEffect(() => {
    fetchNotifications(); // initial fetch
    const interval = setInterval(fetchNotifications, 10000); // every 10s
    return () => clearInterval(interval);
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      // update state here
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Keep input synced with URL (so it resets on home/back)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const q = queryParams.get("search") || "";
    setSearchQuery(q);
  }, [location.search]);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully!", {
      position: "top-center",
      hideProgressBar: true,
      theme: "colored",
      autoClose: 2000,
    });
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/"); // empty search → home
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    navigate("/"); // reset to home page
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            onClick={clearSearch}
            className="flex items-center space-x-2 text-black font-bold text-2xl"
          >
            <PencilSquareIcon className="w-7 h-7" />
            <span className="text-2xl font-bold text-blue-600">Post</span>
            <span className="text-gray-700">Hub</span>
          </Link>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="flex-1 mx-6 hidden md:flex justify-center"
          >
            <div className="relative w-full max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blogs, authors, categories..."
                className="w-full pl-10 pr-10 py-2 rounded-full shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Nav Items */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              onClick={clearSearch}
              className="relative p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
            >
              Home
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
              >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-50">
                  <h3 className="px-4 py-2 font-semibold border-b">
                    Notifications
                  </h3>
                  <ul className="max-h-60 overflow-y-auto">
                    {user && notifications.length > 0 ? (
                      notifications.map((n) => (
                        <li
                          key={n._id}
                          className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${!n.read ? "font-bold bg-gray-50" : ""
                            }`}
                          onClick={() => markAsRead(n._id)}
                        >
                          {n.message}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500">
                        No notifications
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-gray-300"
                >
                  {user.avatar ? (
                    <img src={user.avatar ? `${API_BASE}${user.avatar}` : "https://via.placeholder.com/40"} alt="avatar" className="w-full h-full object-cover" />

                  ) : (
                    <span className="flex items-center justify-center w-full h-full bg-blue-500 text-white font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                    <Link
                      to="/myaccount"
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium hover:bg-gray-300 p-2 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-700 hover:text-blue-600 font-medium hover:bg-gray-300 p-2 rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
