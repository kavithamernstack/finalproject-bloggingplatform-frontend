import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import {
  FaLaptop,
  FaHeart,
  FaBook,
  FaPen,
  FaGraduationCap,
  FaFire,
  FaGlobe,
  FaSun,
  FaUtensils,
  FaPlane,
  FaFootballBall,
} from "react-icons/fa";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Icon + color map
  const categoryMap = {
    Technology: { icon: FaLaptop, color: "text-blue-500" },
    Health: { icon: FaHeart, color: "text-red-500" },
    Education: { icon: FaGraduationCap, color: "text-green-500" },
    Lifestyle: { icon: FaPen, color: "text-pink-500" },
    Entertainment: { icon: FaFire, color: "text-yellow-500" },
    Books: { icon: FaBook, color: "text-purple-500" },
    Travel: { icon: FaPlane, color: "text-teal-500" },
    Nature: { icon: FaSun, color: "text-green-400" },
    Food: { icon: FaUtensils, color: "text-orange-500" },
    Sports: { icon: FaFootballBall, color: "text-indigo-500" },
    All: { icon: FaGlobe, color: "text-gray-500" },
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        const cats = [
          { _id: "all", name: "All", slug: "all", ...categoryMap["All"] },
        ];
        res.data.forEach((c) => {
          cats.push({
            _id: c._id,
            name: c.name,
            slug: c.slug,
            ...(categoryMap[c.name] || { icon: FaGlobe, color: "text-gray-500" }),
          });
        });
        setCategories(cats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/posts");
        setPosts(res.data.items || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

 
// Filter posts by category + search
useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const categorySlug = queryParams.get("category") || "all";
  const search = queryParams.get("search")?.toLowerCase() || "";

  let filtered = [...posts];

  // Category filter
  if (categorySlug !== "all" && categories.length > 0) {
    const selectedCat = categories.find((c) => c.slug === categorySlug);

    if (selectedCat?._id && selectedCat._id !== "all") {
      filtered = filtered.filter((p) => {
        if (!Array.isArray(p.categories)) return false;

        // Case 1: string IDs
        if (typeof p.categories[0] === "string") {
          return p.categories.includes(selectedCat._id);
        }

        // Case 2: object refs
        if (typeof p.categories[0] === "object") {
          return p.categories.some((c) => c._id === selectedCat._id);
        }

        return false;
      });
    }
  }

  // ✅ Search filter
  if (search) {
    filtered = filtered.filter((p) => {
      const titleMatch = p.title?.toLowerCase().includes(search);
      const excerptMatch = p.excerpt?.toLowerCase().includes(search);

      // Handle author (string or populated object)
      const authorMatch =
        typeof p.author === "string"
          ? p.author.toLowerCase().includes(search)
          : p.author?.name?.toLowerCase().includes(search);

      // Handle categories (array of ids or objects)
      const categoryMatch = Array.isArray(p.categories)
        ? p.categories.some((cat) =>
            typeof cat === "string"
              ? categories.find((c) => c._id === cat)?.name
                  ?.toLowerCase()
                  .includes(search)
              : cat.name?.toLowerCase().includes(search)
          )
        : false;

      return titleMatch || excerptMatch || authorMatch || categoryMatch;
    });
  }

  setFilteredPosts(filtered);
}, [location.search, posts, categories]);


  // Handle category click
  const handleCategoryClick = (slug) => {
    const queryParams = new URLSearchParams(location.search);
    if (slug === "all") {
      queryParams.delete("category");
    } else {
      queryParams.set("category", slug);
    }
    navigate(`/?${queryParams.toString()}`);
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Share Your Voice, Inspire the World
          </h1>
          <p className="text-[14px] md:text-xl text-gray-700 max-w-3xl mx-auto mb-10">
            Welcome to PostHub — a place to write, connect, and explore. Publish
            your ideas, inspire readers, and discover stories from passionate
            writers across the globe.
          </p>
          <Link
            to="/create-post"
            className="inline-block px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition"
          >
            Start Writing
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Explore Categories
          </h2>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            {categories.map((category) => {
              const activeCategory =
                new URLSearchParams(location.search).get("category") || "all";
              const isActive = activeCategory === category.slug;

              return (
                <div
                  key={category._id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className={`flex flex-col items-center w-24 h-24 bg-white shadow rounded-xl p-6 cursor-pointer transition-all ${isActive
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : "hover:shadow-lg hover:-translate-y-1"
                    }`}
                >
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                  <span className="mt-2 text-xs font-medium text-gray-700 text-center">
                    {category.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Latest Articles
          </h2>

          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 ">
              {filteredPosts.map((post) => {
                const bannerUrl = post.banner
                  ? `${REACT_APP_API}${post.banner.startsWith("/") ? post.banner : "/" + post.banner
                  }`
                  : "/default-banner.jpg";

                // Show first category name (fallback if empty)
                const categoryName =
                  Array.isArray(post.categories) && post.categories.length > 0
                    ? typeof post.categories[0] === "string"
                      ? categories.find((c) => c._id === post.categories[0])?.name
                      : post.categories[0].name
                    : "Uncategorized";

                return (
                  <div
                    key={post._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
                  >
                    <img
                      src={bannerUrl}
                      alt={post.title}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <span className="block text-xs text-gray-400 mt-1 px-2 py-1 w-25 bg-slate-400 text-white text-xs font-medium rounded-full">
                        {categoryName}
                      </span>
                      <Link
                        to={`/post/${post._id}`}
                        className="mt-3 inline-block text-blue-600 hover:underline text-sm font-medium"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No posts available yet.</p>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
