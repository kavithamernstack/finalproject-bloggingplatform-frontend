import React, { useEffect, useState } from "react";
import API from "../../api/api";
import BlogCard from "./ViewBlog";

export default function BlogList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get("/api/posts"); // backend endpoint to get posts
        console.log("API Response:", res.data);

        // Handle both cases: array or { posts: [...] }
        if (Array.isArray(res.data.items)) {
          setPosts(res.data.items);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.isArray(posts) && posts.length > 0 ? (
        posts.map((post) => <BlogCard key={post._id} post={post} />)
      ) : (
        <p className="col-span-full text-center text-gray-500">
          No posts found
        </p>
      )}
    </div>
  );
}
