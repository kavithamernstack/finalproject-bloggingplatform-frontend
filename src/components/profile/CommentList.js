import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import Dashboard from "../Layout/DashBoard";
import { toast } from "react-toastify";

export default function CommentsTags() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("comments");
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [tags, setTags] = useState([]); // blogs + tags
  const [newTag, setNewTag] = useState({}); // new tag input per blog
  const [showAddInput, setShowAddInput] = useState({}); // show input when adding tag
  const [editingTag, setEditingTag] = useState({}); // editing tag state

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get("/comments/my", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setComments(data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    if (user) fetchComments();
  }, [user]);

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await api.put(
        `/comments/${id}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComments(comments.map((c) => (c._id === id ? data : c)));
      setEditingId(null);
      toast.success("Comment updated");
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/comments/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setComments(comments.filter((c) => c._id !== id));
      toast.success("Comment deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Fetch user blogs and their tags
  useEffect(() => {
    const fetchUserBlogsTags = async () => {
      try {
        if (!user) return;

        const { data } = await api.get("/posts/myposts", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        // Use backend _id for tags
        const allTags = data.map((blog) => ({
          blogId: blog._id,
          blogTitle: blog.title || "Untitled",
          tags: (blog.tags || []).map((t) =>
            typeof t === "string" ? { _id: t, name: t } : t
          ),
        }));


        setTags(allTags);
      } catch (err) {
        console.error("Error fetching user blogs and tags:", err);
        toast.error("Failed to load tags");
      }
    };

    fetchUserBlogsTags();
  }, [user]);

  // Add tag
  const handleAddTag = async (blogId) => {
    const tagName = newTag[blogId]?.trim();
    if (!tagName) return toast.error("Tag name cannot be empty");

    try {
      const { data } = await api.post(
        `/tags/${blogId}`, // backend expects blogId
        { name: tagName },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setTags((prev) =>
        prev.map((b) =>
          b.blogId === blogId ? { ...b, tags: [...b.tags, data] } : b
        )
      );
      setNewTag({ ...newTag, [blogId]: "" });
      setShowAddInput({ ...showAddInput, [blogId]: false });
      toast.success("Tag added");
    } catch (err) {
      console.error("Add tag error:", err);
      toast.error("Failed to add tag");
    }
  };

  // Start editing a tag
  const handleEditTag = (blogId, tag) => {
    setEditingTag({ blogId, tagId: tag._id, name: tag.name });
  };

  // Save edited tag
  const saveEditTag = async () => {
    const { blogId, tagId, name } = editingTag;
    if (!name.trim()) return toast.error("Tag name cannot be empty");

    try {
      const { data } = await api.put(
        `/tags/${tagId}`, // backend expects tag _id
        { name },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setTags((prev) =>
        prev.map((b) =>
          b.blogId === blogId
            ? { ...b, tags: b.tags.map((t) => (t._id === tagId ? data : t)) }
            : b
        )
      );
      setEditingTag({});
      toast.success("Tag updated");
    } catch (err) {
      console.error("Edit tag error:", err);
      toast.error("Failed to update tag");
    }
  };

  // Delete tag
  const handleDeleteTag = async (blogId, tagId) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;

    try {
      await api.delete(`/tags/${tagId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setTags((prev) =>
        prev.map((b) =>
          b.blogId === blogId
            ? { ...b, tags: b.tags.filter((t) => t._id !== tagId) }
            : b
        )
      );
      toast.success("Tag deleted");
    } catch (err) {
      console.error("Delete tag error:", err);
      toast.error("Failed to delete tag");
    }
  };

  return (
    <Dashboard>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Comments & Tags
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-6 py-2 font-medium rounded-t-md transition ${activeTab === "comments"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`px-6 py-2 font-medium rounded-t-md transition ${activeTab === "tags"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Tags
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {/* COMMENTS TAB */}
          {activeTab === "comments" && (
            <>
              {comments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Blog Title
                        </th>
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Comment
                        </th>
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {comments.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {c.post?.title || "Untitled"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {editingId === c._id ? (
                              <div className="flex flex-col gap-2">
                                <textarea
                                  className="border rounded w-full p-2 text-gray-800"
                                  value={editContent}
                                  onChange={(e) =>
                                    setEditContent(e.target.value)
                                  }
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveEdit(c._id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              c.content
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {new Date(c.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 flex justify-center gap-2">
                            {editingId !== c._id && (
                              <>
                                <button
                                  onClick={() => handleEdit(c)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteComment(c._id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No comments yet.</p>
              )}
            </>
          )}

          {/* TAGS TAB */}
          {activeTab === "tags" && (
            <>
              {tags.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {tags.map((blog) => (
                    <div
                      key={blog.blogId}
                      className="bg-white border border-gray-200 rounded-lg shadow-md p-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {blog.blogTitle}
                      </h3>

                      <div className="flex flex-wrap gap-2 items-center">
                        {blog.tags.map((tag) =>
                          editingTag.tagId === tag._id ? (
                            <div
                              key={tag._id}
                              className="flex gap-2 items-center"
                            >
                              <input
                                type="text"
                                value={editingTag.name}
                                onChange={(e) =>
                                  setEditingTag({
                                    ...editingTag,
                                    name: e.target.value,
                                  })
                                }
                                className="border px-2 py-1 rounded text-sm"
                              />
                              <button
                                onClick={saveEditTag}
                                className="text-green-600 hover:underline text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingTag({})}
                                className="text-gray-600 hover:underline text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span
                              key={tag._id}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1"
                            >
                              {tag.name}
                              <button
                                onClick={() =>
                                  handleEditTag(blog.blogId, tag)
                                }
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteTag(blog.blogId, tag._id)
                                }
                                className="text-red-600 hover:underline text-xs"
                              >
                                Delete
                              </button>
                            </span>
                          )
                        )}

                        {!showAddInput[blog.blogId] && (
                          <button
                            onClick={() =>
                              setShowAddInput({
                                ...showAddInput,
                                [blog.blogId]: true,
                              })
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            + Add Tag
                          </button>
                        )}
                      </div>

                      {showAddInput[blog.blogId] && (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="New tag"
                            value={newTag[blog.blogId] || ""}
                            onChange={(e) =>
                              setNewTag({
                                ...newTag,
                                [blog.blogId]: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 flex-1"
                          />
                          <button
                            onClick={() => handleAddTag(blog.blogId)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Add
                          </button>
                          <button
                            onClick={() =>
                              setShowAddInput({
                                ...showAddInput,
                                [blog.blogId]: false,
                              })
                            }
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  You have no blogs yet to manage tags.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Dashboard>
  );
}
