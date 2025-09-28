import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { toast } from "react-toastify";
import RichTextEditor from "./RichTextEditor";
import { ErrorBoundary } from "../common/ErrorBoundary";
import Navbar from "../Layout/Navbar";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { AuthContext } from "../../context/AuthContext";

export default function EditBlog() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    // States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]); 
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [banner, setBanner] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [loading, setLoading] = useState(true);

    const safeJSONParse = (data, fallback) => {
        try {
            return typeof data === "string" ? JSON.parse(data) : data;
        } catch {
            return fallback;
        }
    };

    // Fetch post details
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${id}`);
                const post = res.data;

                setTitle(post.title || "");
                setDescription(post.excerpt || "");
                setContent(post.content || "");
                setCategory(post.categories?.[0]?._id || "");
                setTags(post.tags || []);

                if (post.banner) {
                    setBannerPreview(
                        post.banner.startsWith("http")
                            ? post.banner
                            : `http://localhost:5000${post.banner}`
                    );
                }
            } catch (err) {
                console.error("Error fetching post:", err);
                toast.error("Failed to load post details");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    // Fetch all categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/api/categories"); // points to /api/categories
                setCategories(res.data); // [{_id, name}, ...]
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                toast.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    // Banner change
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
            setBanner(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    // Tags
    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };
    const handleRemoveTag = (tag) => setTags(tags.filter((t) => t !== tag));

    // Submit / Update post
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("excerpt", description);
            formData.append("content", content);
            formData.append("categories", JSON.stringify([category])); // ✅ Send category _id
            formData.append("tags", JSON.stringify(tags));
            if (banner) formData.append("banner", banner);

            await api.put(`/api/posts/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Post updated successfully!", {
                position: "top-center",
                autoClose: 3000,
            });
            navigate("/myblogs");
        } catch (err) {
            console.error(err.response?.data);
            toast.error(
                `Failed to update: ${err.response?.data?.message || "Server Error"}`
            );
        }
    };

    if (loading) return <p className="text-center mt-10">Loading post...</p>;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-slate-300 py-10 px-4">
                <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-10 border border-gray-200">
                    <h2 className="text-3xl font-extrabold text-center text-black mb-8 flex items-center justify-center gap-2">
                        <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
                        Edit Blog Post
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Post Title</label>
                            <input
                                type="text"
                                placeholder="Enter your post title"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Short Description</label>
                            <input
                                type="text"
                                placeholder="Enter your post description"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Banner */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Upload Banner Image</label>
                            <input
                                id="banner-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleBannerChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="banner-upload"
                                className="cursor-pointer inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
                            >
                                Choose Image
                            </label>
                            {bannerPreview && (
                                <div className="mt-4 relative inline-block">
                                    <img src={bannerPreview} alt="Banner Preview" className="w-full max-h-64 object-cover rounded-lg shadow-md" />
                                    <button
                                        type="button"
                                        onClick={() => { URL.revokeObjectURL(bannerPreview); setBanner(null); setBannerPreview(null); }}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-md"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Tags</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Enter a tag"
                                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                />
                                <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">Add</button>
                            </div>
                            <div className="flex flex-wrap mt-2">
                                {tags.map((tag, idx) => (
                                    <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mr-2 mb-2 flex items-center">
                                        {tag}
                                        <button type="button" className="ml-2 text-red-500 font-bold" onClick={() => handleRemoveTag(tag)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Post Content</label>
                            <ErrorBoundary>
                                <RichTextEditor value={content} onChange={setContent} />
                            </ErrorBoundary>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Update Post</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
