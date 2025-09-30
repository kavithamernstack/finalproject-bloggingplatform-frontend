import React, { useEffect, useState, useContext } from "react";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function MyBlogs() {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("published");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!user) return;

      try {
        const res = await api.get("/posts/myposts", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const mappedBlogs = res.data.map((blog) => ({
          id: blog._id,
          title: blog.title,
          status: blog.status,
          publishedAt: blog.createdAt,
          categories: blog.categories?.map((c) => c.name) || [],
        }));

        setBlogs(mappedBlogs);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to fetch blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [user]);

  if (!user) return <p className="p-6 text-gray-500">Please login to see your blogs.</p>;

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBlogs((prevBlogs) => prevBlogs.filter((b) => b.id !== id));
      toast.success(res.data.message || "Blog deleted successfully!");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete blog.";
      console.error("Error deleting blog:", message);
      toast.error(message);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      const res = await api.put(`/posts/unpublish/${id}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBlogs(blogs.map((b) => (b.id === id ? { ...b, status: res.data.status } : b)));
      toast.success("Blog unpublished successfully!");
    } catch (err) {
      console.error("Error unpublishing blog:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to unpublish blog.");
    }
  };

  const handlePublishDraft = async (id) => {
    try {
      const res = await api.put(`/posts/${id}`, { status: "published" }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBlogs(blogs.map((b) => (b.id === id ? { ...b, status: res.data.status } : b)));
      toast.success("Draft published successfully!");
    } catch (err) {
      console.error("Error publishing draft:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to publish draft.");
    }
  };

  const handleUpdate = (id) => navigate(`/edit/${id}`);
  const filteredBlogs = blogs.filter((blog) => blog.status === filter);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Blogs</h1>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        {["published", "draft"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`mr-6 pb-2 text-sm font-medium transition ${
              filter === tab ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab === "published" ? "Published" : "Drafts"}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500">Loading blogs...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredBlogs.length === 0 ? (
        <p className="text-gray-500">No {filter} blogs yet.</p>
      ) : (
        <ul className="space-y-4">
          {filteredBlogs.map((blog) => (
            <li key={blog.id} className="flex items-center justify-between bg-white rounded-xl px-5 py-4 shadow-md hover:shadow-lg transition">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 truncate">{blog.title}</h2>
                <p className={`text-xs mt-1 ${blog.status === "draft" ? "text-yellow-600" : "text-green-600"}`}>
                  {blog.status === "draft" ? "Draft" : "Published"} •{" "}
                  {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "N/A"}
                </p>
                {/* <p className="text-sm text-gray-500">Categories: {blog.categories.join(", ")}</p> */}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button onClick={() => handleUpdate(blog.id)} className="px-3 py-1 text-xs bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition">Update</button>

                {blog.status === "draft" && (
                  <button onClick={() => handlePublishDraft(blog.id)} className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                    Publish
                  </button>
                )}

                {blog.status === "published" && (
                  <button onClick={() => handleUnpublish(blog.id)} className="px-3 py-1 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition">Unpublish</button>
                )}

                <button onClick={() => handleDelete(blog.id)} className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyBlogs;
