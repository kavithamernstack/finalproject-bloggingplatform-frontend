import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Sidebar({ children }) {
  const location = useLocation();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "My Account", path: "/myaccount" },
    { name: "Create Post", path: "/create-post" },
    { name: "My Blogs", path: "/myblogs" },
    { name: "Comments and Tags", path: "/comments" },
    { name: "Subscriptions", path: "/subscription" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <div className="w-full">
        <Navbar />
      </div>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar (Sticky Left) */}
        <aside className="bg-gray-800 text-white w-64 p-6 border-r border-gray-700 sticky top-0 h-screen">
          <h2 className="font-bold text-xl mb-6 text-gray-200">Dashboard</h2>
          <ul className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`text-gray-300 p-2 rounded-md transition-all 
                              hover:text-white hover:bg-gray-700 
                              ${location.pathname === item.path ? "bg-gray-700 text-white" : ""}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right side content (scrollable) */}
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
