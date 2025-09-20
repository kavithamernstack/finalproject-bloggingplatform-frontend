import React, { useEffect, useState, useContext } from "react";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";

export default function Subscriptions() {
  const { user } = useContext(AuthContext);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data } = await api.get("/subscription/feed", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFeed(data);
      } catch (err) {
        console.error("Error fetching subscription feed:", err);
      }
    };
    fetchFeed();
  }, [user]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">📌 Subscribed Posts</h2>
      {feed.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">Title</th>
              <th className="border p-2">Author</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {feed.map((post) => (
              <tr key={post._id} className="hover:bg-gray-50">
                <td className="border p-2">{post.title}</td>
                <td className="border p-2">{post.author?.name}</td>
                <td className="border p-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No subscriptions yet.</p>
      )}
    </div>
  );
}
