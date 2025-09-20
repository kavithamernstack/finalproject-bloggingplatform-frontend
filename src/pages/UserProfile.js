import { useState, useEffect, useContext } from "react";
import api from "../api/api";
import { FaUserEdit, FaLock, FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import Navbar from "../components/Layout/Navbar";
import { AuthContext } from "../context/AuthContext";

function Sidebar({ selected, setSelected }) {
  return (
    <div className="w-64 bg-gray-100 min-h-screen p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-8">Settings</h2>
      <ul className="space-y-4">
        <li>
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left ${selected === "profile" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`}
            onClick={() => setSelected("profile")}
          >
            <FaUserEdit /> Edit Profile
          </button>
        </li>
        <li>
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left ${selected === "password" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`}
            onClick={() => setSelected("password")}
          >
            <FaLock /> Change Password
          </button>
        </li>
      </ul>
    </div>
  );
}

function EditProfile() {
  const { user: contextUser, setUser: setContextUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `${process.env.REACT_APP_API}${user.avatar}` : "");

  // Fetch logged-in user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/myprofile");
        setUser(data);
        setAvatarPreview(data.avatar || "");
        setContextUser(data); // initialize context
      } catch (err) {
        console.error("fetchProfile error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setContextUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file); 
      setUser({ ...user, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };


  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await api.put("/users/updateprofile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      //  Update AuthContext so Navbar & MyAccount update instantly
      setUser((prev) => ({
        ...prev,
        name: res.data.user.name,
        bio: res.data.user.bio,
        avatar: res.data.user.avatar, // updated avatar path from backend
      }));

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile");
    }
  };


  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user data found</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={
            avatarPreview
              ? avatarPreview.startsWith("blob:")
                ? avatarPreview
                : avatarPreview.startsWith("http")
                  ? avatarPreview
                  : `${process.env.REACT_APP_API}${avatarPreview}`
              : "https://via.placeholder.com/120"
          }
          alt="avatar"
          className="w-28 h-28 rounded-full border-4 border-gray-200 mb-3 object-cover shadow"
        />
        <label className="px-5 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-pointer font-medium hover:bg-blue-200">
          Change Avatar
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </label>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
          <input
            type="text"
            value={user.username || ""}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            placeholder="@username"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
        <textarea
          value={user.bio || ""}
          maxLength={200}
          onChange={(e) => setUser({ ...user, bio: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-blue-400"
          rows={4}
          placeholder="Write a short bio (max 200 characters)"
        />
      </div>

      {/* Social Links */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: FaFacebook, key: "facebook", placeholder: "Facebook" },
            { icon: FaTwitter, key: "twitter", placeholder: "Twitter" },
            { icon: FaLinkedin, key: "linkedin", placeholder: "LinkedIn" },
            { icon: FaWhatsapp, key: "whatsapp", placeholder: "WhatsApp Number" },
          ].map(({ icon: Icon, key, placeholder }) => (
            <div className="flex items-center gap-2" key={key}>
              <Icon className={key === "facebook" ? "text-blue-600" : key === "twitter" ? "text-sky-500" : key === "linkedin" ? "text-blue-700" : "text-green-500"} />
              <input
                type="text"
                placeholder={placeholder}
                value={user.links?.[key] || ""}
                onChange={(e) =>
                  setUser({ ...user, links: { ...user.links, [key]: e.target.value } })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow"
        >
          Save Changes
        </button>
        {message && <p className="text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
}

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/change-password", { oldPassword, newPassword });
      setMessage("Password updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Error changing password");
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-6">Change Password</h2>
      <form onSubmit={handleChange} className="space-y-4 max-w-md">
        <input
          type="password"
          placeholder="Current Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [selected, setSelected] = useState("profile");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar selected={selected} setSelected={setSelected} />
        <div className="flex-1 bg-white min-h-screen">
          {selected === "profile" && <EditProfile />}
          {selected === "password" && <ChangePassword />}
        </div>
      </div>
    </div>
  );
}
