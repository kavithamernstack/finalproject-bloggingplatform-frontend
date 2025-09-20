// components/Subscriptions/Subscriptions.js
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import Dashboard from "../Layout/DashBoard";
import { UserIcon, TagIcon } from "@heroicons/react/24/solid";

export default function Subscriptions() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("bloggers");
  const [bloggerSubs, setBloggerSubs] = useState([]);
  const [categorySubs, setCategorySubs] = useState([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        if (!user) return;

        //  Blogger Subscriptions
        const { data: bloggers } = await api.get("/api/subscriptions/bloggers", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBloggerSubs(bloggers);

        // Category Subscriptions (blogs from subscribed categories)
        const { data } = await api.get("/api/subscriptions/categories", {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { t: Date.now() } // bypass cache
        });
        setCategorySubs(data); // ✅ fixed
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
      }
    };

    fetchSubscriptions();
  }, [user]);

  // Unsubscribe blogger
  const handleUnsubscribeBlogger = async (bloggerId) => {
    try {
      await api.delete(`/api/subscription/${bloggerId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBloggerSubs((prev) => prev.filter((b) => b._id !== bloggerId));
    } catch (err) {
      console.error("Error unsubscribing:", err);
    }
  };

  return (
    <Dashboard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Subscriptions</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("bloggers")}
            className={`px-6 py-2 font-medium rounded-t-md transition ${activeTab === "bloggers"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Bloggers
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-2 font-medium rounded-t-md transition ${activeTab === "categories"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Categories
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Bloggers Tab */}
          {activeTab === "bloggers" && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <UserIcon className="h-6 w-6 text-blue-600" />
                Subscribed Bloggers
              </h2>

              {bloggerSubs.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bloggerSubs.map((b) => (
                    <div
                      key={b._id}
                      className="border rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-lg transition"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{b.name}</h3>
                        <p className="text-gray-500">@{b.username}</p>
                      </div>
                      <button
                        onClick={() => handleUnsubscribeBlogger(b._id)}
                        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No blogger subscriptions yet.</p>
              )}
            </>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <TagIcon className="h-6 w-6 text-green-600" />
                Blogs from Subscribed Categories
              </h2>

              {categorySubs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-xl">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-6 text-left">Title</th>
                        <th className="py-3 px-6 text-left">Author</th>
                        <th className="py-3 px-6 text-left">Categories</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySubs.map(blog => (
                        <tr key={blog._id} className="border-t hover:bg-gray-50">
                          <td className="py-3 px-6">{blog.title}</td>
                          <td className="py-3 px-6">{blog.author?.name}</td>
                          <td className="py-3 px-6">
                            {blog.categories?.map(cat => cat.name).join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No blogs from your subscribed categories yet.</p>
              )}
            </>
          )}
        </div>
      </div>
    </Dashboard>
  );
}
