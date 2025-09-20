import React, { useEffect, useState, useContext } from "react";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { API_BASE } from '../../utils/constant'
import Dashboard from "../Layout/DashBoard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaBook,
  FaCheckCircle,
  FaRegFileAlt,
  FaEye,
} from "react-icons/fa";

function MyAccount() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    drafts: 0,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const { data: profileData } = await api.get("/users/myprofile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfile(profileData);

        const { data: statsData } = await api.get("/analytics/mystats", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching account data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <Dashboard>
        <p className="p-6 text-gray-500">Please login to view account.</p>
      </Dashboard>
    );
  }

  if (loading) {
    return (
      <Dashboard>
        <p className="p-6 text-gray-500">Loading account data...</p>
      </Dashboard>
    );
  }

  const activityData = [
    { name: "Views", value: stats.views },
    { name: "Likes", value: stats.likes },
    { name: "Comments", value: stats.comments },
    { name: "Shares", value: stats.shares },
  ];

  const COLORS = ["#A5B4FC", "#86EFAC", "#FDE68A", "#FCA5A5"]; // lighter colors

  return (
    <Dashboard>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Account</h1>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-6 hover:shadow-md transition mb-8">
          <img
            src={
              user?.avatar
                ? user.avatar.startsWith("http")
                  ? user.avatar
                  : `${API_BASE}${user.avatar}`
                : "https://via.placeholder.com/80"
            }
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-indigo-500 font-medium">@{profile.username}</p>
            <p className="text-sm text-gray-600">{profile.email}</p>
            {profile.bio && (
              <p className="mt-2 text-gray-700 text-sm italic">“{profile.bio}”</p>
            )}
          </div>
        </div>

        {/* Stats Cards (lighter colors) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Blogs",
              value: stats.totalBlogs,
              icon: <FaBook />,
              bg: "bg-indigo-100 text-indigo-700",
            },
            {
              label: "Published",
              value: stats.publishedBlogs,
              icon: <FaCheckCircle />,
              bg: "bg-green-100 text-green-700",
            },
            {
              label: "Drafts",
              value: stats.drafts,
              icon: <FaRegFileAlt />,
              bg: "bg-yellow-100 text-yellow-700",
            },
            {
              label: "Views",
              value: stats.views,
              icon: <FaEye />,
              bg: "bg-pink-100 text-pink-700",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.bg} rounded-xl shadow-sm p-5 flex flex-col items-center hover:shadow-md transition`}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              📊 Post Activity
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#93C5FD" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              🍩 Engagement Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index]}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

export default MyAccount;
