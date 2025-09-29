import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaHeart,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

export default function ViewBlog() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Fetch post and comments
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);

        const { data: commentsData } = await api.get(`/comments/post/${id}`);
        setComments(commentsData);
      } catch (err) {
        console.error("Error fetching post/comments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data } = await api.post(
        "/comments",
        { postId: id, content: newComment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComments([data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId) => {
    if (!editingText.trim()) return;

    try {
      const { data } = await api.put(
        `/comments/${commentId}`,
        { content: editingText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComments(comments.map(c => (c._id === commentId ? data : c)));
      setEditingCommentId(null);
      setEditingText("");
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  // inside ViewBlog.js

  useEffect(() => {
    const checkSubscribed = async () => {
      if (!user || !post?.author?._id) return;
      try {
        const { data } = await api.get(`/subscriptions/check/${post.author._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSubscribed(data.subscribed);
      } catch (err) {
        console.error("Error checking subscription:", err);
      }
    };
    checkSubscribed();
  }, [user, post]);


  // toggle subscribe
  const handleSubscribe = async () => {
    if (!user) return alert("Login to subscribe.");
    try {
      const { data } = await api.post(
        `/subscriptions/${post.author._id}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSubscribed(data.subscribed);
    } catch (err) {
      console.error("Error subscribing:", err);
    }
  };



  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!post) return <p className="text-center mt-10 text-red-500">Post not found.</p>;

  const shareUrl = window.location.href;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Banner */}
      {post.banner && (
        <div className="mb-8">
          <img
           src={post.banner ? `data:${post.bannerMime};base64,${post.banner}` : "/default-banner.jpg"}
            alt={post.title}
            className="w-full h-72 object-cover rounded-2xl shadow-md"
          />
        </div>
      )}

      {/* Title + Like + Subscribe */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase">{post.title}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setLiked(!liked)} className="text-2xl transition-transform hover:scale-110">
              <FaHeart className={liked ? "text-red-500" : "text-gray-400"} />
            </button>
            <button
              onClick={handleSubscribe}
              className={`px-5 py-1.5 rounded-full font-medium shadow-md text-sm transition ${subscribed ? "bg-green-600 text-white hover:bg-green-700" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              {subscribed ? "Subscribed ✔️" : "Subscribe"}
            </button>

          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span>✍️ {post.author?.username || "Unknown"}</span>
          <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
          {post.categories?.map((c, idx) => (
            <span key={idx} className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full">{c.name}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none mb-10 text-gray-800 leading-relaxed prose-img:rounded-xl prose-img:shadow-lg prose-a:text-blue-600"
        dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
      />

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="px-4 py-1 bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 rounded-full text-sm font-medium hover:from-indigo-200 hover:to-indigo-300 transition"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Social Share */}
      <div className="mb-12 text-center">
        <h3 className="text-lg font-semibold mb-4">Share this post</h3>
        <div className="flex justify-center gap-5">
          {[
            { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, icon: <FaFacebook />, color: "bg-blue-600" },
            { href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, icon: <FaTwitter />, color: "bg-sky-500" },
            { href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`, icon: <FaLinkedin />, color: "bg-blue-700" },
            { href: `https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + shareUrl)}`, icon: <FaWhatsapp />, color: "bg-green-500" },
            { href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}`, icon: <FaEnvelope />, color: "bg-gray-700" },
          ].map((item, i) => (
            <a key={i} href={item.href} target="_blank" rel="noreferrer" className={`${item.color} text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:scale-110 transition`}>
              {item.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div id="comments" className="bg-gray-50 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-6">💬 Comments</h2>

        {/* Add Comment */}
        {user ? (
          <div className="flex mb-6 gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddComment}
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-md"
            >
              Post
            </button>
          </div>
        ) : (
          <p className="text-gray-500 mb-6">Login to post a comment.</p>
        )}

        {/* Show Comments */}
        {comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c._id} className="flex items-start gap-3 bg-white border rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                  {c.author.name ? c.author.name.charAt(0) : "G"}
                </div>
                <div className="flex-1">
                  {editingCommentId === c._id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 border rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        onClick={() => handleEditComment(c._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800">{c.content}</p>
                      <span className="text-xs text-gray-500 block mt-1">
                        by {c.author.name || "Guest"} • {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                {/* Edit/Delete Buttons */}
                {user && String(user._id) === String(c.author._id) && editingCommentId !== c._id && (
                  <div className="flex flex-col gap-1 ml-2">
                    <button onClick={() => { setEditingCommentId(c._id); setEditingText(c.content); }} className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteComment(c._id)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
